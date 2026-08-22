import { imageOrDefault } from '../../utils/images'

export function CitySelectionGrid({ cities, selectedCities, addCity }) {
    return (
        <div>
            <p className="text-zinc-600 dark:text-zinc-300 mb-5">
                Choose two or more places to build your route.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cities.map(c => (
                    <button
                        key={c.id}
                        onClick={() => addCity(c.id)}
                        className={`text-left paper-card overflow-hidden ${selectedCities.includes(c.id) ? 'ring-2 ring-gold' : ''}`}>
                        <img
                            src={imageOrDefault(c.image)}
                            alt={c.name}
                            className="h-32 w-full object-cover"
                        />
                        <div className="p-4">
                            <p className="serif text-xl">{c.name}</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-300">
                                {c.country}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
