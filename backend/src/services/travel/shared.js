import pool from '#root/db.js'

export const response = (status, data, message) => ({ status, data, message })

export async function isTripOwnedByUser(tripId, userId, client = pool) {
    const tripCheck = await client.query(
        'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
        [tripId, userId],
    )
    return tripCheck.rows.length > 0
}
