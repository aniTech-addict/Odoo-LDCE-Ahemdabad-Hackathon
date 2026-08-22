import dotenv from 'dotenv'
import pool from '#root/db.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const run = async () => {
    const client = await pool.connect()

    try {
        const result = await client.query(
            'SELECT COUNT(*)::int AS count FROM users',
        )
        console.log(
            `Seed check complete. Users in database: ${result.rows[0].count}`,
        )
    } finally {
        client.release()
        await pool.end()
    }
}

run().catch(error => {
    console.error('Seed failed:', error)
    process.exit(1)
})
