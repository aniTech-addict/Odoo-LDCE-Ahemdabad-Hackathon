import pool from '#root/db.js'
import {
    geocodeCityAndCache,
    getCityActivitiesAndCache,
} from '#src/services/locationService.js'
import { response } from '#src/services/travel/shared.js'

export async function searchCityService(q) {
    const city = await geocodeCityAndCache(q)
    if (!city) {
        return response(404, null, 'City not found')
    }
    return response(200, city, 'City found')
}

export async function getActivitiesService(cityId, lat, lon, category) {
    let activities = await getCityActivitiesAndCache(cityId, lat, lon)
    if (category) {
        activities = activities.filter(
            act => act.category.toLowerCase() === category.toLowerCase(),
        )
    }

    return response(200, activities, 'Activities fetched successfully')
}

export async function listCitiesService() {
    const result = await pool.query(
        `SELECT id, name, country, region, image_url AS image, blurb, cost_index, popularity 
         FROM cities ORDER BY name`,
    )
    return response(200, result.rows, 'Cities listed successfully')
}

export async function listActivitiesService() {
    const result = await pool.query(
        `SELECT id, name, category, price, duration_label, image_url AS image, description 
         FROM activities ORDER BY name`,
    )
    return response(200, result.rows, 'Activities listed successfully')
}
