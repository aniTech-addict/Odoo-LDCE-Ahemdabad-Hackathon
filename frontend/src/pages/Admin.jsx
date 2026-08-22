import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Shell } from '../components/Shell'
import { api } from '../services/api'
import { AdminAdoptionChart } from '../components/admin/AdminAdoptionChart'
import { AdminDestinationChart } from '../components/admin/AdminDestinationChart'
import { UserManagementTable } from '../components/admin/UserManagementTable'

function Admin() {
    const [range, setRange] = useState('Last 30 days')
    const [exported, setExported] = useState(false)
    const [analytics, setAnalytics] = useState(null)

    useEffect(() => {
        api.getAdminAnalytics(range).then(setAnalytics)
    }, [range])

    const trend = analytics?.trend || []
    const cityData = analytics?.topCities || []
    const users = analytics?.users || []
    const metrics = analytics?.metrics || []
    const topActivities = analytics?.topActivities || []

    return (
        <Shell>
            <div className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                <div className="mx-auto max-w-7xl">
                    <header className="flex flex-wrap items-center justify-between gap-5 border-b border-zinc-200 pb-6 dark:border-zinc-800">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[.22em] text-zinc-500">
                                Operations
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                                <h1 className="text-4xl font-semibold tracking-tight">
                                    Admin Analytics Dashboard
                                </h1>
                                <span className="flex items-center gap-2 text-xs text-zinc-500">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                    Resyncing...
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={range}
                                onChange={e => setRange(e.target.value)}
                                className="input w-auto">
                                <option>Last 30 days</option>
                                <option>Last 90 days</option>
                                <option>This year</option>
                            </select>
                            <button
                                onClick={() => setExported(true)}
                                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                                <Download size={16} />
                                {exported ? 'Exported' : 'Export CSV'}
                            </button>
                        </div>
                    </header>
                    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {metrics.map(({ label, value, delta }, idx) => (
                            <div key={idx} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <p className="text-sm text-zinc-500">{label}</p>
                                <p className="mt-3 text-2xl font-semibold">
                                    {value}
                                </p>
                                <p className="mt-2 text-xs font-medium text-emerald-600">
                                    {delta}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <AdminAdoptionChart trend={trend} />
                        <AdminDestinationChart cityData={cityData} />
                    </div>
                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
                                <h2 className="font-semibold">
                                    Top activities
                                </h2>
                            </div>
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {topActivities.map(activity => (
                                    <div
                                        key={activity.name}
                                        className="flex items-center justify-between px-6 py-4 text-sm">
                                        <span>{activity.name}</span>
                                        <span className="font-semibold text-zinc-500">
                                            {activity.additions} additions
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <UserManagementTable users={users} />
                    </div>
                </div>
            </div>
        </Shell>
    )
}

export default Admin
