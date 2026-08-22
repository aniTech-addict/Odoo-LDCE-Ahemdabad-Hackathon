import { useState } from 'react'
import { Search } from 'lucide-react'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'
import { CityCard } from '../components/activities/CityCard'
import { DiscoveryActivityCard } from '../components/activities/DiscoveryActivityCard'
import { imageOrDefault } from '../utils/images'

function Activities() {
    const { activities, addActivity, trips, activeTripId, cities, addCity } =
        useTripStore()
    const t = trips.find(x => x.id === activeTripId) || trips[0]
    const [tab, setTab] = useState('cities')
    const [query, setQuery] = useState('')
    const [region, setRegion] = useState('All regions')
    const [type, setType] = useState('All types')
    const [cost, setCost] = useState('Any cost')
    const [duration, setDuration] = useState('Any duration')

    const cityName = c => c?.name || c?.[0] || 'City'
    const cityCountry = c => c?.country || c?.[1] || ''
    const cityRegion = c => c?.region || c?.[2] || 'Other'
    const cityImage = c => imageOrDefault(c?.image || c?.[3])

    const regions = ['All regions', ...new Set(cities.map(cityRegion))]
    const types = ['All types', ...new Set(activities.map(a => a.category))]

    const cityResults = cities.filter(
        c =>
            cityName(c).toLowerCase().includes(query.toLowerCase()) &&
            (region === 'All regions' || cityRegion(c) === region),
    )

    const activityResults = activities.filter(
        a =>
            [a.name, a.category, a.description]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(query.toLowerCase()) &&
            (type === 'All types' || a.category === type) &&
            (cost === 'Any cost' ||
                (cost === 'Under ₹2,000' && Number(a.price) < 2000) ||
                (cost === '₹2,000+' && Number(a.price) >= 2000)) &&
            (duration === 'Any duration' ||
                (duration === 'Under 2 hours' &&
                    /(?:^|\D)(?:1|0(?:\.\d+)?)\s*(?:hours?|hrs?)/i.test(
                        a.duration_label || a.duration || '',
                    )) ||
                (duration === 'Half day' &&
                    /half\s*day/i.test(a.duration_label || a.duration || ''))),
    )

    return (
        <Shell>
            <div className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-5 border-b border-zinc-200 pb-6 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[.22em] text-zinc-500">
                                    The discovery desk
                                </p>
                                <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                                    Find places to remember.
                                </h1>
                            </div>
                            <span className="flex items-center gap-2 text-xs text-zinc-500">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                Resyncing...
                            </span>
                        </div>
                        <div className="relative mx-auto w-full max-w-2xl">
                            <Search
                                className="absolute left-4 top-3.5 text-zinc-400"
                                size={20}
                            />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder={`Search ${tab === 'cities' ? 'cities' : 'activities'}...`}
                                className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 outline-none focus:ring-2 focus:ring-sky-400/40 dark:border-zinc-800 dark:bg-zinc-900"
                            />
                        </div>
                        <div className="flex gap-2 self-center rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
                            <button
                                onClick={() => setTab('cities')}
                                className={`rounded-md px-6 py-2 text-sm font-semibold ${tab === 'cities' ? 'bg-white text-sky-600 shadow-sm dark:bg-zinc-800' : ''}`}>
                                Cities
                            </button>
                            <button
                                onClick={() => setTab('activities')}
                                className={`rounded-md px-6 py-2 text-sm font-semibold ${tab === 'activities' ? 'bg-white text-sky-600 shadow-sm dark:bg-zinc-800' : ''}`}>
                                Activities
                            </button>
                        </div>
                    </div>
                    {tab === 'cities' ? (
                        <>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <select
                                    value={region}
                                    onChange={e => setRegion(e.target.value)}
                                    className="input max-w-xs">
                                    <option>{regions[0]}</option>
                                    {regions.slice(1).map(r => (
                                        <option key={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {cityResults.map(c => (
                                    <CityCard
                                        key={cityName(c)}
                                        city={c}
                                        addCity={addCity}
                                        cityName={cityName}
                                        cityCountry={cityCountry}
                                        cityRegion={cityRegion}
                                        cityImage={cityImage}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="input max-w-xs">
                                    <option>{types[0]}</option>
                                    {types.slice(1).map(x => (
                                        <option key={x}>{x}</option>
                                    ))}
                                </select>
                                <select
                                    value={cost}
                                    onChange={e => setCost(e.target.value)}
                                    className="input max-w-xs">
                                    <option>Any cost</option>
                                    <option>Under ₹2,000</option>
                                    <option>₹2,000+</option>
                                </select>
                                <select
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    className="input max-w-xs">
                                    <option>Any duration</option>
                                    <option>Under 2 hours</option>
                                    <option>Half day</option>
                                </select>
                            </div>
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {activityResults.map(a => (
                                    <DiscoveryActivityCard
                                        key={a.id}
                                        activity={a}
                                        addActivity={addActivity}
                                        trip={t}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Shell>
    )
}

export default Activities
