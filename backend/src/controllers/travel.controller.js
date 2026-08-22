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

/**
 * Endpoint to search for a city by query name. Geocodes and caches it on the fly.
 */
export const searchCity = async (req, res) => {
    const { q } = req.query
    if (!q) {
        return res.sendStructuredResponse(
            400,
            null,
            'Query parameter "q" is required',
        )
    }
    try {
        const city = await geocodeCityAndCache(q)
        if (!city) {
            return res.sendStructuredResponse(404, null, 'City not found')
        }
        return res.sendStructuredResponse(200, city, 'City found')
    } catch (error) {
        console.error('Search city error:', error)
        return res.sendStructuredResponse(500, null, 'Error searching city')
    }
}

/**
 * Endpoint to list activities in a specific city using coordinate range.
 */
export const getActivities = async (req, res) => {
    const { cityId, lat, lon, category } = req.query
    if (!cityId || !lat || !lon) {
        return res.sendStructuredResponse(
            400,
            null,
            'Parameters cityId, lat, and lon are required',
        )
    }
    try {
        let activities = await getCityActivitiesAndCache(
            cityId,
            parseFloat(lat),
            parseFloat(lon),
        )
        if (category) {
            activities = activities.filter(
                act => act.category.toLowerCase() === category.toLowerCase(),
            )
        }
        return res.sendStructuredResponse(
            200,
            activities,
            'Activities fetched successfully',
        )
    } catch (error) {
        console.error('Get activities error:', error)
        return res.sendStructuredResponse(
            500,
            null,
            'Error fetching activities',
        )
    }
}

/**
 * Creates a new trip and associates it with a list of city IDs in order.
 */
export const createTrip = async (req, res) => {
    const userId = req.userId
    const { name, description, start_date, end_date, city_ids } = req.body

    if (
        !name ||
        !start_date ||
        !end_date ||
        !Array.isArray(city_ids) ||
        city_ids.length === 0
    ) {
        return res.sendStructuredResponse(
            400,
            null,
            'name, start_date, end_date, and non-empty city_ids array are required',
        )
    }

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const tripId = crypto.randomUUID()

        // Use the first city's photo as the cover photo
        let coverImageUrl = null
        const cityRes = await client.query(
            'SELECT image_url FROM cities WHERE id = $1',
            [city_ids[0]],
        )
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

        // Add cities to trip
        for (let i = 0; i < city_ids.length; i++) {
            await client.query(
                'INSERT INTO trip_cities (trip_id, city_id, city_order) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                [tripId, city_ids[i], i],
            )
        }

        await client.query('COMMIT')
        return res.sendStructuredResponse(
            201,
            tripResult.rows[0],
            'Trip created successfully',
        )
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Create trip error:', error)
        return res.sendStructuredResponse(500, null, 'Error creating trip')
    } finally {
        client.release()
    }
}

/**
 * List all trips for the authenticated user.
 */
export const listTrips = async (req, res) => {
    const userId = req.userId
    const { status, cityId } = req.query
    try {
        // Auto-update statuses based on current date
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

        let selectQuery =
            'SELECT * FROM trips WHERE user_id = $1 ORDER BY start_date ASC'
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
        return res.sendStructuredResponse(
            200,
            result.rows,
            'Trips retrieved successfully',
        )
    } catch (error) {
        console.error('List trips error:', error)
        return res.sendStructuredResponse(500, null, 'Error listing trips')
    }
}

/**
 * Retrieves full details for a trip, including visited cities and daily itinerary items.
 */
export const getTrip = async (req, res) => {
    const userId = req.userId
    const { id } = req.params

    try {
        // Auto-update specific trip status before fetching details
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

        const tripRes = await pool.query(
            'SELECT * FROM trips WHERE id = $1 AND user_id = $2',
            [id, userId],
        )
        if (tripRes.rows.length === 0) {
            return res.sendStructuredResponse(404, null, 'Trip not found')
        }

        const trip = tripRes.rows[0]

        // Fetch visited cities
        const citiesRes = await pool.query(
            `SELECT c.*, tc.city_order 
             FROM trip_cities tc 
             JOIN cities c ON tc.city_id = c.id 
             WHERE tc.trip_id = $1 
             ORDER BY tc.city_order ASC`,
            [id],
        )
        trip.cities = citiesRes.rows

        // Fetch itinerary items
        const itineraryRes = await pool.query(
            `SELECT ii.*, a.name as activity_name, a.category as activity_category, a.image_url as activity_image
             FROM itinerary_items ii
             LEFT JOIN activities a ON ii.activity_id = a.id
             WHERE ii.trip_id = $1
             ORDER BY ii.day_date ASC, ii.time_of_day ASC`,
            [id],
        )
        trip.itinerary = itineraryRes.rows

        return res.sendStructuredResponse(
            200,
            trip,
            'Trip details retrieved successfully',
        )
    } catch (error) {
        console.error('Get trip error:', error)
        return res.sendStructuredResponse(
            500,
            null,
            'Error getting trip details',
        )
    }
}

