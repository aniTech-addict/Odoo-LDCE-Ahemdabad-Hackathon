import pool from '#root/db.js'

const TOP_PICKS = [
    {
        id: 'paris-france',
        name: 'Paris',
        country: 'France',
        region: 'Europe',
        image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        blurb: 'The City of Light, famous for world-class gastronomy, fashion, and the Eiffel Tower.',
        cost_index: 4,
        popularity: 95
    },
    {
        id: 'tokyo-japan',
        name: 'Tokyo',
        country: 'Japan',
        region: 'Asia',
        image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=800',
        blurb: 'A neon-lit metropolis blending futuristic skyscrapers with historic Shinto shrines.',
        cost_index: 4,
        popularity: 92
    },
    {
        id: 'new-york-usa',
        name: 'New York',
        country: 'USA',
        region: 'North America',
        image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
        blurb: 'The Big Apple, featuring Central Park, Broadway shows, and iconic skyline architecture.',
        cost_index: 5,
        popularity: 90
    },
    {
        id: 'amsterdam-netherlands',
        name: 'Amsterdam',
        country: 'Netherlands',
        region: 'Europe',
        image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
        blurb: 'Famed for its artistic heritage, elaborate canal system, and narrow historic houses.',
        cost_index: 3,
        popularity: 88
    },
    {
        id: 'rome-italy',
        name: 'Rome',
        country: 'Italy',
        region: 'Europe',
        image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
        blurb: 'A historic capital showcasing ancient ruins like the Colosseum and Vatican art.',
        cost_index: 3,
        popularity: 89
    },
    {
        id: 'ahmedabad-india',
        name: 'Ahmedabad',
        country: 'India',
        region: 'Asia',
        image_url: 'https://images.unsplash.com/photo-1599827551509-56d1891c2d9b?w=800',
        blurb: 'A UNESCO heritage city renowned for stepwells, textiles, and rich heritage sites.',
        cost_index: 1,
        popularity: 85
    },
    {
        id: 'sydney-australia',
        name: 'Sydney',
        country: 'Australia',
        region: 'Oceania',
        image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
        blurb: 'A coastal capital boasting the Sydney Opera House and massive sandy beaches.',
        cost_index: 4,
        popularity: 87
    },
    {
        id: 'cape-town-south-africa',
        name: 'Cape Town',
        country: 'South Africa',
        region: 'Africa',
        image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800',
        blurb: 'A stunning port city beneath the flat-topped Table Mountain.',
        cost_index: 2,
        popularity: 86
    }
]

async function seed() {
    const client = await pool.connect()
    try {
        console.log('Seeding top destination picks...')
        for (const pick of TOP_PICKS) {
            const query = `
                INSERT INTO cities (id, name, country, region, image_url, blurb, cost_index, popularity, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    country = EXCLUDED.country,
                    region = EXCLUDED.region,
                    image_url = EXCLUDED.image_url,
                    blurb = EXCLUDED.blurb,
                    cost_index = EXCLUDED.cost_index,
                    popularity = EXCLUDED.popularity,
                    updated_at = NOW()
            `
            await client.query(query, [
                pick.id,
                pick.name,
                pick.country,
                pick.region,
                pick.image_url,
                pick.blurb,
                pick.cost_index,
                pick.popularity
            ])
        }
        console.log('Successfully seeded 8 top regional selections!')
    } catch (e) {
        console.error('Failed to seed top picks:', e)
    } finally {
        client.release()
        await pool.end()
    }
}

seed()
