import dotenv from 'dotenv'
import pool from '#root/db.js'

dotenv.config()

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY
const IS_MOCK_MODE = !GEOAPIFY_API_KEY || GEOAPIFY_API_KEY === 'mock'

if (IS_MOCK_MODE) {
    console.log('[Geoapify] Warning: GEOAPIFY_API_KEY not found. Running in MOCK MODE with fallback local data.')
}

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_API_KEY
const PEXELS_API_KEY = process.env.PEXELS_API_KEY

/**
 * Fetches a high-quality landscape or landmark photo using Unsplash or Pexels API
 * @param {string} query - Search term (e.g. "Paris landscape", "Eiffel Tower landmark")
 * @returns {Promise<string|null>} URL of the photo, or null if none found
 */
export async function fetchPhoto(query) {
    // 1. Try Unsplash
    if (unsplashAccessKeyAvailable()) {
        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                if (data.results && data.results.length > 0) {
                    return data.results[0].urls.regular
                }
            }
        } catch (error) {
            console.error('Failed to fetch photo from Unsplash:', error.message)
        }
    }

    // 2. Try Pexels as backup
    if (pexelsKeyAvailable()) {
        try {
            const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`
            const res = await fetch(url, {
                headers: { Authorization: PEXELS_API_KEY }
            })
            if (res.ok) {
                const data = await res.json()
                if (data.photos && data.photos.length > 0) {
                    return data.photos[0].src.large
                }
            }
        } catch (error) {
            console.error('Failed to fetch photo from Pexels:', error.message)
        }
    }

    return null
}

/**
 * Fetches a short summary introduction for a city from Wikipedia REST API
 * @param {string} cityName - Name of the city
 * @returns {Promise<string>} Summary text
 */
export async function fetchWikiSummary(cityName) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`
        const res = await fetch(url)
        if (res.ok) {
            const data = await res.json()
            if (data.extract) {
                return data.extract
            }
        }
    } catch (error) {
        console.error('Failed to fetch Wikipedia summary:', error.message)
    }
    return `Welcome to ${cityName}! Explore landmarks, dining, and culture.`
}

/**
 * Searches for a city, resolves metadata and saves/caches it in the database.
 * If cached data exists and is less than 24 hours old, serves from cache.
 * @param {string} cityName - The user query (e.g. "Ahmedabad")
 * @returns {Promise<object|null>} The city database record with transient lat/lon
 */
