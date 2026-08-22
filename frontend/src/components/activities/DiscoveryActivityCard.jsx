import { money } from '../../utils/format'

export function DiscoveryActivityCard({ activity, addActivity, trip }) {
    return (
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <img
                src={activity.image}
                alt={activity.name}
                className="h-44 w-full object-cover"
            />
            <div className="p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                    {activity.category} ·{' '}
                    {activity.duration || 'Half day'}
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                    {activity.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {activity.description}
                </p>
                <div className="mt-5 flex items-center justify-between">
                    <span className="font-semibold">
                        {money(activity.price)}
                    </span>
                    <button
                        onClick={() =>
                            addActivity(
                                Object.keys(trip?.itinerary || {})[0] ||
                                    '2026-06-12',
                                activity,
                            )
                        }
                        className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400"
                    >
                        Add to Trip
                    </button>
                </div>
            </div>
        </article>
    )
}
