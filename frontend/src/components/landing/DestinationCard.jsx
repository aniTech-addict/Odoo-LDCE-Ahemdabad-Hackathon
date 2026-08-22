import { Link } from 'react-router-dom'

export function DestinationCard({ city }) {
    return (
        <Link
            to="/create"
            className="group overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <img
                src={city.image || city[3]}
                alt={city.name || city[0]}
                className="h-28 w-full object-cover transition group-hover:scale-105"
            />
            <div className="p-3">
                <p className="font-medium">
                    {city.name || city[0]}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                    {city.country || city[1]} · Popular
                </p>
            </div>
        </Link>
    )
}
