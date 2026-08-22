import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export function AdminDestinationChart({ cityData }) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-zinc-500">
                Discovery
            </p>
            <h2 className="mt-2 text-xl font-semibold">
                Top cities & destinations
            </h2>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart
                    data={cityData}
                    layout="vertical"
                    margin={{ left: 20 }}
                >
                    <XAxis type="number" />
                    <YAxis
                        dataKey="city"
                        type="category"
                        width={80}
                    />
                    <Tooltip />
                    <Bar
                        dataKey="selections"
                        fill="#f59e0b"
                        radius={[0, 6, 6, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </section>
    )
}
