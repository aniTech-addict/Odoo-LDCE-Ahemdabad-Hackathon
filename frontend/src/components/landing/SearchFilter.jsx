import { Search } from 'lucide-react'

export function SearchFilter({ query, setQuery, groupBy, setGroupBy, sortBy, setSortBy }) {
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
            <select
                value={groupBy}
                onChange={e => setGroupBy(e.target.value)}
                className="h-11 rounded-lg border border-zinc-200 bg-zinc-100 px-3 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                <option value="none">Ungrouped</option>
                <option value="region">Group by region</option>
                <option value="cost">Group by cost</option>
            </select>
            <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="h-11 rounded-lg border border-zinc-200 bg-zinc-100 px-3 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                <option value="popularity">Sort by popularity</option>
                <option value="cost">Sort by cost</option>
            </select>
        </section>
    )
}
