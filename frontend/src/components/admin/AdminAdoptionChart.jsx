import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

export function AdminAdoptionChart({ trend }) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[.2em] text-zinc-500">
                        Adoption
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                        Trips created timeline
                    </h2>
                </div>
                <span className="text-xs text-emerald-600">
                    +24% growth
                </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trend}>
                    <defs>
                        <linearGradient
                            id="tripFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#2563eb"
                                stopOpacity=".32"
                            />
                            <stop
                                offset="100%"
                                stopColor="#2563eb"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area
                        type="monotone"
                        dataKey="trips"
                        stroke="#2563eb"
                        fill="url(#tripFill)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </section>
    )
}
