import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Share2 } from 'lucide-react'
import { DndContext } from '@dnd-kit/core'
import { Shell } from '../components/Shell'
import { Day as ItineraryDay } from '../components/ItineraryItem'
import { useTripStore } from '../store/useTripStore'
import { money } from '../utils/format'

function Builder() {
    const {
        trips,
        activeTripId,
        activities,
        budget,
        addActivity,
        moveActivity,
    } = useTripStore()
    const t = trips.find(x => x.id === activeTripId) || trips[0]
    const [tab, setTab] = useState('days')
    const [showAdd, setShowAdd] = useState(false)
    const [place, setPlace] = useState('')
    const [date, setDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [amount, setAmount] = useState('')
    const addSection = e => {
        e.preventDefault()
        if (place && date) {
            addActivity(date, {
                id: 'custom-' + Date.now(),
                title: place,
                category: 'Place',
                time: '09:00',
                price: Number(amount) || 0,
                image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
            })
            setShowAdd(false)
            setPlace('')
            setDate('')
            setEndDate('')
            setAmount('')
        }
    }
    return (
        <Shell>
            <div className="min-h-screen bg-paper text-navy">
                <div className="mx-auto max-w-[1400px] px-5 py-8">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-5 border-b border-zinc-200 pb-6 dark:border-zinc-800">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/trips"
                                aria-label="Back to trips"
                                className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
                                <ArrowRight size={17} className="rotate-180" />
                            </Link>
                            <div>
                                <p className="eyebrow">The itinerary</p>
                                <h1 className="serif mt-2 text-4xl">
                                    {t.name}
                                </h1>
                                <p className="mt-1 text-sm text-zinc-500">
                                    {t.startDate} â€” {t.endDate}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-xs text-zinc-500">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                Resyncing...
                            </span>
                            <button className="btn btn-ink">
                                Save Changes
                            </button>
                            <Link
                                className="btn btn-gold flex items-center gap-2"
                                to={`/share/${t.id}`}>
                                <Share2 size={16} /> Share trip
                            </Link>
                        </div>
                    </div>
                    <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                        <DndContext
                            onDragEnd={({ active, over }) => {
                                if (over && active.data.current.day !== over.id)
                                    moveActivity(
                                        active.data.current.day,
                                        over.id,
                                        active.id,
                                    )
                            }}>
                            <div className="space-y-8">
                                {Object.entries(t.itinerary || {}).map(
                                    ([d, items]) => (
                                        <ItineraryDay
                                            key={d}
                                            day={d}
                                            items={items}
                                        />
                                    ),
                                )}
                                {!Object.keys(t.itinerary || {}).length && (
                                    <div className="paper-card p-10 text-center">
                                        Start with an activity from the
                                        discovery rail.
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowAdd(true)}
                                    className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300">
                                    <Plus size={18} /> Add another section
                                </button>
                            </div>
                        </DndContext>
                    </div>
                    {showAdd && (
                        <div
                            className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/50 p-5"
                            role="dialog"
                            aria-modal="true">
                            <form
                                onSubmit={addSection}
                                className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                            Add to itinerary
                                        </p>
                                        <h2 className="mt-2 text-2xl font-semibold">
                                            New section
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAdd(false)}
                                        aria-label="Close">
                                        Ã—
                                    </button>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Place
                                        </label>
                                        <input
                                            required
                                            value={place}
                                            onChange={e =>
                                                setPlace(e.target.value)
                                            }
                                            placeholder="e.g. Colosseum"
                                            className="input mt-2"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">
                                                Start date
                                            </label>
                                            <input
                                                required
                                                type="date"
                                                value={date}
                                                onChange={e =>
                                                    setDate(e.target.value)
                                                }
                                                className="input mt-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">
                                                End date
                                            </label>
                                            <input
                                                type="date"
                                                min={date}
                                                value={endDate}
                                                onChange={e =>
                                                    setEndDate(e.target.value)
                                                }
                                                className="input mt-2"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Budget
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={amount}
                                            onChange={e =>
                                                setAmount(e.target.value)
                                            }
                                            placeholder="â‚¹ 0"
                                            className="input mt-2"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdd(false)}
                                        className="btn flex-1 border border-zinc-200 dark:border-zinc-700">
                                        Cancel
                                    </button>
                                    <button className="btn btn-ink flex-1">
                                        Add section
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    <aside className="paper-card p-6 h-fit lg:sticky lg:top-6">
                        <p className="eyebrow">Live budget</p>
                        <p className="serif text-4xl mt-2">{money(budget())}</p>
                        <div className="h-px bg-gold/30 my-5" />
                        <p className="text-sm text-navy/60 mb-4">
                            Add to your story
                        </p>
                        <div className="space-y-2 max-h-72 overflow-auto">
                            {activities.slice(0, 10).map(a => (
                                <button
                                    onClick={() =>
                                        addActivity(
                                            Object.keys(t.itinerary || {})[0] ||
                                                '2026-06-12',
                                            a,
                                        )
                                    }
                                    className="w-full text-left p-3 rounded-lg hover:bg-paper text-sm flex justify-between">
                                    <span>{a.name}</span>
                                    <span className="text-gold">
                                        +{money(a.price)}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <Link
                            to="/activities"
                            className="block text-center text-sm underline mt-5">
                            Browse all activities
                        </Link>
                    </aside>
                </div>
            </div>
        </Shell>
    )
}

export default Builder
