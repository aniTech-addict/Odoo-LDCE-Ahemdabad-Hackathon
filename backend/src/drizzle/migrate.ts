// migrate.ts

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

const client = new Pool({
    connectionString: process.env.DATABASE_URL as string,
    max: 1,
})

const db = drizzle({ client })

async function main() {
    console.log('Running migrations...')
    await migrate(db, { migrationsFolder: './src/drizzle/migrations' })
    console.log('Migrations finished.')
    await client.end()
}

main()
