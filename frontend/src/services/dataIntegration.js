import { api } from './api'

export async function loadInitialData() {
    let token = null
    try {
        const stateStr = localStorage.getItem('globetrotter-state')
        if (stateStr) {
            const parsed = JSON.parse(stateStr)
            token = parsed?.state?.token
        }
    } catch (e) {
        console.error('Failed to parse globetrotter-state for initial load', e)
    }

    const promises = [
        api.getCities(),
        api.getActivities(),
    ]

    if (token) {
        promises.push(api.getTrips())
    } else {
        promises.push(Promise.resolve([]))
    }

    const [cities, activities, trips] = await Promise.all(promises)
    return { cities, activities, trips }
}
