import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus } from 'lucide-react'
import { useTripStore } from '../store/useTripStore'
import { LandingHero } from '../components/landing/LandingHero'
import { SearchFilter } from '../components/landing/SearchFilter'
import { DestinationCard } from '../components/landing/DestinationCard'
import { TripCard } from '../components/landing/TripCard'

function Landing() {
    const { cities, trips, budget } = useTripStore()
    const [query, setQuery] = useState('')
    const filtered = cities.filter(
        c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.country.toLowerCase().includes(query.toLowerCase()),
    )
    return (
        <div className="min-h-screen bg-paper">
            <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-12 gap-6 px-5 py-6">
                <LandingHero />
                <SearchFilter query={query} setQuery={setQuery} />
                <section className="col-span-12">
                    <div className="mb-4 flex items-end justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                Destinations
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
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {filtered.slice(0, 6).map(c => (
                            <DestinationCard key={c[0] || c.id} city={c} />
                        ))}
                    </div>
                </section>
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
    )
}

export default Landing
