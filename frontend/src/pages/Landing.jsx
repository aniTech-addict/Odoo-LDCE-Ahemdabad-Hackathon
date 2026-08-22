import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    ChevronRight,
    Plus,
    Search,
    SlidersHorizontal,
} from 'lucide-react'
import { useTripStore } from '../store/useTripStore'
import { money } from '../utils/format'

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
                <section className="relative col-span-12 min-h-[360px] overflow-hidden rounded-2xl bg-zinc-900">
                    <img
                        src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2400&q=90"
                        alt="Mount Everest and the Himalayas at sunrise"
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                        onError={e => {
                            e.currentTarget.src =
                                'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=2400&q=90'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/45 to-transparent" />
                    <div className="relative flex min-h-[360px] max-w-xl flex-col justify-center px-7 py-10 text-white sm:px-12">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
                            Your travel desk
                        </p>
                        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                            Every journey starts with a view.
                        </h1>
                        <p className="mt-5 max-w-md leading-7 text-zinc-200">
                            Shape memorable days, discover remarkable places,
                            and keep every detail in one considered itinerary.
                        </p>
                        <Link
                            to="/create"
                            className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
                            Plan New Trip <ArrowRight size={17} />
                        </Link>
                    </div>
                </section>
                <section className="col-span-12 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="relative min-w-[220px] flex-1">
                        <Search
                            className="absolute left-3 top-3 text-zinc-400"
                            size={18}
                        />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search for destinations..."
                            className="h-11 w-full rounded-lg bg-zinc-100 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-400/40 dark:bg-zinc-800"
                        />
                    </div>
                    <select className="h-11 rounded-lg border-0 bg-zinc-100 px-3 text-sm dark:bg-zinc-800">
                        <option>Group by region</option>
                        <option>Group by cost</option>
                    </select>
                    <button className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm dark:border-zinc-700">
                        <SlidersHorizontal size={16} />
                        Filter
                    </button>
                    <select className="h-11 rounded-lg border-0 bg-zinc-100 px-3 text-sm dark:bg-zinc-800">
                        <option>Sort by popularity</option>
                        <option>Sort by cost</option>
                    </select>
                </section>
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
                            <Link
                                to="/create"
                                key={c[0] || c.id}
                                className="group overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                                <img
                                    src={c.image || c[3]}
                                    alt={c.name || c[0]}
                                    className="h-28 w-full object-cover transition group-hover:scale-105"
                                />
                                <div className="p-3">
                                    <p className="font-medium">
                                        {c.name || c[0]}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {c.country || c[1]} Â· Popular
                                    </p>
                                </div>
                            </Link>
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
                            <Link
                                to="/builder"
                                key={t.id}
                                className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-5 flex items-center justify-between">
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        {t.status}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                        Resyncing...
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold">
                                    {t.name}
                                </h3>
                                <p className="mt-2 text-sm text-zinc-500">
                                    {t.startDate} â€” {t.endDate}
                                </p>
                                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                    <div className="h-full w-2/3 rounded-full bg-emerald-500" />
                                </div>
                                <p className="mt-2 text-xs text-zinc-500">
                                    Budget {money(budget())}
                                </p>
                            </Link>
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
