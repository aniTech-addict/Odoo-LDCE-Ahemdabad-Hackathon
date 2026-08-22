import crypto from 'node:crypto'
import pool from '#root/db.js'
import { isTripOwnedByUser, response } from '#src/services/travel/shared.js'

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

export async function listSharedTripsService() {
    const query = `
        SELECT t.*, u.first_name || ' ' || u.last_name AS created_by
        FROM trips t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.is_shared = true
        ORDER BY t.updated_at DESC
    `
    const result = await pool.query(query)
    const sharedTrips = []
    for (const trip of result.rows) {
        const citiesRes = await pool.query(
            `SELECT c.name FROM trip_cities tc
             JOIN cities c ON tc.city_id = c.id
             WHERE tc.trip_id = $1
             ORDER BY tc.city_order ASC`,
            [trip.id]
        )
        trip.city_names = citiesRes.rows.map(r => r.name)
        sharedTrips.push(trip)
    }
    return response(200, sharedTrips, 'Shared trips retrieved successfully')
}

export async function shareTripService(userId, id, sharePayload = {}) {
    const { is_shared = true } = sharePayload
    const query = `
        UPDATE trips
        SET is_shared = $1
        WHERE id = $2 AND user_id = $3
        RETURNING *
    `
    const result = await pool.query(query, [is_shared, id, userId])
    if (result.rows.length === 0) {
        return response(404, null, 'Trip not found or unauthorized')
    }
    return response(200, result.rows[0], 'Trip shared status updated successfully')
}

export async function likeTripService(id) {
    const query = `
        UPDATE trips
        SET likes = likes + 1
        WHERE id = $1
        RETURNING *
    `
    const result = await pool.query(query, [id])
    if (result.rows.length === 0) {
        return response(404, null, 'Trip not found')
    }
    return response(200, result.rows[0], 'Trip liked successfully')
}
