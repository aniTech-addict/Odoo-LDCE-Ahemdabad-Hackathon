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
    createTrip: data =>
        request('/travel/trips', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateTrip: (id, data) =>
        request(`/travel/trips/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deleteTrip: id =>
        request(`/travel/trips/${id}`, {
            method: 'DELETE',
        }),
    addItineraryItem: (tripId, data) =>
        request(`/travel/trips/${tripId}/itinerary`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateItineraryItem: (tripId, itemId, data) =>
        request(`/travel/trips/${tripId}/itinerary/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deleteItineraryItem: (tripId, itemId) =>
        request(`/travel/trips/${tripId}/itinerary/${itemId}`, {
            method: 'DELETE',
        }),
    getDailyRoute: (tripId, dayDate, mode) =>
        request(
            `/travel/trips/${tripId}/route?day_date=${encodeURIComponent(dayDate)}${mode ? `&mode=${encodeURIComponent(mode)}` : ''}`,
        ),
    optimizeItinerary: (tripId, data) =>
        request(`/travel/trips/${tripId}/optimize`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getNearbyActivities: (lat, lon) =>
        request(
            `/travel/cities/activities?cityId=current&lat=${lat}&lon=${lon}`,
        ),
    login: (email, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
    register: data =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateUser: data =>
        request('/users/update', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deleteUser: () =>
        request('/users/delete', {
            method: 'DELETE',
        }),
}
