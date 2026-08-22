import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, Plus } from 'lucide-react'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'

function Create() {
    const [step, setStep] = useState(1)
    const [destination, setDestination] = useState('')
    const [name, setName] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [description, setDescription] = useState('')
    const [cover, setCover] = useState('')
    const [pending, setPending] = useState(false)
    const { cities, selectedCities, addCity, createTrip, activities } =
        useTripStore()
    const nav = useNavigate()
    return (
        <Shell>
            <div className="max-w-5xl mx-auto px-5 py-14">
                <p className="eyebrow">Create a trip Â· 0{step} / 03</p>
                <h1 className="serif text-5xl mt-3 mb-10">
                    A new chapter begins.
                </h1>
                {step === 1 && (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
                        <div className="paper-card p-6 space-y-5">
                            <div>
                                <label className="text-sm font-semibold">
                                    Trip Name
                                </label>
                                <input
                                    className="input mt-2"
                                    placeholder="A Tale of Two Canals"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold">
                                    Destination / Place
                                </label>
                                <input
                                    className="input mt-2"
                                    list="destination-options"
                                    placeholder="Type a city or choose from the list"
                                    value={destination}
                                    onChange={e => {
                                        const value = e.target.value
                                        setDestination(value)
                                        const match = cities.find(
                                            c =>
                                                `${c.name}, ${c.country}` ===
                                                    value || c.name === value,
                                        )
                                        if (
                                            match &&
                                            !selectedCities.includes(match.id)
                                        )
                                            addCity(match.id)
                                    }}
                                />
                                <datalist id="destination-options">
                                    {cities.map(c => (
                                        <option
                                            key={c.id}
                                            value={`${c.name}, ${c.country}`}
                                        />
                                    ))}
                                </datalist>
                                <p className="mt-2 text-xs text-navy/50">
                                    Type a destination or open the field to
                                    choose a suggested city.
                                </p>
                                {selectedCities.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedCities.map(id => {
                                            const city = cities.find(
                                                c => c.id === id,
                                            )
                                            return (
                                                <span
                                                    key={id}
                                                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
                                                    {city?.name || id}
                                                </span>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold">
                                        Start date
                                    </label>
                                    <input
                                        type="date"
                                        className="input mt-2"
                                        value={startDate}
                                        onChange={e =>
                                            setStartDate(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">
                                        End date
                                    </label>
                                    <input
                                        type="date"
                                        className="input mt-2"
                                        value={endDate}
                                        min={startDate}
                                        onChange={e =>
                                            setEndDate(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold">
                                    Trip Description
                                </label>
                                <textarea
                                    rows="4"
                                    className="input mt-2 resize-none"
                                    placeholder="What do you want this journey to feel like?"
                                    value={description}
                                    onChange={e =>
                                        setDescription(e.target.value)
                                    }
                                />
                            </div>
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy/20 px-5 py-7 text-center">
                                <Plus size={22} className="text-gold" />
                                <span className="mt-2 text-sm font-medium">
                                    {cover || 'Add a cover photo'}
                                </span>
                                <span className="mt-1 text-xs text-navy/50">
                                    Optional Â· choose an image file
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={e =>
                                        setCover(
                                            e.target.files?.[0]?.name || '',
                                        )
                                    }
                                />
                            </label>
                        </div>
                        <aside className="paper-card p-6">
                            <p className="eyebrow flex items-center gap-2">
                                <Compass size={15} /> Inspiration
                            </p>
                            <h2 className="serif text-2xl mt-2">
                                Suggestions for your route
                            </h2>
                            <div className="mt-5 space-y-3">
                                {(activities || []).slice(0, 3).map(a => (
                                    <div
                                        key={a.id}
                                        className="flex gap-3 border-b border-gold/20 pb-3">
                                        <img
                                            src={a.image}
                                            alt=""
                                            className="h-14 w-16 rounded-lg object-cover"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {a.name}
                                            </p>
                                            <p className="text-xs text-navy/60">
                                                {a.category} Â· â‚¹
                                                {a.price.toLocaleString(
                                                    'en-IN',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                )}
                {step === 2 && (
                    <div>
                        <p className="text-navy/60 mb-5">
                            Choose two or more places to build your route.
                        </p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cities.map(c => (
                                <button
                                    onClick={() => addCity(c.id)}
                                    className={`text-left paper-card overflow-hidden ${selectedCities.includes(c.id) ? 'ring-2 ring-gold' : ''}`}>
                                    <img
                                        src={c.image}
                                        alt={c.name}
                                        className="h-32 w-full object-cover"
                                    />
                                    <div className="p-4">
                                        <p className="serif text-xl">
                                            {c.name}
                                        </p>
                                        <p className="text-xs text-navy/60">
                                            {c.country}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="paper-card p-7 max-w-xl">
                        <p className="eyebrow">Your route</p>
                        <h2 className="serif text-3xl mt-2">
                            {name || 'Untitled journey'}
                        </h2>
                        <p className="mt-4">
                            {selectedCities.length} cities selected. Weâ€™ll
                            shape the days around your pace.
                        </p>
                    </div>
                )}
                <div className="flex justify-between mt-12 max-w-xl">
                    <button
                        className="btn border border-navy/20"
                        disabled={step === 1}
                        onClick={() => setStep(step - 1)}>
                        Back
                    </button>
                    {step < 3 ? (
                        <button
                            className="btn btn-ink"
                            onClick={() => setStep(3)}>
                            Continue{' '}
                            <ArrowRight className="inline ml-2" size={16} />
                        </button>
                    ) : (
                        <button
                            className="btn btn-gold"
                            onClick={() => {
                                createTrip({
                                    id: 'trip-' + Date.now(),
                                    name: name || 'New journey',
                                    cities: selectedCities,
                                    startDate: startDate || '2026-07-01',
                                    endDate: endDate || '2026-07-08',
                                    description,
                                    status: 'Upcoming',
                                    cover:
                                        cover ||
                                        cities.find(
                                            c => c.id === selectedCities[0],
                                        )?.image ||
                                        cities[0]?.image,
                                    itinerary: {},
                                })
                                nav('/builder')
                            }}>
                            Build itinerary
                        </button>
                    )}
                </div>
            </div>
        </Shell>
    )
}

export default Create
