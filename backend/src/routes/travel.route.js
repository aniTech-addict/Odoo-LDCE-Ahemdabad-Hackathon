import { Router } from 'express'
import protect from '#src/middlewares/auth.middleware.js'
import asyncHandler from '#src/middlewares/asyncHandler.middleware.js'
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
    optimizeItinerary,
    listCities,
    listActivities,
    listSharedTrips,
    shareTrip,
    likeTrip
} from '#src/controllers/travel.controller.js'

const travelRouter = Router()

// Public search endpoints
travelRouter.get('/cities', asyncHandler(listCities))
travelRouter.get('/activities', asyncHandler(listActivities))
travelRouter.get('/cities/search', asyncHandler(searchCity))
travelRouter.get('/cities/activities', asyncHandler(getActivities))
travelRouter.get('/shared', asyncHandler(listSharedTrips))
travelRouter.post('/trips/:id/like', asyncHandler(likeTrip))

// Protected trip management endpoints
travelRouter.use(protect)
travelRouter.post('/trips', asyncHandler(createTrip))
travelRouter.get('/trips', asyncHandler(listTrips))
travelRouter.get('/trips/:id', asyncHandler(getTrip))
travelRouter.put('/trips/:id', asyncHandler(updateTrip))
travelRouter.delete('/trips/:id', asyncHandler(deleteTrip))
travelRouter.post('/trips/:id/share', asyncHandler(shareTrip))
travelRouter.post('/trips/:tripId/itinerary', asyncHandler(addItineraryItem))
travelRouter.put('/trips/:tripId/itinerary/:itemId', asyncHandler(updateItineraryItem))
travelRouter.delete('/trips/:tripId/itinerary/:itemId', asyncHandler(deleteItineraryItem))
travelRouter.get('/trips/:tripId/route', asyncHandler(getDailyRoute))
travelRouter.post('/trips/:tripId/optimize', asyncHandler(optimizeItinerary))

export default travelRouter
