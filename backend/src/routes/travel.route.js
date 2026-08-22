import { Router } from 'express'
import protect from '#src/middlewares/auth.middleware.js'
import {
    searchCity,
    getActivities,
    createTrip,
    listTrips,
    getTrip,
    deleteTrip,
    addItineraryItem,
    getDailyRoute,
    updateTrip,
    updateItineraryItem,
    deleteItineraryItem,
    optimizeItinerary
} from '#src/controllers/travel.controller.js'

const travelRouter = Router()

// Public search endpoints
travelRouter.get('/cities/search', searchCity)
travelRouter.get('/cities/activities', getActivities)

// Protected trip management endpoints
travelRouter.use(protect)
travelRouter.post('/trips', createTrip)
travelRouter.get('/trips', listTrips)
travelRouter.get('/trips/:id', getTrip)
travelRouter.put('/trips/:id', updateTrip)
travelRouter.delete('/trips/:id', deleteTrip)
travelRouter.post('/trips/:tripId/itinerary', addItineraryItem)
travelRouter.put('/trips/:tripId/itinerary/:itemId', updateItineraryItem)
travelRouter.delete('/trips/:tripId/itinerary/:itemId', deleteItineraryItem)
travelRouter.get('/trips/:tripId/route', getDailyRoute)
travelRouter.post('/trips/:tripId/optimize', optimizeItinerary)

export default travelRouter
