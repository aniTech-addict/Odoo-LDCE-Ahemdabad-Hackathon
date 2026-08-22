import crypto from 'node:crypto'
import pool from '#root/db.js'
import {
    geocodeCityAndCache,
    getCityActivitiesAndCache,
    calculateItineraryRoute,
    getPlaceCoordinates
} from '#src/services/locationService.js'

/**
 * Endpoint to search for a city by query name. Geocodes and caches it on the fly.
 */
export const searchCity = async (req, res) => {
    const { q } = req.query
    if (!q) {
        return res.sendStructuredResponse(400, null, 'Query parameter "q" is required')
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
    const { cityId, lat, lon } = req.query
    if (!cityId || !lat || !lon) {
        return res.sendStructuredResponse(400, null, 'Parameters cityId, lat, and lon are required')
    }
    try {
        const activities = await getCityActivitiesAndCache(cityId, parseFloat(lat), parseFloat(lon))
        return res.sendStructuredResponse(200, activities, 'Activities fetched successfully')
    } catch (error) {
        console.error('Get activities error:', error)
        return res.sendStructuredResponse(500, null, 'Error fetching activities')
    }
}

/**
 * Creates a new trip and associates it with a list of city IDs in order.
 */
export const createTrip = async (req, res) => {
    const userId = req.userId
    const { name, description, start_date, end_date, city_ids } = req.body

    if (!name || !start_date || !end_date || !Array.isArray(city_ids) || city_ids.length === 0) {
        return res.sendStructuredResponse(400, null, 'name, start_date, end_date, and non-empty city_ids array are required')
    }

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const tripId = crypto.randomUUID()

        // Use the first city's photo as the cover photo
        let coverImageUrl = null
        const cityRes = await client.query('SELECT image_url FROM cities WHERE id = $1', [city_ids[0]])
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
            coverImageUrl
        ])

        // Add cities to trip
        for (let i = 0; i < city_ids.length; i++) {
            await client.query(
                'INSERT INTO trip_cities (trip_id, city_id, city_order) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                [tripId, city_ids[i], i]
            )
        }

        await client.query('COMMIT')
        return res.sendStructuredResponse(201, tripResult.rows[0], 'Trip created successfully')
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
    try {
        const result = await pool.query(
            'SELECT * FROM trips WHERE user_id = $1 ORDER BY start_date ASC',
            [userId]
        )
        return res.sendStructuredResponse(200, result.rows, 'Trips retrieved successfully')
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
        const tripRes = await pool.query(
            'SELECT * FROM trips WHERE id = $1 AND user_id = $2',
            [id, userId]
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
            [id]
        )
        trip.cities = citiesRes.rows

        // Fetch itinerary items
        const itineraryRes = await pool.query(
            `SELECT ii.*, a.name as activity_name, a.category as activity_category, a.image_url as activity_image
             FROM itinerary_items ii
             LEFT JOIN activities a ON ii.activity_id = a.id
             WHERE ii.trip_id = $1
             ORDER BY ii.day_date ASC, ii.time_of_day ASC`,
            [id]
        )
        trip.itinerary = itineraryRes.rows

        return res.sendStructuredResponse(200, trip, 'Trip details retrieved successfully')
    } catch (error) {
        console.error('Get trip error:', error)
        return res.sendStructuredResponse(500, null, 'Error getting trip details')
    }
}

/**
 * Deletes a trip.
 */
export const deleteTrip = async (req, res) => {
    const userId = req.userId
    const { id } = req.params
    try {
        const result = await pool.query(
            'DELETE FROM trips WHERE id = $1 AND user_id = $2',
            [id, userId]
        )
        if (result.rowCount === 0) {
            return res.sendStructuredResponse(404, null, 'Trip not found')
        }
        return res.sendStructuredResponse(200, null, 'Trip deleted successfully')
    } catch (error) {
        console.error('Delete trip error:', error)
        return res.sendStructuredResponse(500, null, 'Error deleting trip')
    }
}

/**
 * Adds an activity item to a trip's itinerary.
 */
export const addItineraryItem = async (req, res) => {
    const userId = req.userId
    const { tripId } = req.params
    const { activity_id, day_date, time_of_day, title, category, price, notes } = req.body

    if (!day_date || !title) {
        return res.sendStructuredResponse(400, null, 'day_date and title are required')
    }

    try {
        // Validate trip ownership
        const tripCheck = await pool.query(
            'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
            [tripId, userId]
        )
        if (tripCheck.rows.length === 0) {
            return res.sendStructuredResponse(404, null, 'Trip not found or unauthorized')
        }

        const itemId = crypto.randomUUID()

        // Fetch activity image if activity_id is supplied
        let imageUrl = null
        if (activity_id) {
            const actRes = await pool.query('SELECT image_url FROM activities WHERE id = $1', [activity_id])
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
            notes || ''
        ])

        return res.sendStructuredResponse(201, result.rows[0], 'Itinerary item added successfully')
    } catch (error) {
        console.error('Add itinerary item error:', error)
        return res.sendStructuredResponse(500, null, 'Error adding itinerary item')
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
        return res.sendStructuredResponse(400, null, 'Query parameter "day_date" is required')
    }

    try {
        // Validate trip ownership
        const tripCheck = await pool.query(
            'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
            [tripId, userId]
        )
        if (tripCheck.rows.length === 0) {
            return res.sendStructuredResponse(404, null, 'Trip not found or unauthorized')
        }

        // Fetch itinerary items for that day
        const itemsRes = await pool.query(
            `SELECT ii.*, a.id as activity_id
             FROM itinerary_items ii
             LEFT JOIN activities a ON ii.activity_id = a.id
             WHERE ii.trip_id = $1 AND ii.day_date = $2
             ORDER BY ii.time_of_day ASC`,
            [tripId, day_date]
        )

        const items = itemsRes.rows
        if (items.length < 2) {
            return res.sendStructuredResponse(200, { route: null, message: 'Need at least 2 itinerary items to calculate a route' })
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
            return res.sendStructuredResponse(200, { route: null, message: 'Could not resolve spatial coordinates for at least 2 activities on this day' })
        }

        const routeData = await calculateItineraryRoute(coords, mode || 'walk')
        return res.sendStructuredResponse(200, routeData, 'Daily route calculated successfully')
    } catch (error) {
        console.error('Get daily route error:', error)
        return res.sendStructuredResponse(500, null, 'Error calculating daily route')
    }
}
