import crypto from 'node:crypto'
import pool from '#root/db.js'
import {
    geocodeCityAndCache,
    getCityActivitiesAndCache,
    calculateItineraryRoute,
    getPlaceCoordinates,
    calculateRouteMatrix,
} from '#src/services/locationService.js'
import { solveTSP } from '#src/helpers/solveTSP.js'

const response = (status, data, message) => ({ status, data, message })

async function isTripOwnedByUser(tripId, userId, client = pool) {
    const tripCheck = await client.query(
        'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
        [tripId, userId],
    )
    return tripCheck.rows.length > 0
}

export async function searchCityService(q) {
    const city = await geocodeCityAndCache(q)
    if (!city) {
        return response(404, null, 'City not found')
    }
    return response(200, city, 'City found')
}

export async function getActivitiesService(cityId, lat, lon, category) {
    let activities = await getCityActivitiesAndCache(cityId, lat, lon)
    if (category) {
        activities = activities.filter(
            act => act.category.toLowerCase() === category.toLowerCase(),
        )
    }

    return response(200, activities, 'Activities fetched successfully')
}

export async function createTripService(userId, tripPayload) {
    const { name, description, start_date, end_date, city_ids } = tripPayload

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const tripId = crypto.randomUUID()

        let coverImageUrl = null
        const cityRes = await client.query('SELECT image_url FROM cities WHERE id = $1', [
            city_ids[0],
        ])
        if (cityRes.rows.length > 0) {
            coverImageUrl = cityRes.rows[0].image_url
        }

        const tripQuery = `
            INSERT INTO trips (id, user_id, name, description, start_date, end_date, status, cover_image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `
        const tripResult = await client.query(tripQuery, [
            tripId,
            userId,
            name,
            description || '',
            start_date,
            end_date,
            'Upcoming',
            coverImageUrl,
        ])

        for (let i = 0; i < city_ids.length; i++) {
            await client.query(
                'INSERT INTO trip_cities (trip_id, city_id, city_order) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                [tripId, city_ids[i], i],
            )
        }

        await client.query('COMMIT')
        return response(201, tripResult.rows[0], 'Trip created successfully')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

export async function listTripsService(userId, status, cityId) {
    const updateStatusQuery = `
        UPDATE trips 
        SET status = CASE 
            WHEN CURRENT_DATE < start_date THEN 'Upcoming'::text
            WHEN CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date THEN 'Ongoing'::text
            ELSE 'Completed'::text
        END
        WHERE user_id = $1 AND status != CASE 
            WHEN CURRENT_DATE < start_date THEN 'Upcoming'::text
            WHEN CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date THEN 'Ongoing'::text
            ELSE 'Completed'::text
        END
    `
    await pool.query(updateStatusQuery, [userId])

    let selectQuery = 'SELECT * FROM trips WHERE user_id = $1 ORDER BY start_date ASC'
    const params = [userId]

    if (status && cityId) {
        selectQuery = `
            SELECT t.* FROM trips t 
            JOIN trip_cities tc ON t.id = tc.trip_id 
            WHERE t.user_id = $1 AND t.status = $2 AND tc.city_id = $3 
            ORDER BY t.start_date ASC
        `
        params.push(status, cityId)
    } else if (status) {
        selectQuery =
            'SELECT * FROM trips WHERE user_id = $1 AND status = $2 ORDER BY start_date ASC'
        params.push(status)
    } else if (cityId) {
        selectQuery = `
            SELECT t.* FROM trips t 
            JOIN trip_cities tc ON t.id = tc.trip_id 
            WHERE t.user_id = $1 AND tc.city_id = $2 
            ORDER BY t.start_date ASC
        `
        params.push(cityId)
    }

    const result = await pool.query(selectQuery, params)
    return response(200, result.rows, 'Trips retrieved successfully')
}

export async function getTripService(userId, id) {
    const updateStatusQuery = `
        UPDATE trips 
        SET status = CASE 
            WHEN CURRENT_DATE < start_date THEN 'Upcoming'::text
            WHEN CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date THEN 'Ongoing'::text
            ELSE 'Completed'::text
        END
        WHERE id = $1 AND status != CASE 
            WHEN CURRENT_DATE < start_date THEN 'Upcoming'::text
            WHEN CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date THEN 'Ongoing'::text
            ELSE 'Completed'::text
        END
    `
    await pool.query(updateStatusQuery, [id])

    const tripRes = await pool.query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [
        id,
        userId,
    ])

    if (tripRes.rows.length === 0) {
        return response(404, null, 'Trip not found')
    }

    const trip = tripRes.rows[0]

    const citiesRes = await pool.query(
        `SELECT c.*, tc.city_order 
         FROM trip_cities tc 
         JOIN cities c ON tc.city_id = c.id 
         WHERE tc.trip_id = $1 
         ORDER BY tc.city_order ASC`,
        [id],
    )
    trip.cities = citiesRes.rows

    const itineraryRes = await pool.query(
        `SELECT ii.*, a.name as activity_name, a.category as activity_category, a.image_url as activity_image
         FROM itinerary_items ii
         LEFT JOIN activities a ON ii.activity_id = a.id
         WHERE ii.trip_id = $1
         ORDER BY ii.day_date ASC, ii.time_of_day ASC`,
        [id],
    )
    trip.itinerary = itineraryRes.rows

    return response(200, trip, 'Trip details retrieved successfully')
}

