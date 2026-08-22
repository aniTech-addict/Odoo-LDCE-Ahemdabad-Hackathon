import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus, MapPin, Sparkles } from 'lucide-react'
import { useTripStore } from '../store/useTripStore'
import { LandingHero } from '../components/landing/LandingHero'
import { SearchFilter } from '../components/landing/SearchFilter'
import { DestinationCard } from '../components/landing/DestinationCard'
import { TripCard } from '../components/landing/TripCard'
import { Shell } from '../components/Shell'
import { api } from '../services/api'

function Landing() {
    const { cities, trips, budget, activities } = useTripStore()
    const [query, setQuery] = useState('')
    const [groupBy, setGroupBy] = useState('none') // 'none', 'region', 'cost'
    const [sortBy, setSortBy] = useState('popularity') // 'popularity', 'cost'
    const [nearby, setNearby] = useState([])
    const [locationLabel, setLocationLabel] = useState('Global Destinations')
    const [geoLoading, setGeoLoading] = useState(false)

    const filteredCities = cities.filter(
        c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.country.toLowerCase().includes(query.toLowerCase()),
    )

    // Browser Geolocation lookup
    useEffect(() => {
        if (navigator.geolocation) {
            setGeoLoading(true)
            navigator.geolocation.getCurrentPosition(
                async position => {
                    const { latitude, longitude } = position.coords
                    try {
                        const data = await api.getNearbyActivities(latitude, longitude)
                        if (data && data.length >= 15) {
                            setNearby(data)
                            setLocationLabel('Trending Near Your Location')
                        } else {
                            setLocationLabel('Trending Scenic Attractions')
                        }
                    } catch (e) {
                        console.error('Error fetching location-based attractions:', e)
                        setLocationLabel('Trending Scenic Attractions')
                    } finally {
                        setGeoLoading(false)
                    }
                },
                error => {
                    console.warn('Geolocation declined or failed:', error.message)
                    setLocationLabel('Trending Scenic Attractions')
                    setGeoLoading(false)
                },
                { timeout: 10000 }
            )
        } else {
            setLocationLabel('Trending Scenic Attractions')
        }
    }, [])

    // Apply sorting to cities
    const sortedCities = [...filteredCities].sort((a, b) => {
        if (sortBy === 'cost') {
            return (a.cost_index || 0) - (b.cost_index || 0)
        }
        return (b.popularity || 0) - (a.popularity || 0)
    })

    // Apply grouping to cities
    const renderCitySections = () => {
        if (groupBy === 'region') {
            const groups = sortedCities.reduce((acc, c) => {
                const reg = c.region || 'Other'
                if (!acc[reg]) acc[reg] = []
                acc[reg].push(c)
                return acc
            }, {})
            return Object.entries(groups).map(([groupName, list]) => (
                <div key={groupName} className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">{groupName}</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {list.map(c => (
                            <DestinationCard key={c[0] || c.id} city={c} />
                        ))}
                    </div>
                </div>
            ))
        }

        if (groupBy === 'cost') {
            const groups = sortedCities.reduce((acc, c) => {
                const costVal = c.cost_index || 0
                const label = costVal <= 2 ? 'Budget Friendly' : costVal === 3 ? 'Mid-Range' : 'Luxury / Premium'
                if (!acc[label]) acc[label] = []
                acc[label].push(c)
                return acc
            }, {})
            return Object.entries(groups).map(([groupName, list]) => (
                <div key={groupName} className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">{groupName}</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {list.map(c => (
                            <DestinationCard key={c[0] || c.id} city={c} />
                        ))}
                    </div>
                </div>
            ))
        }

        // Default: Ungrouped (Limit 6 for clean view)
        return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {sortedCities.slice(0, 6).map(c => (
                    <DestinationCard key={c[0] || c.id} city={c} />
                ))}
            </div>
        )
    }

    // Ensure we render at least 15 activities (nearby first, fallback to cached activities)
    const inspirationsList = (nearby.length >= 15 ? nearby : activities).slice(0, 18)

    return (
        <Shell>
            <div className="min-h-screen bg-paper">
                <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-12 gap-6 px-5 py-6">
                    <LandingHero />
                    <SearchFilter 
                        query={query} 
                        setQuery={setQuery}
                        groupBy={groupBy}
                        setGroupBy={setGroupBy}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />

                    {/* Regional Dropdowns */}
                    <section className="col-span-12">
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                    Explore
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold">
                                    Top Regional Selections
                                </h2>
                            </div>
                            <Link
                                to="/create"
                                className="text-sm font-medium text-sky-600">
                                Explore all{' '}
                                <ChevronRight className="inline" size={16} />
                            </Link>
                        </div>
                        {renderCitySections()}
                    </section>

                    {/* Personalized Attractions / Inspirations (At least 15 places) */}
                    <section className="col-span-12 mt-4">
                        <div className="mb-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                                <Sparkles size={12} /> Local inspirations
                            </span>
                            <h2 className="mt-2 text-2xl font-semibold flex items-center gap-2">
                                <MapPin size={20} className="text-sky-500 animate-pulse" />
                                {locationLabel}
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1">
                                {geoLoading ? 'Pinpointing coordinates...' : `Discovered ${inspirationsList.length} beautiful scenic spots nearby.`}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            {inspirationsList.map(item => (
                                <div
                                    key={item.id}
                                    className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="h-32 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                        <img
                                            src={item.image || item.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                                            alt={item.name}
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <span className="inline-block rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
                                            {item.category || 'Sight'}
                                        </span>
                                        <h4 className="mt-1 text-sm font-semibold truncate">{item.name}</h4>
                                        <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                                            {item.description || 'A highly recommended place worth exploring during your journey.'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Trips list */}
                    <section className="col-span-12 pb-16">
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                    Your collection
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold">
                                    Your Recent Trips
                                </h2>
                            </div>
                            <Link
                                to="/trips"
                                className="text-sm font-medium text-sky-600">
                                View all{' '}
                                <ChevronRight className="inline" size={16} />
                            </Link>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {trips.map(t => (
                                <TripCard key={t.id} trip={t} budget={budget} />
                            ))}
                        </div>
                    </section>
                </main>
                <Link
                    to="/create"
                    className="fixed bottom-5 right-5 z-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-400">
                    <Plus size={18} /> Plan a trip
                </Link>
            </div>
        </Shell>
    )
}

export default Landing
