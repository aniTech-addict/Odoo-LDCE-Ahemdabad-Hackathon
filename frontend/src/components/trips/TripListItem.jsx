import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

import { imageOrDefault } from '../../utils/images'

export function TripListItem({ trip, setActive, removeTrip }) {
    return (
        <article className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900">
            <img
                src={imageOrDefault(trip.cover)}
                alt={trip.name}
                className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-40"
            />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{trip.name}</h3>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {trip.status}
                    </span>
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                    {trip.startDate} — {trip.endDate} · {trip.cities.length}{' '}
                    destinations
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                    Ready for your next chapter
                </p>
            </div>
            <div className="flex shrink-0 gap-2">
                <Link
                    to="/builder"
                    onClick={() => setActive(trip.id)}
                    className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400">
                    View
                </Link>
                <Link
                    to="/builder"
                    onClick={() => setActive(trip.id)}
                    className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium dark:border-zinc-700">
                    Edit
                </Link>
                <button
                    onClick={() => removeTrip(trip.id)}
                    aria-label={`Delete ${trip.name}`}
                    className="rounded-lg border border-zinc-200 px-3 text-zinc-400 hover:border-rose-300 hover:text-rose-500 dark:border-zinc-700">
                    <Trash2 size={17} />
                </button>
            </div>
        </article>
    )
}
