import { Link } from 'react-router-dom'
import { money } from '../../utils/format'

export function LiveBudgetSidebar({ budget, activities, addActivity, itineraryDays }) {
    return (
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
                        key={a.id}
                        onClick={() =>
                            addActivity(
                                itineraryDays[0] || '2026-06-12',
                                a,
                            )
                        }
                        className="w-full text-left p-3 rounded-lg hover:bg-paper text-sm flex justify-between"
                    >
                        <span>{a.name}</span>
                        <span className="text-gold">
                            +{money(a.price)}
                        </span>
                    </button>
                ))}
            </div>
            <Link
                to="/activities"
                className="block text-center text-sm underline mt-5"
            >
                Browse all activities
            </Link>
        </aside>
    )
}
