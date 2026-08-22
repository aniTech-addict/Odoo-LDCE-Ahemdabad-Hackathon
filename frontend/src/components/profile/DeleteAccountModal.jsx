export function DeleteAccountModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/50 p-5">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                <h2 className="text-xl font-semibold">
                    Delete account?
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    This action cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="btn flex-1 border border-zinc-200 dark:border-zinc-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn flex-1 bg-rose-600 text-white"
                    >
                        Confirm delete
                    </button>
                </div>
            </div>
        </div>
    )
}
