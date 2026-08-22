import { imageOrDefault } from '../../utils/images'

export function ShareHero({ cover, name, startDate, endDate, createdBy }) {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-zinc-900">
            <img
                src={imageOrDefault(cover)}
                alt={name}
                className="h-[42vh] min-h-[320px] w-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[.24em] text-zinc-300">
                    A shared journey by GlobeTrotter
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                    {name}
                </h1>
                <p className="mt-3 text-zinc-200">
                    {startDate} — {endDate}
                    {createdBy?.name && ` · created by ${createdBy.name}`}
                </p>
            </div>
        </section>
    )
}