export async function geocodeCityAndCache(cityName) {
    const trimmedName = cityName.trim()

    if (IS_MOCK_MODE) {
        const nameLower = trimmedName.toLowerCase()
        let mockCity = {
            id: 'mock-generic-id',
            name: trimmedName,
            country: 'Mock Country',
            region: 'Mock Region',
            image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
            blurb: `Welcome to ${trimmedName}! A beautiful destination to explore.`,
            cost_index: 0,
            popularity: 50,
            lat: 23.0225,
            lon: 72.5714
        }
        if (nameLower.includes('ahmedabad')) {
            mockCity = {
                id: 'mock-ahmedabad-id',
                name: 'Ahmedabad',
                country: 'India',
                region: 'Gujarat',
                image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
                blurb: 'Ahmedabad, in western India, is the largest city in the state of Gujarat.',
                cost_index: 0,
                popularity: 60,
                lat: 23.0225,
                lon: 72.5714
            }
        } else if (nameLower.includes('paris')) {
            mockCity = {
                id: 'mock-paris-id',
                name: 'Paris',
                country: 'France',
                region: 'Île-de-France',
                image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
                blurb: 'Paris, France’s capital, is a major European city and a global center for art, fashion, gastronomy and culture.',
                cost_index: 0,
                popularity: 90,
                lat: 48.8566,
                lon: 2.3522
            }
        }

        // Cache the mock city in the database so foreign keys can reference it!
        const upsertQuery = `
            INSERT INTO cities (id, name, country, region, image_url, blurb, cost_index, popularity, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                country = EXCLUDED.country,
                region = EXCLUDED.region,
                image_url = EXCLUDED.image_url,
                blurb = EXCLUDED.blurb,
                updated_at = NOW()
            RETURNING *
        `
        const res = await pool.query(upsertQuery, [
            mockCity.id,
            mockCity.name,
            mockCity.country,
            mockCity.region,
            mockCity.image_url,
            mockCity.blurb,
            mockCity.cost_index,
            mockCity.popularity
        ])
        return {
            ...res.rows[0],
            lat: mockCity.lat,
            lon: mockCity.lon
        }
    }

    // Check if exists in DB
    const dbCheck = await pool.query(
        'SELECT * FROM cities WHERE LOWER(name) = LOWER($1) OR id = $2',
        [trimmedName, trimmedName]
    )

    if (dbCheck.rows.length > 0) {
        const dbCity = dbCheck.rows[0]
        const hoursSinceUpdate = (new Date() - new Date(dbCity.updated_at)) / (1000 * 60 * 60)
        
        // If cached and updated within last 24 hours, use cache
        if (hoursSinceUpdate < 24) {
            // Retrieve coordinates from Geoapify transiently to support child queries
            const coords = await getCityCoordinatesFromApi(dbCity.name)
            return {
                ...dbCity,
                lat: coords ? coords.lat : null,
                lon: coords ? coords.lon : null
            }
        }
    }

    // Call Geocoding API if not cached or expired
    const coords = await getCityCoordinatesFromApi(trimmedName)
    if (!coords) return null

    const { id, name, country, region, lat, lon } = coords

    // Fetch landscape photo & Wikipedia summary
    const imageUrl = await fetchPhoto(`${name} landscape`) 
        || `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=800&height=500&center=lonlat:${lon},${lat}&zoom=12&apiKey=${GEOAPIFY_API_KEY}`
    const blurb = await fetchWikiSummary(name)

    // Save/Update in DB
    const upsertQuery = `
        INSERT INTO cities (id, name, country, region, image_url, blurb, cost_index, popularity, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            country = EXCLUDED.country,
            region = EXCLUDED.region,
            image_url = EXCLUDED.image_url,
            blurb = EXCLUDED.blurb,
            updated_at = NOW()
        RETURNING *
    `
    const insertResult = await pool.query(upsertQuery, [
        id,
        name,
        country,
        region,
        imageUrl,
        blurb,
        0, // Cost index default
        50 // Popularity default
    ])

    return {
        ...insertResult.rows[0],
        lat,
        lon
    }
}

/**
 * Discovers activities near coordinates and caches detailed items in the database.
 * If details exist in the database and are fresh, they are loaded without external calls.
 * @param {string} cityId - Geoapify place ID of the city
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} [radiusMeters=5000] - Search radius
 * @returns {Promise<Array<object>>} List of activities
 */
