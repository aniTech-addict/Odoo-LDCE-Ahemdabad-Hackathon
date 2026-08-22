import { request } from './httpClient'

export const api = {
    getCities: () => request('/travel/cities'),
    getActivities: () => request('/travel/activities'),
    getTrips: () => request('/travel/trips'),
    getAdminAnalytics: range =>
        request(`/travel/admin/analytics?range=${encodeURIComponent(range)}`),
    getSharedTrips: () => request('/travel/shared'),
    shareTrip: (id, isShared) =>
        request(`/travel/trips/${id}/share`, {
            method: 'POST',
            body: JSON.stringify({ is_shared: isShared }),
        }),
    likeTrip: id =>
        request(`/travel/trips/${id}/like`, {
            method: 'POST',
        }),
    getNearbyActivities: (lat, lon) =>
        request(`/travel/cities/activities?cityId=current&lat=${lat}&lon=${lon}`),
    login: (email, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
}
