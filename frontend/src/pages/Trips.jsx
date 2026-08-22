import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'

function Trips() {
    const { trips, setActive, removeTrip } = useTripStore()
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
            sort === 'Aâ€“Z'
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
                            <option>Aâ€“Z</option>
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
                                <article
                                    key={t.id}
                                    className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900">
                                    <img
                                        src={t.cover}
                                        alt={t.name}
                                        className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-40"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-semibold">
                                                {t.name}
                                            </h3>
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                {t.status}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-zinc-500">
                                            {t.startDate} â€” {t.endDate} Â·{' '}
                                            {t.cities.length} destinations
                                        </p>
                                        <p className="mt-2 text-xs text-zinc-400">
                                            Ready for your next chapter
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <Link
                                            to="/builder"
                                            onClick={() => setActive(t.id)}
                                            className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400">
                                            View
                                        </Link>
                                        <Link
                                            to="/builder"
                                            onClick={() => setActive(t.id)}
                                            className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium dark:border-zinc-700">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => removeTrip(t.id)}
                                            aria-label={`Delete ${t.name}`}
                                            className="rounded-lg border border-zinc-200 px-3 text-zinc-400 hover:border-rose-300 hover:text-rose-500 dark:border-zinc-700">
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </article>
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
