import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'
import { InspirationSidebar } from '../components/create/InspirationSidebar'
import { CitySelectionGrid } from '../components/create/CitySelectionGrid'
import { api } from '../services/api'

function Create() {
    const [step, setStep] = useState(1)
    const [destination, setDestination] = useState('')
    const [name, setName] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [description, setDescription] = useState('')
    const [cover, setCover] = useState('')
    const [pending, setPending] = useState(false)
    const [error, setError] = useState('')
    const { cities, selectedCities, addCity, createTrip, activities } =
        useTripStore()
    const nav = useNavigate()

    return (
        <Shell>
            <div className="max-w-5xl mx-auto px-5 py-14">
                <p className="eyebrow">Create a trip · 0{step} / 03</p>
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
                                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
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
                                <span className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                                    Optional · choose an image file
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
                        <InspirationSidebar activities={activities} />
                    </div>
                )}
                {step === 2 && (
                    <CitySelectionGrid
                        cities={cities}
                        selectedCities={selectedCities}
                        addCity={addCity}
                    />
                )}
                {step === 3 && (
                    <div className="paper-card p-7 max-w-xl">
                        <p className="eyebrow">Your route</p>
                        <h2 className="serif text-3xl mt-2">
                            {name || 'Untitled journey'}
                        </h2>
                        <p className="mt-4">
                            {selectedCities.length} cities selected. We’ll shape
                            the days around your pace.
                        </p>
                    </div>
                )}
                <div className="flex justify-between mt-12 max-w-xl">
                    <button
                        className="btn border border-zinc-300 px-4 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        disabled={step === 1}
                        onClick={() => setStep(step - 1)}>
                        Back
                    </button>
                    {step < 3 ? (
                        <button
                            className="btn bg-sky-500 hover:bg-sky-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm flex items-center gap-1.5"
                            onClick={() => setStep(step + 1)}>
                            Continue{' '}
                            <ArrowRight className="inline ml-2" size={16} />
                        </button>
                    ) : (
                        <button
                            className="btn bg-sky-500 hover:bg-sky-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm flex items-center gap-1.5"
                            onClick={async () => {
                                if (
                                    !name.trim() ||
                                    !startDate ||
                                    !endDate ||
                                    !selectedCities.length
                                ) {
                                    setError(
                                        'Add a trip name, dates, and at least one city.',
                                    )
                                    return
                                }
                                setPending(true)
                                setError('')
                                try {
                                    const createdTrip = await api.createTrip({
                                        name: name.trim(),
                                        description,
                                        start_date: startDate,
                                        end_date: endDate,
                                        city_ids: selectedCities,
                                    })
                                    createTrip(createdTrip)
                                    nav('/builder')
                                } catch (requestError) {
                                    setError(requestError.message)
                                } finally {
                                    setPending(false)
                                }
                            }}
                            disabled={pending}>
                            {pending ? 'Creating...' : 'Build itinerary'}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="mt-4 max-w-xl text-sm text-rose-600">
                        {error}
                    </p>
                )}
            </div>
        </Shell>
    )
}

export default Create