export async function getCityActivitiesAndCache(cityId, lat, lon, radiusMeters = 5000) {
    if (IS_MOCK_MODE) {
        const mockActs = [
            {
                id: `${cityId}-attraction-1`,
                name: 'Sabarmati Ashram',
                category: 'attraction',
                price: 0,
                duration_label: '1-2 hours',
                image_url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400',
                description: 'Gandhi\'s humble home and museum on the riverbank.'
            },
            {
                id: `${cityId}-attraction-2`,
                name: 'Adalaj Stepwell',
                category: 'attraction',
                price: 50,
                duration_label: '1 hour',
                image_url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400',
                description: 'Unique 5-story underground stone well with carvings.'
            }
        ]

        const activitiesList = []
        for (const act of mockActs) {
            const upsertQuery = `
                INSERT INTO activities (id, name, category, price, duration_label, image_url, description, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    category = EXCLUDED.category,
                    image_url = EXCLUDED.image_url,
                    description = EXCLUDED.description,
                    updated_at = NOW()
                RETURNING *
            `
            const insertResult = await pool.query(upsertQuery, [
                act.id,
                act.name,
                act.category,
                act.price,
                act.duration_label,
                act.image_url,
                act.description
            ])
            activitiesList.push(insertResult.rows[0])
        }
        return activitiesList
    }

    const categories = 'tourism.attraction,entertainment.culture,leisure.park,catering.restaurant'
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},${radiusMeters}&limit=20&apiKey=${GEOAPIFY_API_KEY}`

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Geoapify Places API failed: ${response.status}`)
    }

    const data = await response.json()
    if (!data.features) return []

    const activitiesList = []

    for (const feature of data.features) {
        const props = feature.properties
        const placeId = props.place_id

        if (!placeId) continue

        // Check if this activity is already cached and fresh in DB
        const dbCheck = await pool.query(
            'SELECT * FROM activities WHERE id = $1',
            [placeId]
        )

        let activityObj = null

        if (dbCheck.rows.length > 0) {
            const dbActivity = dbCheck.rows[0]
            const hoursSinceUpdate = (new Date() - new Date(dbActivity.updated_at)) / (1000 * 60 * 60)

            if (hoursSinceUpdate < 24) {
                activityObj = dbActivity
            }
        }

        // If not cached or expired, fetch details and upsert
        if (!activityObj) {
            const normalizedCategory = props.categories.find(c => c.startsWith('tourism.'))
                || props.categories.find(c => c.startsWith('catering.'))
                || props.categories[0]
                || 'Attraction'

            const categoryName = normalizedCategory
                .replace('tourism.', '')
                .replace('catering.', '')
                .replace('entertainment.', '')

            // Search for a dedicated photo of this place, fall back to map tile
            const imageUrl = await fetchPhoto(`${props.name || props.formatted} landmark`)
                || `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=400&height=300&center=lonlat:${props.lon},${props.lat}&zoom=15&marker=lonlat:${props.lon},${props.lat};color:%23ff0000;size:medium&apiKey=${GEOAPIFY_API_KEY}`

            const upsertQuery = `
                INSERT INTO activities (id, name, category, price, duration_label, image_url, description, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    category = EXCLUDED.category,
                    image_url = EXCLUDED.image_url,
                    description = EXCLUDED.description,
                    updated_at = NOW()
                RETURNING *
            `
            const insertResult = await pool.query(upsertQuery, [
                placeId,
                props.name || props.formatted || 'Local Attraction',
                categoryName,
                0, // Price defaults to free/unknown
                '1-2 hours', // Fallback duration label
                imageUrl,
                props.address_line2 || 'A popular point of interest.'
            ])

            activityObj = insertResult.rows[0]
        }

        activitiesList.push(activityObj)
    }

    return activitiesList
}

/**
 * Calculates transit route instructions, distance, and duration between coordinates
 * @param {Array<{lat: number, lon: number}>} coordinatesArray - Ordered sequence of points
 * @param {'walk'|'drive'|'bicycle'} [mode='walk'] - Transit mode
 * @returns {Promise<object>} Route geometry and metadata
 */
