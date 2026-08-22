import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import pool from '#root/db.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const args = process.argv.slice(2)
const shouldReset = args.includes('--reset')

const schemaFilePath = path.resolve(process.cwd(), 'src/sql/schema.sql')
const migrationsDirPath = path.resolve(process.cwd(), 'src/sql/migrations')

const ensureMigrationsTable = async client => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `)
}

const resetDatabase = async client => {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE')
    await client.query('CREATE SCHEMA public')
}

const getAppliedMigrations = async client => {
    const result = await client.query('SELECT name FROM schema_migrations')
    return new Set(result.rows.map(row => row.name))
}

const getMigrationFiles = async () => {
    try {
        const entries = await fs.readdir(migrationsDirPath, {
            withFileTypes: true,
        })
        return entries
            .filter(entry => entry.isFile() && entry.name.endsWith('.sql'))
            .map(entry => entry.name)
            .sort((a, b) => a.localeCompare(b))
    } catch (error) {
        if (error.code === 'ENOENT') {
            return []
        }
        throw error
    }
}

const applyMigration = async (client, migrationName, sql) => {
    await client.query('BEGIN')
    try {
        await client.query(sql)
        await client.query(
            'INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
            [migrationName],
        )
        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    }
}

const run = async () => {
    const client = await pool.connect()

    try {
        if (shouldReset) {
            console.log('Resetting database schema...')
            await resetDatabase(client)
        }

        await ensureMigrationsTable(client)
        const appliedMigrations = await getAppliedMigrations(client)

        const migrationFiles = await getMigrationFiles()
        if (migrationFiles.length === 0) {
            const fallbackName = 'schema.sql'
            if (!appliedMigrations.has(fallbackName)) {
                console.log('Applying fallback schema.sql migration...')
                const schemaSql = await fs.readFile(schemaFilePath, 'utf8')
                await applyMigration(client, fallbackName, schemaSql)
                console.log('Applied fallback schema.sql migration')
            } else {
                console.log(
                    'No migration files found and schema.sql already applied',
                )
            }
            return
        }

        let appliedCount = 0
        for (const migrationFile of migrationFiles) {
            if (appliedMigrations.has(migrationFile)) {
                continue
            }

            const migrationPath = path.join(migrationsDirPath, migrationFile)
            const sql = await fs.readFile(migrationPath, 'utf8')
            console.log(`Applying migration: ${migrationFile}`)
            await applyMigration(client, migrationFile, sql)
            appliedCount += 1
        }

        if (appliedCount === 0) {
            console.log('Database is already up to date')
            return
        }

        console.log(`Applied ${appliedCount} migration(s) successfully`)
    } finally {
        client.release()
        await pool.end()
    }
}

run().catch(error => {
    console.error('Migration failed:', error)
    process.exit(1)
})
