import { GripVertical, Trash2 } from 'lucide-react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useTripStore } from '../store/useTripStore'
import { money } from '../utils/format'

export function ActivityCard({ item, day }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: item.id,
        data: { day },
    })
    const { editTime, removeActivity } = useTripStore()

    return (
        <article ref={setNodeRef} style={{ transform: transform ? `translate(${transform.x}px,${transform.y}px)` : undefined }} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex gap-4 p-4">
                <button {...listeners} {...attributes} aria-label="Drag activity" className="mt-1 shrink-0 text-zinc-400"><GripVertical size={18} strokeWidth={1.5} /></button>
                {item.image && <img src={item.image} alt={item.title} className="h-20 w-24 shrink-0 rounded-xl object-cover" />}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div><input aria-label="Activity time" className="w-20 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-400/40 dark:border-zinc-700 dark:bg-zinc-800" value={item.time} onChange={e => editTime(day, item.id, e.target.value)} /><h3 className="mt-2 truncate text-base font-semibold">{item.title}</h3></div>
                        <button onClick={() => removeActivity(day, item.id)} aria-label="Remove activity" className="text-zinc-400 hover:text-rose-500"><Trash2 size={17} strokeWidth={1.5} /></button>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{item.category || 'Activity'} · {money(item.price || 0)}</p>
                </div>
            </div>
            <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800"><label className="sr-only" htmlFor={`notes-${item.id}`}>Necessary information</label><textarea id={`notes-${item.id}`} rows="2" placeholder="Add necessary information about this section..." className="w-full resize-none bg-transparent text-sm text-zinc-600 outline-none placeholder:text-zinc-400 dark:text-zinc-300" /></div>
        </article>
    )
}

export function Day({ day, items }) {
    const { setNodeRef } = useDroppable({ id: day })
    return <div ref={setNodeRef} className="space-y-3 min-h-24"><p className="eyebrow">{new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>{items.sort((a, b) => a.time.localeCompare(b.time)).map(item => <ActivityCard key={item.id} item={item} day={day} />)}</div>
}
