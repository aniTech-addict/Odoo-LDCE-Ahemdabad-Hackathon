import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Share2 } from 'lucide-react'
import { DndContext } from '@dnd-kit/core'
import { Shell } from '../components/Shell'
import { Day as ItineraryDay } from '../components/ItineraryItem'
import { useTripStore } from '../store/useTripStore'
import { AddSectionModal } from '../components/builder/AddSectionModal'
import { LiveBudgetSidebar } from '../components/builder/LiveBudgetSidebar'

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
    const [showAdd, setShowAdd] = useState(false)

    const handleAddSection = ({ place, date, amount }) => {
        addActivity(date, {
            id: 'custom-' + Date.now(),
            title: place,
            category: 'Place',
            time: '09:00',
            price: Number(amount) || 0,
            image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
        })
        setShowAdd(false)
    }

    const itineraryDays = Object.keys(t.itinerary || {})

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
                                    {t.startDate} — {t.endDate}
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
                                {!itineraryDays.length && (
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
                        <LiveBudgetSidebar
                            budget={budget}
                            activities={activities}
                            addActivity={addActivity}
                            itineraryDays={itineraryDays}
                        />
                    </div>
                    <AddSectionModal
                        isOpen={showAdd}
                        onClose={() => setShowAdd(false)}
                        onSubmit={handleAddSection}
                    />
                </div>
            </div>
        </Shell>
    )
}

export default Builder
