import { useState } from 'react'

export function AddSectionModal({ isOpen, onClose, onSubmit }) {
    const [place, setPlace] = useState('')
    const [date, setDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [amount, setAmount] = useState('')

    if (!isOpen) return null

    const handleSubmit = e => {
        e.preventDefault()
        if (place && date) {
            onSubmit({ place, date, endDate, amount })
            setPlace('')
            setDate('')
            setEndDate('')
            setAmount('')
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/50 p-5"
            role="dialog"
            aria-modal="true"
        >
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            Add to itinerary
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold">
                            New section
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-xl font-semibold"
                    >
                        ×
                    </button>
                </div>
                <div className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium">
                            Place
                        </label>
                        <input
                            required
                            value={place}
                            onChange={e => setPlace(e.target.value)}
                            placeholder="e.g. Colosseum"
                            className="input mt-2"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">
                                Start date
                            </label>
                            <input
                                required
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="input mt-2"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                End date
                            </label>
                            <input
                                type="date"
                                min={date}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="input mt-2"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">
                            Budget
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="₹ 0"
                            className="input mt-2"
                        />
                    </div>
                </div>
                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn flex-1 border border-zinc-200 dark:border-zinc-700"
                    >
                        Cancel
                    </button>
                    <button className="btn btn-ink flex-1">
                        Add section
                    </button>
                </div>
            </form>
        </div>
    )
}
