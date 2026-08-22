import { Link } from 'react-router-dom'

export function TripCard({ trip, budget }) {
    return (
        <Link
            to="/builder"
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {trip.status}
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Resyncing...
                </span>
            </div>
            <h3 className="text-lg font-semibold">{trip.name}</h3>
            <p className="mt-2 text-sm text-zinc-500">
                {trip.startDate} — {trip.endDate}
            </p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full w-2/3 rounded-full bg-emerald-500" />
            </div>
        </Link>
    )
}
