import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'
import { money } from '../utils/format'
import { CostBreakdownCard } from '../components/budget/CostBreakdownCard'
import { ExpenseTrendChart } from '../components/budget/ExpenseTrendChart'
import { BudgetAlertsCard } from '../components/budget/BudgetAlertsCard'
import { MajorExpensesList } from '../components/budget/MajorExpensesList'

function Budget() {
    const { budget, trips, activeTripId } = useTripStore()
    const t = trips.find(x => x.id === activeTripId) || trips[0]
    const total = budget()
    const allocated = Math.max(total + Math.round(total * 0.18), 50000)
    const remaining = allocated - total
    const days = Object.keys(t.itinerary || {}).length || 1
    const activities = Object.values(t.itinerary || {}).flat()

    const breakdown = [
        {
            name: 'Activities',
            value: activities.reduce((n, a) => n + (a.price || 0), 0),
            color: '#2563eb',
        },
        { name: 'Stay', value: days * 3500, color: '#8b5cf6' },
        { name: 'Meals', value: days * 1500, color: '#f59e0b' },
        {
            name: 'Transport',
            value: Math.max(0, (t.cities?.length || 1) - 1) * 5000,
            color: '#10b981',
        },
    ]

    const daily = Object.entries(t.itinerary || {}).map(([date, items]) => ({
        name: date.slice(5),
        cost: items.reduce((n, a) => n + (a.price || 0), 0) + 5000,
        target: Math.round(allocated / days),
    }))

    const over = daily.filter(x => x.cost > x.target)
    const targetVal = Math.round(allocated / days)

    return (
        <Shell>
            <div className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                <div className="mx-auto max-w-7xl">
                    <header className="flex flex-wrap items-center justify-between gap-5 border-b border-zinc-200 pb-6 dark:border-zinc-800">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/trips"
                                aria-label="Back to trips"
                                className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
                                <ArrowRight size={17} className="rotate-180" />
                            </Link>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[.22em] text-zinc-500">
                                    Trip finances
                                </p>
                                <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                                    {t.name}
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${remaining >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-50 text-rose-700'}`}>
                                {remaining >= 0 ? 'On track' : 'Over budget'}
                            </span>
                            <span className="flex items-center gap-2 text-xs text-zinc-500">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                Resyncing...
                            </span>
                        </div>
                    </header>
                    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            ['Allocated', allocated, 'text-zinc-900'],
                            ['Estimated cost', total, 'text-zinc-900'],
                            ['Remaining', remaining, 'text-emerald-600'],
                            [
                                'Average / day',
                                Math.round(total / days),
                                'text-zinc-900',
                            ],
                        ].map(([label, value, cls], idx) => (
                            <div key={idx} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                                <p className="text-sm text-zinc-500">{label}</p>
                                <p
                                    className={`mt-3 text-2xl font-semibold ${cls}`}>
                                    {money(value)}
                                </p>
                                {label === 'Estimated cost' && (
                                    <p className="mt-2 text-xs text-emerald-600">
                                        {Math.round((total / allocated) * 100)}%
                                        of allocation
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 grid gap-6 lg:grid-cols-12">
                        <CostBreakdownCard breakdown={breakdown} />
                        <ExpenseTrendChart daily={daily} targetLabel={targetVal} />
                    </div>
                    <div className="mt-6 grid gap-6 lg:grid-cols-12">
                        <BudgetAlertsCard over={over} />
                        <MajorExpensesList activities={activities} />
                    </div>
                </div>
            </div>
        </Shell>
    )
}

export default Budget
