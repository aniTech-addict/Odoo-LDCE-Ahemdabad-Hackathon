import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'

const normalizeTrip = trip => {
    const itinerary = Array.isArray(trip.itinerary)
        ? trip.itinerary.reduce((days, item) => {
              const date = item.day_date
              const activities = days[date] || []
              activities.push({
                  ...item,
                  id: item.id,
                  title: item.title || item.activity_name,
                  category: item.category || item.activity_category,
                  image: item.image || item.activity_image,
                  time: item.time || item.time_of_day || '12:00',
              })
              days[date] = activities
              return days
          }, {})
        : trip.itinerary || {}

    return {
        ...trip,
        startDate: trip.startDate || trip.start_date,
        endDate: trip.endDate || trip.end_date,
        cover: trip.cover || trip.cover_image_url,
        cities: Array.isArray(trip.cities)
            ? trip.cities.map(city => city.id || city)
            : trip.cities || [],
        itinerary,
    }
}

export const useTripStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            trips: [],
            cities: [],
            activities: [],
            activeTripId: null,
            selectedCities: [],
            setData: (cities, activities, trips) =>
                set({
                    cities,
                    activities,
                    trips: trips.map(normalizeTrip),
                    activeTripId: trips[0]?.id || null,
                }),
            login: async data => {
                const user = data.user || {}
                const normalizedUser = {
                    ...user,
                    name:
                        user.name ||
                        [user.first_name, user.last_name]
                            .filter(Boolean)
                            .join(' '),
                    additionalInfo: user.additionalInfo ?? user.additional_info,
                }
                set({ user: normalizedUser, token: data.token })
                try {
                    const trips = await api.getTrips()
                    const normalizedTrips = trips.map(normalizeTrip)
                    set({
                        trips: normalizedTrips,
                        activeTripId: normalizedTrips[0]?.id || null,
                    })
                } catch (error) {
                    console.error('Error fetching trips after login:', error)
                }
            },
            logout: () =>
                set({
                    user: null,
                    token: null,
                    trips: [],
                    activeTripId: null,
                    selectedCities: [],
                }),
            setActive: id => set({ activeTripId: id }),
            createTrip: trip =>
                set(s => ({
                    trips: [...s.trips, normalizeTrip(trip)],
                    activeTripId: trip.id,
                })),
            removeTrip: async id => {
                await api.deleteTrip(id)
                set(s => ({
                    trips: s.trips.filter(t => t.id !== id),
                    activeTripId:
                        s.activeTripId === id
                            ? s.trips.find(t => t.id !== id)?.id || null
                            : s.activeTripId,
                }))
            },
            addCity: id =>
                set(s => ({
                    selectedCities: [...new Set([...s.selectedCities, id])],
                })),
            addActivity: async (day, activity) => {
                const trip = get().trips.find(x => x.id === get().activeTripId)
                if (!trip) return

                const payload = {
                    day_date: day,
                    time_of_day: '12:00',
                    title: activity.title || activity.name,
                    category: activity.category,
                    price: activity.price || 0,
                    ...(String(activity.id).startsWith('custom-')
                        ? {}
                        : { activity_id: activity.id }),
                }
                const saved = await api.addItineraryItem(trip.id, payload)
                const item = {
                    ...activity,
                    ...saved,
                    id: saved.id,
                    title: saved.title || activity.title || activity.name,
                    time: saved.time || saved.time_of_day || '12:00',
                    image: saved.image || activity.image,
                }

                set(s => {
                    const currentTrip = s.trips.find(x => x.id === trip.id)
                    const itinerary = { ...(currentTrip.itinerary || {}) }
                    itinerary[day] = [...(itinerary[day] || []), item]
                    return {
                        trips: s.trips.map(x =>
                            x.id === trip.id ? { ...x, itinerary } : x,
                        ),
                    }
                })
            },
            removeActivity: async (day, id) => {
                const trip = get().trips.find(x => x.id === get().activeTripId)
                if (!trip) return
                await api.deleteItineraryItem(trip.id, id)
                set(s => ({
                    trips: s.trips.map(x =>
                        x.id === trip.id
                            ? {
                                  ...x,
                                  itinerary: {
                                      ...x.itinerary,
                                      [day]: (x.itinerary?.[day] || []).filter(
                                          activity => activity.id !== id,
                                      ),
                                  },
                              }
                            : x,
                    ),
                }))
            },
            editTime: async (day, id, time) => {
                const trip = get().trips.find(x => x.id === get().activeTripId)
                if (!trip) return
                await api.updateItineraryItem(trip.id, id, {
                    time_of_day: time,
                })
                set(s => ({
                    trips: s.trips.map(x =>
                        x.id === trip.id
                            ? {
                                  ...x,
                                  itinerary: {
                                      ...x.itinerary,
                                      [day]: (x.itinerary?.[day] || []).map(
                                          activity =>
                                              activity.id === id
                                                  ? { ...activity, time }
                                                  : activity,
                                      ),
                                  },
                              }
                            : x,
                    ),
                }))
            },
            moveActivity: (from, to, id) =>
                set(s => {
                    const t = s.trips.find(x => x.id === s.activeTripId)
                    const item = t.itinerary[from].find(a => a.id === id)
                    return {
                        trips: s.trips.map(x =>
                            x.id === t.id
                                ? {
                                      ...x,
                                      itinerary: {
                                          ...t.itinerary,
                                          [from]: t.itinerary[from].filter(
                                              a => a.id !== id,
                                          ),
                                          [to]: [
                                              ...(t.itinerary[to] || []),
                                              item,
                                          ],
                                      },
                                  }
                                : x,
                        ),
                    }
                }),
            budget: () => {
                const t = get().trips.find(x => x.id === get().activeTripId)
                const days = Object.keys(t?.itinerary || {}).length || 1
                return (
                    Object.values(t?.itinerary || {})
                        .flat()
                        .reduce((n, a) => n + (a.price || 0), 0) +
                    days * 3500 +
                    Math.max(0, (t?.cities?.length || 1) - 1) * 5000 +
                    days * 1500
                )
            },
        }),
        { name: 'globetrotter-state' },
    ),
)
