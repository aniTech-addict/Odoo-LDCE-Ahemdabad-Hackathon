import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'
import { TripListItem } from '../components/trips/TripListItem'

function Trips() {
    const { user, trips, setActive, removeTrip } = useTripStore()

    if (!user) {
        return (
            <Shell>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-5">
                    <h2 className="serif text-3xl font-semibold mb-2">My Trips</h2>
                    <p className="text-zinc-500 text-sm max-w-sm mb-5 dark:text-zinc-400">
                        Please sign in to view your saved trips and plan new adventures.
                    </p>
                    <Link to="/login" className="bg-sky-500 hover:bg-sky-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition shadow-sm">
                        Sign In / Register
                    </Link>
                </div>
            </Shell>
        )
    }

    const [tab, setTab] = useState('Upcoming')
    const [query, setQuery] = useState('')
    const [group, setGroup] = useState('Status')
    const [sort, setSort] = useState('Newest')

    const filtered = trips
        .filter(
            t =>
                t.status === tab &&
                t.name.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) =>
            sort === 'A–Z'
                ? a.name.localeCompare(b.name)
                : b.startDate.localeCompare(a.startDate),
        )

    return (
        <Shell>
            <div className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[.22em] text-zinc-500">
                                    Your collection
                                </p>
                                <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                                    My Trips
                                </h1>
                            </div>
                            <span className="flex items-center gap-2 text-xs text-zinc-500">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                Resyncing...
                            </span>
                        </div>
                        <Link
                            className="btn btn-gold flex items-center gap-2"
                            to="/create">
                            <Plus size={17} /> New trip
                        </Link>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[220px] flex-1">
                            <Search
                                className="absolute left-3 top-3 text-zinc-400"
                                size={18}
                            />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search trips..."
                                className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-400/40 dark:border-zinc-800 dark:bg-zinc-900"
                            />
                        </div>
                        <select
                            value={group}
                            onChange={e => setGroup(e.target.value)}
                            className="h-11 rounded-lg border-0 bg-white px-3 text-sm dark:bg-zinc-900">
                            <option>Status</option>
                            <option>Destination</option>
                        </select>
                        <button className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <SlidersHorizontal size={16} /> Filter
                        </button>
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                            className="h-11 rounded-lg border-0 bg-white px-3 text-sm dark:bg-zinc-900">
                            <option>Newest</option>
                            <option>A–Z</option>
                        </select>
                    </div>
                    <div className="mt-10 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
                        {['Ongoing', 'Upcoming', 'Completed'].map(x => (
                            <button
                                key={x}
                                onClick={() => setTab(x)}
                                className={`pb-3 text-sm ${tab === x ? 'border-b-2 border-sky-500 font-semibold text-sky-600' : ''}`}>
                                {x}
                            </button>
                        ))}
                    </div>
                    <section className="mt-7">
                        <h2 className="text-xl font-semibold">{tab}</h2>
                        <div className="mt-4 space-y-4">
                            {filtered.map(t => (
                                <TripListItem
                                    key={t.id}
                                    trip={t}
                                    setActive={setActive}
                                    removeTrip={removeTrip}
                                />
                            ))}
                            {!filtered.length && (
                                <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700">
                                    No trips found in this section.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </Shell>
    )
}

export default Trips
