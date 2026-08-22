import { AlertTriangle } from 'lucide-react'
import { money } from '../../utils/format'

export function BudgetAlertsCard({ over }) {
    return (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/20 lg:col-span-4">
            <h2 className="flex items-center gap-2 font-semibold text-rose-700 dark:text-rose-300">
                <AlertTriangle size={18} /> Budget alerts
            </h2>
            {over.length ? (
                <div className="mt-4 space-y-3">
                    {over.map((x, idx) => (
                        <p key={idx} className="text-sm text-rose-700 dark:text-rose-300">
                            {x.name} exceeds target by{' '}
                            {money(x.cost - x.target)}
                        </p>
                    ))}
                </div>
            ) : (
                <p className="mt-4 text-sm text-rose-700/70 dark:text-rose-300/70">
                    All planned days are within the daily
                    target.
                </p>
            )}
        </section>
    )
}
