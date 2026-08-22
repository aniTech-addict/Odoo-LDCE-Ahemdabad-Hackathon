import { money } from '../../utils/format'

export function MajorExpensesList({ activities }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-8">
            <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
                <h2 className="font-semibold">
                    Major expenses
                </h2>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {activities.slice(0, 8).map((a, idx) => (
                    <div key={idx} className="flex items-center justify-between px-6 py-4 text-sm">
                        <span>{a.title || a.name}</span>
                        <span className="font-semibold">
                            {money(a.price || 0)}
                        </span>
                    </div>
                ))}
                {!activities.length && (
                    <p className="p-6 text-sm text-zinc-500">
                        No individual expenses added yet.
                    </p>
                )}
            </div>
        </section>
    )
}
