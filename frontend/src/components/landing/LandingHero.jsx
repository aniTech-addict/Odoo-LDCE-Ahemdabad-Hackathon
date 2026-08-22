import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function LandingHero() {
    return (
        <section className="relative col-span-12 min-h-[360px] overflow-hidden rounded-2xl bg-zinc-900">
            <img
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2400&q=90"
                alt="Mount Everest and the Himalayas at sunrise"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                onError={e => {
                    e.currentTarget.src =
                        'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=2400&q=90'
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/45 to-transparent" />
            <div className="relative flex min-h-[360px] max-w-xl flex-col justify-center px-7 py-10 text-white sm:px-12">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
                    Your travel desk
                </p>
                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                    Every journey starts with a view.
                </h1>
                <p className="mt-5 max-w-md leading-7 text-zinc-200">
                    Shape memorable days, discover remarkable places,
                    and keep every detail in one considered itinerary.
                </p>
                <Link
                    to="/create"
                    className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
                    Plan New Trip <ArrowRight size={17} />
                </Link>
            </div>
        </section>
    )
}
