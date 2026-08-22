import 'dotenv/config'
// import * as schema from './schema'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'



const client = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const db = drizzle({client, logger:true})
export default db


