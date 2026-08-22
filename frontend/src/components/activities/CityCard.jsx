export function CityCard({
    city,
    addCity,
    cityName,
    cityCountry,
    cityRegion,
    cityImage,
}) {
    return (
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <img
                src={cityImage(city)}
                alt={cityName(city)}
                className="h-40 w-full object-cover"
            />
            <div className="p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                    {cityCountry(city)} · {cityRegion(city)}
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                    {city[0] || city.name}
                </h2>
                <div className="mt-3 flex justify-end text-xs text-zinc-500">
                    <span className="text-emerald-600">Popular</span>
                </div>
                <button
                    onClick={() => addCity(city.id || cityName(city))}
                    className="mt-5 min-h-11 w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400">
                    Add to Trip
                </button>
            </div>
        </article>
    )
}
