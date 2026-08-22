import { Link, useParams } from 'react-router-dom'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'
import { ShareHero } from '../components/share/ShareHero'
import { CitiesVisitedList } from '../components/share/CitiesVisitedList'

function Share() {
    const { id } = useParams()
    const { trips } = useTripStore()
    const t = trips.find(x => x.id === id) || trips[0]
    const cities = useTripStore(s => s.cities)

    const cityNames = (t.cities || []).map(
        id => cities.find(c => c.id === id)?.name || id,
    )
    const days = Object.keys(t.itinerary || {}).length || 1

    return (
        <Shell>
            <main className="mx-auto max-w-7xl px-5 py-6">
                <ShareHero
                    cover={t.cover}
                    name={t.name}
                    startDate={t.startDate}
                    endDate={t.endDate}
                    createdBy={t.createdBy}
                />
                <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <div>
                        <p className="text-2xl font-semibold">{days}</p>
                        <p className="text-xs text-zinc-500">Total days</p>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold">
                            {cityNames.length}
                        </p>
                        <p className="text-xs text-zinc-500">Destinations</p>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold">Slow travel</p>
                        <p className="text-xs text-zinc-500">Vibe</p>
                    </div>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-12">
                    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-9">
                        <h2 className="text-xl font-semibold">The itinerary</h2>
                        <div className="mt-6 space-y-8">
                            {Object.entries(t.itinerary || {}).map(
                                ([d, items]) => (
                                    <article
                                        key={d}
                                        className="border-l-2 border-sky-200 pl-5">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                            {d}
                                        </p>
                                        <div className="mt-4 space-y-4">
                                            {items.map(a => (
                                                <div key={a.id}>
                                                    <p className="text-sm font-semibold text-sky-600">
                                                        {a.time}
                                                    </p>
                                                    <p className="mt-1 text-lg font-semibold">
                                                        {a.title}
                                                    </p>
                                                    <p className="mt-1 text-sm text-zinc-500">
                                                        {a.category ||
                                                            'Activity'}{' '}
                                                        · A considered detail
                                                        for the day.
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </section>
                    <aside className="space-y-6 lg:col-span-3">
                        <CitiesVisitedList
                            cityNames={cityNames}
                            cities={cities}
                            trip={t}
                        />
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                            <p className="text-lg font-semibold">
                                Make it yours
                            </p>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">
                                Sign up to customize this trip and add your own
                                details.
                            </p>
                            <Link
                                to="/login"
                                className="mt-5 block rounded-lg bg-sky-500 px-4 py-3 text-center text-sm font-semibold text-white">
                                Sign up to customize
                            </Link>
                        </div>
                    </aside>
                </div>
            </main>
        </Shell>
    )
}

export default Share
