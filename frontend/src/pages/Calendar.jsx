import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'
import { CalendarCell } from '../components/calendar/CalendarCell'

function Calendar() {
    const { user, trips, activeTripId } = useTripStore()

    if (!user) {
        return (
            <Shell>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-5">
                    <h2 className="serif text-3xl font-semibold mb-2">Calendar & Timeline</h2>
                    <p className="text-zinc-500 text-sm max-w-sm mb-5 dark:text-zinc-400">
                        Please sign in to view your itinerary calendar and events.
                    </p>
                    <Link to="/login" className="bg-sky-500 hover:bg-sky-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition shadow-sm">
                        Sign In / Register
                    </Link>
                </div>
            </Shell>
        )
    }

    const t = trips.find(x => x.id === activeTripId) || trips[0]

    if (!t) {
        return (
            <Shell>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-5">
                    <p className="text-zinc-500 text-sm dark:text-zinc-400">No active trips found. Start by planning a trip to view your calendar!</p>
                    <Link to="/create" className="mt-4 bg-sky-500 hover:bg-sky-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition shadow-sm">Plan a Trip</Link>
                </div>
            </Shell>
        )
    }

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

    const todayStr = key(new Date())

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
                                {t.name} · {t.startDate} — {t.endDate}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prev}
                                aria-label="Previous month"
                                className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700">
                                ‹
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
                                ›
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
                                const isToday = dateKey === todayStr

                                return (
                                    <CalendarCell
                                        key={i}
                                        day={day}
                                        dateKey={dateKey}
                                        items={items}
                                        inTrip={inTrip}
                                        isToday={isToday}
                                    />
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