export async function deleteTripService(userId, id) {
    const result = await pool.query('DELETE FROM trips WHERE id = $1 AND user_id = $2', [
        id,
        userId,
    ])

    if (result.rowCount === 0) {
        return response(404, null, 'Trip not found')
    }

    return response(200, null, 'Trip deleted successfully')
}

export async function addItineraryItemService(userId, tripId, itemPayload) {
    const { activity_id, day_date, time_of_day, title, category, price, notes } =
        itemPayload

    const ownsTrip = await isTripOwnedByUser(tripId, userId)
    if (!ownsTrip) {
        return response(404, null, 'Trip not found or unauthorized')
    }

    const itemId = crypto.randomUUID()

    let imageUrl = null
    if (activity_id) {
        const actRes = await pool.query('SELECT image_url FROM activities WHERE id = $1', [
            activity_id,
        ])
        if (actRes.rows.length > 0) {
            imageUrl = actRes.rows[0].image_url
        }
    }

    const insertQuery = `
        INSERT INTO itinerary_items (id, trip_id, activity_id, day_date, time_of_day, title, category, price, image_url, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `

    const result = await pool.query(insertQuery, [
        itemId,
        tripId,
        activity_id || null,
        day_date,
        time_of_day || null,
        title,
        category || 'General',
        price || 0,
        imageUrl,
        notes || '',
    ])

    return response(201, result.rows[0], 'Itinerary item added successfully')
}

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

export async function updateItineraryItemService(userId, tripId, itemId, itemPayload) {
    const { day_date, time_of_day, title, category, price, notes } = itemPayload

    const ownsTrip = await isTripOwnedByUser(tripId, userId)
    if (!ownsTrip) {
        return response(404, null, 'Trip not found or unauthorized')
    }

    const itemCheck = await pool.query(
        'SELECT id FROM itinerary_items WHERE id = $1 AND trip_id = $2',
        [itemId, tripId],
    )
    if (itemCheck.rows.length === 0) {
        return response(404, null, 'Itinerary item not found')
    }

    const fields = []
    const params = []
    let paramIndex = 1

    if (day_date !== undefined) {
        fields.push(`day_date = $${paramIndex++}`)
        params.push(day_date)
    }
    if (time_of_day !== undefined) {
        fields.push(`time_of_day = $${paramIndex++}`)
        params.push(time_of_day)
    }
    if (title !== undefined) {
        fields.push(`title = $${paramIndex++}`)
        params.push(title)
    }
    if (category !== undefined) {
        fields.push(`category = $${paramIndex++}`)
        params.push(category)
    }
    if (price !== undefined) {
        fields.push(`price = $${paramIndex++}`)
        params.push(price)
    }
    if (notes !== undefined) {
        fields.push(`notes = $${paramIndex++}`)
        params.push(notes)
    }

    if (fields.length === 0) {
        return response(400, null, 'No fields to update')
    }

    params.push(itemId, tripId)
    const updateQuery = `
        UPDATE itinerary_items
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex++} AND trip_id = $${paramIndex++}
        RETURNING *
    `

    const result = await pool.query(updateQuery, params)
    return response(200, result.rows[0], 'Itinerary item updated successfully')
}

