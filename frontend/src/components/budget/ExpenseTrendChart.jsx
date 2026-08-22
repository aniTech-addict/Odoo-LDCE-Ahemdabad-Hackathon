import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { money } from '../../utils/format'

export function ExpenseTrendChart({ daily, targetLabel }) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-8">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[.2em] text-zinc-500">
                        Daily trend
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                        Expense by day
                    </h2>
                </div>
                <span className="text-xs text-zinc-500">
                    Target {money(targetLabel)}/day
                </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={daily}>
                    <XAxis dataKey="name" />
                    <YAxis
                        tickFormatter={v =>
                            `₹${Math.round(v / 1000)}k`
                        }
                    />
                    <Tooltip formatter={v => money(v)} />
                    <Bar
                        dataKey="cost"
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </section>
    )
}