export const deleteTrip = async (req, res) => {
    const userId = req.userId
    const { id } = req.params
    try {
        const result = await pool.query(
            'DELETE FROM trips WHERE id = $1 AND user_id = $2',
            [id, userId],
        )
        if (result.rowCount === 0) {
            return res.sendStructuredResponse(404, null, 'Trip not found')
        }
        return res.sendStructuredResponse(
            200,
            null,
            'Trip deleted successfully',
        )
    } catch (error) {
        console.error('Delete trip error:', error)
        return res.sendStructuredResponse(500, null, 'Error deleting trip')
    }
}

export const addItineraryItem = async (req, res) => {
    const userId = req.userId
    const { tripId } = req.params
    const {
        activity_id,
        day_date,
        time_of_day,
        title,
        category,
        price,
        notes,
    } = req.body

    if (!day_date || !title) {
        return res.sendStructuredResponse(
            400,
            null,
            'day_date and title are required',
        )
    }

    try {
        // Validate trip ownership
        const tripCheck = await pool.query(
            'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
            [tripId, userId],
        )
        if (tripCheck.rows.length === 0) {
            return res.sendStructuredResponse(
                404,
                null,
                'Trip not found or unauthorized',
            )
        }

        const itemId = crypto.randomUUID()

        // Fetch activity image if activity_id is supplied
        let imageUrl = null
        if (activity_id) {
            const actRes = await pool.query(
                'SELECT image_url FROM activities WHERE id = $1',
                [activity_id],
            )
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

        return res.sendStructuredResponse(
            201,
            result.rows[0],
            'Itinerary item added successfully',
        )
    } catch (error) {
        console.error('Add itinerary item error:', error)
        return res.sendStructuredResponse(
            500,
            null,
            'Error adding itinerary item',
        )
    }
}

/**
 * Calculates transit route instructions and distances between sequential itinerary items for a specific day.
 */
export const getDailyRoute = async (req, res) => {
    const userId = req.userId
    const { tripId } = req.params
    const { day_date, mode } = req.query

    if (!day_date) {
        return res.sendStructuredResponse(
            400,
            null,
            'Query parameter "day_date" is required',
        )
    }

    try {
        // Validate trip ownership
        const tripCheck = await pool.query(
            'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
            [tripId, userId],
        )
        if (tripCheck.rows.length === 0) {
            return res.sendStructuredResponse(
                404,
                null,
                'Trip not found or unauthorized',
            )
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
            return res.sendStructuredResponse(200, {
                route: null,
                message: 'Need at least 2 itinerary items to calculate a route',
            })
        }

        // Resolve coordinates for all items with activity_id
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
            return res.sendStructuredResponse(200, {
                route: null,
                message:
                    'Could not resolve spatial coordinates for at least 2 activities on this day',
            })
        }

        const routeData = await calculateItineraryRoute(coords, mode || 'walk')
        return res.sendStructuredResponse(
            200,
            routeData,
            'Daily route calculated successfully',
        )
    } catch (error) {
        console.error('Get daily route error:', error)
        return res.sendStructuredResponse(
            500,
            null,
            'Error calculating daily route',
        )
    }
}

export const updateItineraryItem = async (req, res) => {
    const userId = req.userId
    const { tripId, itemId } = req.params
    const { day_date, time_of_day, title, category, price, notes } = req.body

    try {
        // Validate trip ownership
        const tripCheck = await pool.query(
            'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
            [tripId, userId],
        )
        if (tripCheck.rows.length === 0) {
            return res.sendStructuredResponse(
                404,
                null,
                'Trip not found or unauthorized',
            )
        }

        // Validate itinerary item existence and its association with the trip
        const itemCheck = await pool.query(
            'SELECT id FROM itinerary_items WHERE id = $1 AND trip_id = $2',
            [itemId, tripId],
        )
        if (itemCheck.rows.length === 0) {
            return res.sendStructuredResponse(
                404,
                null,
                'Itinerary item not found',
            )
        }

        // Construct update query dynamically based on provided fields
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
            return res.sendStructuredResponse(400, null, 'No fields to update')
        }

        params.push(itemId, tripId)
        const updateQuery = `
            UPDATE itinerary_items
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $${paramIndex++} AND trip_id = $${paramIndex++}
            RETURNING *
        `

        const result = await pool.query(updateQuery, params)
        return res.sendStructuredResponse(
            200,
            result.rows[0],
            'Itinerary item updated successfully',
        )
    } catch (error) {
        console.error('Update itinerary item error:', error)
        return res.sendStructuredResponse(
            500,
            null,
            'Error updating itinerary item',
        )
    }
}