export async function deleteItineraryItemService(userId, tripId, itemId) {
    const ownsTrip = await isTripOwnedByUser(tripId, userId)
    if (!ownsTrip) {
        return response(404, null, 'Trip not found or unauthorized')
    }

    const result = await pool.query(
        'DELETE FROM itinerary_items WHERE id = $1 AND trip_id = $2',
        [itemId, tripId],
    )

    if (result.rowCount === 0) {
        return response(404, null, 'Itinerary item not found')
    }

    return response(200, null, 'Itinerary item deleted successfully')
}

export async function updateTripService(userId, id, tripPayload) {
    const { name, description, start_date, end_date, status, city_ids } = tripPayload

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const ownsTrip = await isTripOwnedByUser(id, userId, client)
        if (!ownsTrip) {
            await client.query('ROLLBACK')
            return response(404, null, 'Trip not found or unauthorized')
        }

        const fields = []
        const params = []
        let paramIndex = 1

        if (name !== undefined) {
            fields.push(`name = $${paramIndex++}`)
            params.push(name)
        }
        if (description !== undefined) {
            fields.push(`description = $${paramIndex++}`)
            params.push(description)
        }
        if (start_date !== undefined) {
            fields.push(`start_date = $${paramIndex++}`)
            params.push(start_date)
        }
        if (end_date !== undefined) {
            fields.push(`end_date = $${paramIndex++}`)
            params.push(end_date)
        }
        if (status !== undefined) {
            fields.push(`status = $${paramIndex++}`)
            params.push(status)
        }

        if (Array.isArray(city_ids) && city_ids.length > 0) {
            const cityRes = await client.query('SELECT image_url FROM cities WHERE id = $1', [
                city_ids[0],
            ])
            if (cityRes.rows.length > 0) {
                fields.push(`cover_image_url = $${paramIndex++}`)
                params.push(cityRes.rows[0].image_url)
            }
        }

        let updatedTrip = { id }
        if (fields.length > 0) {
            params.push(id, userId)
            const updateTripQuery = `
                UPDATE trips
                SET ${fields.join(', ')}, updated_at = NOW()
                WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
                RETURNING *
            `
            const tripResult = await client.query(updateTripQuery, params)
            updatedTrip = tripResult.rows[0]
        }

        if (Array.isArray(city_ids)) {
            await client.query('DELETE FROM trip_cities WHERE trip_id = $1', [id])
            for (let i = 0; i < city_ids.length; i++) {
                await client.query(
                    'INSERT INTO trip_cities (trip_id, city_id, city_order) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                    [id, city_ids[i], i],
                )
            }
        }

        await client.query('COMMIT')
        return response(200, updatedTrip, 'Trip updated successfully')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
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

export async function listCitiesService() {
    const result = await pool.query(
        `SELECT id, name, country, region, image_url AS image, blurb, cost_index, popularity 
         FROM cities ORDER BY name`,
    )
    return response(200, result.rows, 'Cities listed successfully')
}

export async function listActivitiesService() {
    const result = await pool.query(
        `SELECT id, name, category, price, duration_label, image_url AS image, description 
         FROM activities ORDER BY name`,
    )
    return response(200, result.rows, 'Activities listed successfully')
}
