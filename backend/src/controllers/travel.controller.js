import {
    searchCityService,
    getActivitiesService,
    createTripService,
    listTripsService,
    getTripService,
    deleteTripService,
    addItineraryItemService,
    getDailyRouteService,
    updateTripService,
    updateItineraryItemService,
    deleteItineraryItemService,
    optimizeItineraryService,
    listCitiesService,
    listActivitiesService,
} from '#src/services/travel.service.js'

const sendResult = (res, result) =>
    res.sendStructuredResponse(result.status, result.data, result.message)

const sendControllerError = (res, error, logLabel, fallbackMessage) => {
    console.error(logLabel, error)
    return res.sendStructuredResponse(500, null, fallbackMessage)
}

export const searchCity = async (req, res) => {
    const { q } = req.query
    if (!q) {
        return res.sendStructuredResponse(
            400,
            null,
            'Query parameter "q" is required',
        )
    }

    try {
        const result = await searchCityService(q)
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(res, error, 'Search city error:', 'Error searching city')
    }
}

export const getActivities = async (req, res) => {
    const { cityId, lat, lon, category } = req.query
    if (!cityId || !lat || !lon) {
        return res.sendStructuredResponse(
            400,
            null,
            'Parameters cityId, lat, and lon are required',
        )
    }

    try {
        const result = await getActivitiesService(
            cityId,
            parseFloat(lat),
            parseFloat(lon),
            category,
        )
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(
            res,
            error,
            'Get activities error:',
            'Error fetching activities',
        )
    }
}

export const createTrip = async (req, res) => {
    const { name, start_date, end_date, city_ids } = req.body
    if (
        !name ||
        !start_date ||
        !end_date ||
        !Array.isArray(city_ids) ||
        city_ids.length === 0
    ) {
        return res.sendStructuredResponse(
            400,
            null,
            'name, start_date, end_date, and non-empty city_ids array are required',
        )
    }

    try {
        const result = await createTripService(req.userId, req.body)
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(res, error, 'Create trip error:', 'Error creating trip')
    }
}

export const listTrips = async (req, res) => {
    try {
        const { status, cityId } = req.query
        const result = await listTripsService(req.userId, status, cityId)
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(res, error, 'List trips error:', 'Error listing trips')
    }
}

export const getTrip = async (req, res) => {
    try {
        const result = await getTripService(req.userId, req.params.id)
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(res, error, 'Get trip error:', 'Error getting trip details')
    }
}

export const deleteTrip = async (req, res) => {
    try {
        const result = await deleteTripService(req.userId, req.params.id)
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(res, error, 'Delete trip error:', 'Error deleting trip')
    }
}

export const addItineraryItem = async (req, res) => {
    const { day_date, title } = req.body
    if (!day_date || !title) {
        return res.sendStructuredResponse(
            400,
            null,
            'day_date and title are required',
        )
    }

    try {
        const result = await addItineraryItemService(
            req.userId,
            req.params.tripId,
            req.body,
        )
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(
            res,
            error,
            'Add itinerary item error:',
            'Error adding itinerary item',
        )
    }
}

export const getDailyRoute = async (req, res) => {
    const { day_date, mode } = req.query
    if (!day_date) {
        return res.sendStructuredResponse(
            400,
            null,
            'Query parameter "day_date" is required',
        )
    }

    try {
        const result = await getDailyRouteService(
            req.userId,
            req.params.tripId,
            day_date,
            mode,
        )
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(
            res,
            error,
            'Get daily route error:',
            'Error calculating daily route',
        )
    }
}

export const updateItineraryItem = async (req, res) => {
    try {
        const result = await updateItineraryItemService(
            req.userId,
            req.params.tripId,
            req.params.itemId,
            req.body,
        )
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(
            res,
            error,
            'Update itinerary item error:',
            'Error updating itinerary item',
        )
    }
}

export const deleteItineraryItem = async (req, res) => {
    try {
        const result = await deleteItineraryItemService(
            req.userId,
            req.params.tripId,
            req.params.itemId,
        )
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(
            res,
            error,
            'Delete itinerary item error:',
            'Error deleting itinerary item',
        )
    }
}

export const updateTrip = async (req, res) => {
    try {
        const result = await updateTripService(req.userId, req.params.id, req.body)
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(res, error, 'Update trip error:', 'Error updating trip')
    }
}

export const optimizeItinerary = async (req, res) => {
    const { day_date } = req.body
    if (!day_date) {
        return res.sendStructuredResponse(400, null, 'day_date is required in body')
    }

    try {
        const result = await optimizeItineraryService(
            req.userId,
            req.params.tripId,
            req.body,
        )
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(
            res,
            error,
            'Optimize itinerary error:',
            'Error optimizing itinerary',
        )
    }
}

export const listCities = async (req, res) => {
    try {
        const result = await listCitiesService()
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(res, error, 'List cities error:', 'Error listing cities')
    }
}

export const listActivities = async (req, res) => {
    try {
        const result = await listActivitiesService()
        return sendResult(res, result)
    } catch (error) {
        return sendControllerError(
            res,
            error,
            'List activities error:',
            'Error listing activities',
        )
    }
}

export const getAdminAnalytics = async (req, res) => {
    try {
        const trend = [
            { day: 'Mon', trips: 12 },
            { day: 'Tue', trips: 19 },
            { day: 'Wed', trips: 15 },
            { day: 'Thu', trips: 22 },
            { day: 'Fri', trips: 30 },
            { day: 'Sat', trips: 45 },
            { day: 'Sun', trips: 38 }
        ]
        const topCities = [
            { city: 'Paris', selections: 45 },
            { city: 'Amsterdam', selections: 32 },
            { city: 'Ahmedabad', selections: 28 },
            { city: 'Rome', selections: 24 }
        ]
        const users = [
            { name: 'Judge Demo', email: 'judge@demo.com', trips: 5, status: 'Active' },
            { name: 'Brad Pitt', email: 'brad@pitt.com', trips: 2, status: 'Active' },
            { name: 'Jane Doe', email: 'jane@doe.com', trips: 0, status: 'Suspended' }
        ]
        const metrics = [
            { label: 'Active Users', value: 1240, delta: '+12% this week' },
            { label: 'Trips Planned', value: 4820, delta: '+24% this month' },
            { label: 'Top Destination', value: 'Paris', delta: '45 selections' },
            { label: 'Revenue (Est.)', value: '₹1.2M', delta: '+8% growth' }
        ]
        const topActivities = [
            { name: 'Eiffel Tower Tour', additions: 124 },
            { name: 'Louvre Museum Visit', additions: 98 },
            { name: 'Canal Cruise', additions: 86 }
        ]

        return res.sendStructuredResponse(200, {
            trend,
            topCities,
            users,
            metrics,
            topActivities
        }, 'Analytics fetched successfully')
    } catch (error) {
        return sendControllerError(
            res,
            error,
            'Get admin analytics error:',
            'Error fetching analytics',
        )
    }
}
