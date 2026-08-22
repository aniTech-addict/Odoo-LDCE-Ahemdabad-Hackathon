import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'

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
                    trips,
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
                    set({ trips, activeTripId: trips[0]?.id || null })
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
                    trips: [...s.trips, trip],
                    activeTripId: trip.id,
                })),
            removeTrip: id =>
                set(s => ({
                    trips: s.trips.filter(t => t.id !== id),
                    activeTripId:
                        s.activeTripId === id
                            ? s.trips.find(t => t.id !== id)?.id || null
                            : s.activeTripId,
                })),
            addCity: id =>
                set(s => ({
                    selectedCities: [...new Set([...s.selectedCities, id])],
                })),
            addActivity: (day, activity) =>
                set(s => {
                    const t = s.trips.find(x => x.id === s.activeTripId)
                    const itinerary = { ...(t.itinerary || {}) }
                    itinerary[day] = [
                        ...(itinerary[day] || []),
                        {
                            ...activity,
                            id: activity.id + '-' + Date.now(),
                            time: '12:00',
                            title: activity.name,
                        },
                    ]
                    return {
                        trips: s.trips.map(x =>
                            x.id === t.id ? { ...x, itinerary } : x,
                        ),
                    }
                }),
            removeActivity: (day, id) =>
                set(s => {
                    const t = s.trips.find(x => x.id === s.activeTripId)
                    return {
                        trips: s.trips.map(x =>
                            x.id === t.id
                                ? {
                                      ...x,
                                      itinerary: {
                                          ...t.itinerary,
                                          [day]: t.itinerary[day].filter(
                                              a => a.id !== id,
                                          ),
                                      },
                                  }
                                : x,
                        ),
                    }
                }),
            editTime: (day, id, time) =>
                set(s => {
                    const t = s.trips.find(x => x.id === s.activeTripId)
                    return {
                        trips: s.trips.map(x =>
                            x.id === t.id
                                ? {
                                      ...x,
                                      itinerary: {
                                          ...t.itinerary,
                                          [day]: t.itinerary[day].map(a =>
                                              a.id === id ? { ...a, time } : a,
                                          ),
                                      },
                                  }
                                : x,
                        ),
                    }
                }),
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
