import { request } from './httpClient'

export const api = {
    getCities: () => request('/travel/cities'),
    getActivities: () => request('/travel/activities'),
    getTrips: () => request('/travel/trips'),
    getAdminAnalytics: range =>
        request(`/travel/admin/analytics?range=${encodeURIComponent(range)}`),
    login: (email, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
}
