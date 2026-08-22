import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const { Pool, types } = pkg

types.setTypeParser(1082, val => val)

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl || typeof databaseUrl !== 'string') {
    throw new Error(
        'Missing DATABASE_URL. Add it to backend/.env.local as a valid PostgreSQL URL.',
    )
}

const shouldUseSsl =
    process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production'

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
})

pool.on('error', err => {
    console.error('Database connection error: ', err)
})

export default pool
