import pool from '#root/db.js'

async function check() {
    const client = await pool.connect()
    try {
        const users = await client.query('SELECT COUNT(*)::int AS count FROM users')
        const cities = await client.query('SELECT COUNT(*)::int AS count FROM cities')
        const activities = await client.query('SELECT COUNT(*)::int AS count FROM activities')
        const trips = await client.query('SELECT COUNT(*)::int AS count FROM trips')
        console.log({
            users: users.rows[0].count,
            cities: cities.rows[0].count,
            activities: activities.rows[0].count,
            trips: trips.rows[0].count
        })
    } catch (e) {
        console.error(e)
    } finally {
        client.release()
        await pool.end()
    }
}

check()
