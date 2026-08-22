import crypto from 'node:crypto'
import pool from '#root/db.js'
import { isTripOwnedByUser, response } from '#src/services/travel/shared.js'

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
