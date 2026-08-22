import pool from '#root/db.js'
import { getBeautifulFallbackImage } from '#src/services/locationService.js'

async function run() {
    const client = await pool.connect()
    try {
        const res = await client.query('SELECT * FROM activities')
        console.log(`Fetched ${res.rows.length} activities. Scanning for map images...`)
        
        let updatedCount = 0
        for (const row of res.rows) {
            if (row.image_url && (row.image_url.includes('maps.geoapify.com') || row.image_url.includes('staticmap'))) {
                const newImage = getBeautifulFallbackImage(row.name, row.category || 'attraction')
                await client.query(
                    'UPDATE activities SET image_url = $1 WHERE id = $2',
                    [newImage, row.id]
                )
                updatedCount++
            }
        }
        console.log(`Successfully updated ${updatedCount} activities with scenic fallback images!`)
    } catch (e) {
        console.error(e)
    } finally {
        client.release()
        await pool.end()
    }
}

run()
