import { Compass } from 'lucide-react'

export function InspirationSidebar({ activities }) {
    return (
        <aside className="paper-card p-6">
            <p className="eyebrow flex items-center gap-2">
                <Compass size={15} /> Inspiration
            </p>
            <h2 className="serif text-2xl mt-2">Suggestions for your route</h2>
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
                            <p className="text-sm font-semibold">{a.name}</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-300">
                                {a.category}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    )
}