export async function calculateItineraryRoute(coordinatesArray, mode = 'walk') {
    if (IS_MOCK_MODE) {
        return {
            distance_meters: 1500,
            duration_seconds: 1200,
            legs: [
                {
                    distance: 1500,
                    time: 1200,
                    steps: [
                        'Head north toward Ashram Road',
                        'Turn right onto Ashram Road',
                        'Destination will be on the left'
                    ]
                }
            ]
        }
    }

    if (!GEOAPIFY_API_KEY) {
        throw new Error('GEOAPIFY_API_KEY is not defined.')
    }
    if (coordinatesArray.length < 2) {
        throw new Error('At least two coordinate pairs are required for routing.')
    }

    const waypointsParam = coordinatesArray
        .map(coord => `${coord.lat},${coord.lon}`)
        .join('|')

    const url = `https://api.geoapify.com/v1/routing?waypoints=${waypointsParam}&mode=${mode}&apiKey=${GEOAPIFY_API_KEY}`

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Geoapify Routing API failed: ${response.status}`)
    }

    const data = await response.json()
    if (!data.features || data.features.length === 0) {
        throw new Error('No route found between waypoints.')
    }

    const routeProperties = data.features[0].properties

    return {
        distance_meters: routeProperties.distance,
        duration_seconds: routeProperties.time,
        legs: routeProperties.legs.map(leg => ({
            distance: leg.distance,
            time: leg.time,
            steps: leg.steps.map(step => step.instruction.text)
        }))
    }
}

/**
 * Fetches the coordinates of a specific POI/place from Geoapify Place Details API
 * @param {string} placeId - Unique Geoapify place ID
 * @returns {Promise<{lat: number, lon: number}|null>} coordinates, or null if query failed
 */
export async function getPlaceCoordinates(placeId) {
    if (IS_MOCK_MODE) {
        return {
            lat: 23.0225,
            lon: 72.5714
        }
    }

    if (!GEOAPIFY_API_KEY) {
        throw new Error('GEOAPIFY_API_KEY is not defined.')
    }
    const url = `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${GEOAPIFY_API_KEY}`
    try {
        const response = await fetch(url)
        if (!response.ok) return null
        const data = await response.json()
        if (data.features && data.features.length > 0) {
            const props = data.features[0].properties
            return {
                lat: props.lat,
                lon: props.lon
            }
        }
    } catch (error) {
        console.error(`Failed to fetch coordinates for place ${placeId}:`, error.message)
    }
    return null
}

/**
 * Calculates a cost matrix of travel distances/times between a list of coordinate locations.
 * @param {Array<{lat: number, lon: number}>} coordinatesArray - List of locations
 * @param {'walk'|'drive'|'bicycle'} [mode='walk'] - Travel mode
 * @returns {Promise<object>} Distance/time matrix object
 */
export async function calculateRouteMatrix(coordinatesArray, mode = 'walk') {
    if (IS_MOCK_MODE) {
        const matrix = []
        for (let i = 0; i < coordinatesArray.length; i++) {
            const row = []
            for (let j = 0; j < coordinatesArray.length; j++) {
                if (i === j) {
                    row.push({ distance: 0, time: 0 })
                } else {
                    const c1 = coordinatesArray[i]
                    const c2 = coordinatesArray[j]
                    const latDiff = c1.lat - c2.lat
                    const lonDiff = c1.lon - c2.lon
                    // Approx distance in meters
                    const distance = Math.round(Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111000)
                    const speed = mode === 'walk' ? 1.4 : mode === 'bicycle' ? 5.0 : 13.8 // meters/second
                    const time = Math.round(distance / speed)
                    row.push({ distance, time })
                }
            }
            matrix.push(row)
        }
        return { matrix }
    }

    if (!GEOAPIFY_API_KEY) {
        throw new Error('GEOAPIFY_API_KEY is not defined.')
    }
    if (coordinatesArray.length < 2) {
        return { matrix: [[{ distance: 0, time: 0 }]] }
    }

    const sources = coordinatesArray.map(c => ({ location: [c.lon, c.lat] }))
    const targets = coordinatesArray.map(c => ({ location: [c.lon, c.lat] }))

    const url = `https://api.geoapify.com/v1/routematrix?apiKey=${GEOAPIFY_API_KEY}`
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, sources, targets })
    })

    if (!response.ok) {
        throw new Error(`Geoapify Route Matrix API failed: ${response.status}`)
    }

    const data = await response.json()
    return data
}

// --- HELPER UTILITIES ---

function unsplashAccessKeyAvailable() {
    return typeof UNSPLASH_ACCESS_KEY === 'string' && UNSPLASH_ACCESS_KEY.length > 0
}

function pexelsKeyAvailable() {
    return typeof PEXELS_API_KEY === 'string' && PEXELS_API_KEY.length > 0
}

/**
 * Calls Geoapify Geocoding search API to get coordinates and location parts
 */
async function getCityCoordinatesFromApi(cityName) {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName)}&type=city&limit=1&apiKey=${GEOAPIFY_API_KEY}`
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Geocoding request failed: ${response.status}`)
    }
    const data = await response.json()
    if (!data.features || data.features.length === 0) {
        return null
    }

    const props = data.features[0].properties
    return {
        id: props.place_id,
        name: props.city || props.name,
        country: props.country,
        region: props.state || props.region || props.country,
        lat: props.lat,
        lon: props.lon
    }
}
