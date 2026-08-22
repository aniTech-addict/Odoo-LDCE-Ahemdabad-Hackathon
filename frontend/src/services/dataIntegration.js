import { api } from './api'

export async function loadInitialData() {
    const [cities, activities, trips] = await Promise.all([
        api.getCities(),
        api.getActivities(),
        api.getTrips(),
    ])

    return { cities, activities, trips }
}
