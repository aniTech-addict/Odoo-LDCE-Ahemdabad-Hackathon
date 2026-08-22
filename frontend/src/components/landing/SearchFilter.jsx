import { Search, SlidersHorizontal } from 'lucide-react'

export function SearchFilter({ query, setQuery }) {
    return (
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
                    className="h-11 w-full rounded-lg bg-zinc-100 pl-10 pr-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-sky-400/40 dark:bg-zinc-800 dark:text-zinc-100"
                />
            </div>
            <select className="h-11 rounded-lg border-0 bg-zinc-100 px-3 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <option>Group by region</option>
                <option>Group by cost</option>
            </select>
            <button className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
                <SlidersHorizontal size={16} />
                Filter
            </button>
            <select className="h-11 rounded-lg border-0 bg-zinc-100 px-3 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <option>Sort by popularity</option>
                <option>Sort by cost</option>
            </select>
        </section>
    )
}