export const deleteItineraryItem = async (req, res) => {
    const userId = req.userId
    const { tripId, itemId } = req.params

    try {
        // Validate trip ownership
        const tripCheck = await pool.query(
            'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
            [tripId, userId],
        )
        if (tripCheck.rows.length === 0) {
            return res.sendStructuredResponse(
                404,
                null,
                'Trip not found or unauthorized',
            )
        }

        const result = await pool.query(
            'DELETE FROM itinerary_items WHERE id = $1 AND trip_id = $2',
            [itemId, tripId],
        )
        if (result.rowCount === 0) {
            return res.sendStructuredResponse(
                404,
                null,
                'Itinerary item not found',
            )
        }
        return res.sendStructuredResponse(
            200,
            null,
            'Itinerary item deleted successfully',
        )
    } catch (error) {
        console.error('Delete itinerary item error:', error)
        return res.sendStructuredResponse(
            500,
            null,
            'Error deleting itinerary item',
        )
    }
}

/**
 * Updates details of a trip and its visited cities sequence.
 */
export const updateTrip = async (req, res) => {
    const userId = req.userId
    const { id } = req.params
    const { name, description, start_date, end_date, status, city_ids } =
        req.body

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // Validate trip ownership
        const tripCheck = await client.query(
            'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
            [id, userId],
        )
        if (tripCheck.rows.length === 0) {
            await client.query('ROLLBACK')
            return res.sendStructuredResponse(
                404,
                null,
                'Trip not found or unauthorized',
            )
        }

        // Dynamically update trips table
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

        // If city_ids is provided and not empty, update cover image url from the first city
        let coverImageUrl = null
        if (Array.isArray(city_ids) && city_ids.length > 0) {
            const cityRes = await client.query(
                'SELECT image_url FROM cities WHERE id = $1',
                [city_ids[0]],
            )
            if (cityRes.rows.length > 0) {
                coverImageUrl = cityRes.rows[0].image_url
                fields.push(`cover_image_url = $${paramIndex++}`)
                params.push(coverImageUrl)
            }
        }

        let updatedTrip = null
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
        } else {
            updatedTrip = tripCheck.rows[0]
        }

        // Update cities if provided
        if (Array.isArray(city_ids)) {
            // Delete old trip cities
            await client.query('DELETE FROM trip_cities WHERE trip_id = $1', [
                id,
            ])
            // Insert new trip cities
            for (let i = 0; i < city_ids.length; i++) {
                await client.query(
                    'INSERT INTO trip_cities (trip_id, city_id, city_order) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                    [id, city_ids[i], i],
                )
            }
        }

        await client.query('COMMIT')
        return res.sendStructuredResponse(
            200,
            updatedTrip,
            'Trip updated successfully',
        )
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Update trip error:', error)
        return res.sendStructuredResponse(500, null, 'Error updating trip')
    } finally {
        client.release()
    }
}

/**
 * Optimizes the order of itinerary items for a specific day using TSP.
 */
export const optimizeItinerary = async (req, res) => {
    const userId = req.userId
    const { tripId } = req.params
    const { day_date, mode, keepFirstFixed } = req.body

    if (!day_date) {
        return res.sendStructuredResponse(
            400,
            null,
            'day_date is required in body',
        )
    }

    try {
        // Validate trip ownership
        const tripCheck = await pool.query(
            'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
            [tripId, userId],
        )
        if (tripCheck.rows.length === 0) {
            return res.sendStructuredResponse(
                404,
                null,
                'Trip not found or unauthorized',
            )
        }

        // Fetch itinerary items for that day in chronological order
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
            return res.sendStructuredResponse(
                200,
                items,
                'No optimization needed for less than 2 items',
            )
        }

        // Filter items that have valid coordinates
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
            return res.sendStructuredResponse(
                400,
                null,
                'At least 2 activities with valid coordinates are required to optimize',
            )
        }

        // Call Route Matrix API
        const matrixResult = await calculateRouteMatrix(coords, mode || 'walk')
        if (
            !matrixResult.matrix ||
            matrixResult.matrix.length !== coords.length
        ) {
            return res.sendStructuredResponse(
                500,
                null,
                'Failed to compute route matrix',
            )
        }

        // Solve TSP
        const shouldKeepFirstFixed = keepFirstFixed !== false
        const bestPath = solveTSP(matrixResult.matrix, shouldKeepFirstFixed)

        // Map the original scheduled times to the optimized order
        const originalTimes = optimizableItems.map(item => item.time_of_day)

        // Perform updates in database
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
        } catch (txError) {
            await client.query('ROLLBACK')
            throw txError
        } finally {
            client.release()
        }

        // Fetch and return the updated, sorted itinerary for the day
        const updatedItemsRes = await pool.query(
            `SELECT ii.*, a.name as activity_name, a.category as activity_category, a.image_url as activity_image
             FROM itinerary_items ii
             LEFT JOIN activities a ON ii.activity_id = a.id
             WHERE ii.trip_id = $1 AND ii.day_date = $2
             ORDER BY ii.time_of_day ASC`,
            [tripId, day_date],
        )

        return res.sendStructuredResponse(
            200,
            updatedItemsRes.rows,
            'Itinerary optimized successfully',
        )
    } catch (error) {
        console.error('Optimize itinerary error:', error)
        return res.sendStructuredResponse(
            500,
            null,
            'Error optimizing itinerary',
        )
    }
}
