import { request } from './httpClient'

export const api = {
    getCities: () => request('/cities'),
    getActivities: () => request('/activities'),
    getTrips: () => request('/trips'),
    getAdminAnalytics: range =>
        request(`/admin/analytics?range=${encodeURIComponent(range)}`),
    login: email =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
}
