export function CalendarCell({ day, dateKey, items, inTrip, isToday }) {
    return (
        <div
            className={`min-h-28 border-b border-r border-zinc-100 p-2 dark:border-zinc-800 sm:min-h-36 ${
                inTrip ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/70 dark:bg-zinc-950/30'
            }`}
        >
            {day && (
                <>
                    <div
                        className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                            isToday ? 'bg-sky-500 font-semibold text-white' : 'text-zinc-600 dark:text-zinc-300'
                        }`}
                    >
                        {day.getDate()}
                    </div>
                    <div className="space-y-1">
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="min-h-12 rounded-md border border-sky-200 bg-sky-100 px-2 py-2 text-xs font-semibold leading-4 text-sky-900 shadow-sm dark:border-sky-800 dark:bg-sky-900/70 dark:text-sky-100"
                            >
                                <span className="mb-0.5 block text-[10px] font-bold text-sky-700 dark:text-sky-300">
                                    {item.time || 'All day'}
                                </span>
                                <span className="block truncate">
                                    {item.title || item.name || 'Trip event'}
                                </span>
                            </div>
                        ))}
                    </div>
                    {inTrip && !items.length && (
                        <span className="text-[10px] text-zinc-400">
                            Open day
                        </span>
                    )}
                </>
            )}
        </div>
    )
}
