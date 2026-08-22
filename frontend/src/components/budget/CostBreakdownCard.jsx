import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { money } from '../../utils/format'

export function CostBreakdownCard({ breakdown }) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-zinc-500">
                Cost breakdown
            </p>
            <h2 className="mt-2 text-xl font-semibold">
                Where it goes
            </h2>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={breakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={92}
                        paddingAngle={4}
                    >
                        {breakdown.map(x => (
                            <Cell key={x.name} fill={x.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={v => money(v)} />
                </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
                {breakdown.map(x => (
                    <div
                        key={x.name}
                        className="flex items-center justify-between text-sm"
                    >
                        <span className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ background: x.color }}
                            />
                            {x.name}
                        </span>
                        <b>{money(x.value)}</b>
                    </div>
                ))}
            </div>
        </section>
    )
}
