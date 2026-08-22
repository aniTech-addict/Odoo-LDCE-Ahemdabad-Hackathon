import pool from '#root/db.js'
import {
    calculateItineraryRoute,
    getPlaceCoordinates,
    calculateRouteMatrix,
} from '#src/services/locationService.js'
import { solveTSP } from '#src/helpers/solveTSP.js'
import { isTripOwnedByUser, response } from '#src/services/travel/shared.js'

export async function getDailyRouteService(userId, tripId, day_date, mode) {
    const ownsTrip = await isTripOwnedByUser(tripId, userId)
    if (!ownsTrip) {
        return response(404, null, 'Trip not found or unauthorized')
    }

    const itemsRes = await pool.query(
        `SELECT ii.*, a.id as activity_id
         FROM itinerary_items ii
         LEFT JOIN activities a ON ii.activity_id = a.id
         WHERE ii.trip_id = $1 AND ii.day_date = $2
         ORDER BY ii.time_of_day ASC`,
        [tripId, day_date],
    )

    const items = itemsRes.rows
    if (items.length < 2) {
        return response(200, {
            route: null,
            message: 'Need at least 2 itinerary items to calculate a route',
        })
    }

    const coords = []
    for (const item of items) {
        if (item.activity_id) {
            const coord = await getPlaceCoordinates(item.activity_id)
            if (coord) {
                coords.push(coord)
            }
        }
    }

    if (coords.length < 2) {
        return response(200, {
            route: null,
            message:
                'Could not resolve spatial coordinates for at least 2 activities on this day',
        })
    }

    const routeData = await calculateItineraryRoute(coords, mode || 'walk')
    return response(200, routeData, 'Daily route calculated successfully')
}

export async function optimizeItineraryService(userId, tripId, optimizePayload) {
    const { day_date, mode, keepFirstFixed } = optimizePayload

    const ownsTrip = await isTripOwnedByUser(tripId, userId)
    if (!ownsTrip) {
        return response(404, null, 'Trip not found or unauthorized')
    }

    const itemsRes = await pool.query(
        `SELECT ii.*, a.id as activity_id
         FROM itinerary_items ii
         LEFT JOIN activities a ON ii.activity_id = a.id
         WHERE ii.trip_id = $1 AND ii.day_date = $2
         ORDER BY ii.time_of_day ASC`,
        [tripId, day_date],
    )
    const items = itemsRes.rows

    if (items.length < 2) {
        return response(200, items, 'No optimization needed for less than 2 items')
    }

    const optimizableItems = []
    const coords = []
    for (const item of items) {
        if (item.activity_id) {
            const coord = await getPlaceCoordinates(item.activity_id)
            if (coord) {
                optimizableItems.push(item)
                coords.push(coord)
            }
        }
    }

    if (coords.length < 2) {
        return response(
            400,
            null,
            'At least 2 activities with valid coordinates are required to optimize',
        )
    }

    const matrixResult = await calculateRouteMatrix(coords, mode || 'walk')
    if (!matrixResult.matrix || matrixResult.matrix.length !== coords.length) {
        return response(500, null, 'Failed to compute route matrix')
    }

    const shouldKeepFirstFixed = keepFirstFixed !== false
    const bestPath = solveTSP(matrixResult.matrix, shouldKeepFirstFixed)
    const originalTimes = optimizableItems.map(item => item.time_of_day)

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        for (let i = 0; i < bestPath.length; i++) {
            const itemIndex = bestPath[i]
            const itemToUpdate = optimizableItems[itemIndex]
            const newTime = originalTimes[i]

            await client.query(
                'UPDATE itinerary_items SET time_of_day = $1, updated_at = NOW() WHERE id = $2',
                [newTime, itemToUpdate.id],
            )
        }
        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }

    const updatedItemsRes = await pool.query(
        `SELECT ii.*, a.name as activity_name, a.category as activity_category, a.image_url as activity_image
         FROM itinerary_items ii
         LEFT JOIN activities a ON ii.activity_id = a.id
         WHERE ii.trip_id = $1 AND ii.day_date = $2
         ORDER BY ii.time_of_day ASC`,
        [tripId, day_date],
    )

    return response(200, updatedItemsRes.rows, 'Itinerary optimized successfully')
}
