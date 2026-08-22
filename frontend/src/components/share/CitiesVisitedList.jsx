import { imageOrDefault } from '../../utils/images'

export function CitiesVisitedList({ cityNames, cities, trip }) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-semibold">Cities visited</h2>
            <div className="mt-4 space-y-3">
                {cityNames.map((name, i) => {
                    const city = cities.find(
                        c => c.name === name || c.id === trip.cities[i],
                    )
                    return (
                        <div key={name} className="flex items-center gap-3">
                            <img
                                src={imageOrDefault(city?.image || trip.cover)}
                                alt={name}
                                className="h-11 w-14 rounded-lg object-cover"
                            />
                            <span className="text-sm font-medium">{name}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
