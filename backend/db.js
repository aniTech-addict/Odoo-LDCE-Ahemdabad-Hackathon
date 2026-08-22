import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool, types } = pkg

types.setTypeParser(1082, val => val)

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
})

pool.on('error', err => {
    console.error('Database connection error: ', err)
})

export default pool
