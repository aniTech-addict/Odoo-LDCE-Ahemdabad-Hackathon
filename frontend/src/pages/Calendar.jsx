import { useState } from 'react'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'

function Calendar() {
    const { trips, activeTripId } = useTripStore()
    const t = trips.find(x => x.id === activeTripId) || trips[0]
    const events = Object.entries(t.itinerary || {}).reduce(
        (acc, [date, items]) => ({ ...acc, [date]: items }),
        {},
    )
    const start = new Date(t.startDate + 'T00:00:00')
    const end = new Date(t.endDate + 'T00:00:00')
    const [month, setMonth] = useState(
        new Date(start.getFullYear(), start.getMonth(), 1),
    )
    const days = []
    const cursor = new Date(month.getFullYear(), month.getMonth(), 1)
    const first = (cursor.getDay() + 6) % 7
    for (let i = 0; i < first; i++) days.push(null)
    while (cursor.getMonth() === month.getMonth()) {
        days.push(new Date(cursor))
        cursor.setDate(cursor.getDate() + 1)
    }
    const prev = () =>
        setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
    const next = () =>
        setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
    const key = d => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }
    return (
        <Shell>
            <div className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                <div className="mx-auto max-w-7xl">
                    <header className="flex flex-wrap items-end justify-between gap-5 border-b border-zinc-200 pb-6 dark:border-zinc-800">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[.22em] text-zinc-500">
                                The rhythm of the trip
                            </p>
                            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                                Calendar
                            </h1>
                            <p className="mt-2 text-sm text-zinc-500">
                                {t.name} Â· {t.startDate} â€” {t.endDate}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prev}
                                aria-label="Previous month"
                                className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700">
                                â€¹
                            </button>
                            <p className="min-w-36 text-center font-semibold">
                                {month.toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                            <button
                                onClick={next}
                                aria-label="Next month"
                                className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700">
                                â€º
                            </button>
                        </div>
                    </header>
                    <div className="mt-7 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="grid grid-cols-7 border-b border-zinc-200 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                            {[
                                'Mon',
                                'Tue',
                                'Wed',
                                'Thu',
                                'Fri',
                                'Sat',
                                'Sun',
                            ].map(x => (
                                <div key={x} className="p-3">
                                    {x}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7">
                            {days.map((day, i) => {
                                const dateKey = day && key(day)
                                const items = events[dateKey] || []
                                const inTrip = day && day >= start && day <= end
                                return (
                                    <div
                                        key={i}
                                        className={`min-h-28 border-b border-r border-zinc-100 p-2 dark:border-zinc-800 sm:min-h-36 ${inTrip ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/70 dark:bg-zinc-950/30'}`}>
                                        {day && (
                                            <>
                                                <div
                                                    className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm ${dateKey === key(new Date()) ? 'bg-sky-500 font-semibold text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
                                                    {day.getDate()}
                                                </div>
                                                <div className="space-y-1">
                                                    {items.map(item => (
                                                        <div
                                                            key={item.id}
                                                            className="min-h-12 rounded-md border border-sky-200 bg-sky-100 px-2 py-2 text-xs font-semibold leading-4 text-sky-900 shadow-sm dark:border-sky-800 dark:bg-sky-900/70 dark:text-sky-100">
                                                            <span className="mb-0.5 block text-[10px] font-bold text-sky-700 dark:text-sky-300">
                                                                {item.time ||
                                                                    'All day'}
                                                            </span>
                                                            <span className="block truncate">
                                                                {item.title ||
                                                                    item.name ||
                                                                    'Trip event'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {inTrip && !items.length && (
                                                    <span className="text-[10px] text-zinc-400">
                                                        Open day
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded bg-sky-500" />
                            Planned activity
                        </span>
                        <span>
                            {Object.values(events).flat().length} events
                            scheduled
                        </span>
                    </div>
                </div>
            </div>
        </Shell>
    )
}

export default Calendar
