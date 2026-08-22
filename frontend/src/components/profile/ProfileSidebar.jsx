import { Plus } from 'lucide-react'

export function ProfileSidebar({
    name,
    setName,
    email,
    setEmail,
    editing,
    setEditing,
    onSave,
}) {
    return (
        <aside className="rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-4">
            <div className="relative mx-auto w-fit">
                <div className="grid h-28 w-28 place-items-center rounded-full bg-zinc-900 text-3xl font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {name.slice(0, 2).toUpperCase()}
                </div>
                <button
                    aria-label="Edit profile photo"
                    className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-sky-500 text-white"
                >
                    <Plus size={16} />
                </button>
            </div>
            {editing ? (
                <div className="mt-6 space-y-3 text-left">
                    <input
                        aria-label="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="input"
                    />
                    <input
                        aria-label="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="input"
                    />
                </div>
            ) : (
                <>
                    <h2 className="mt-5 text-2xl font-semibold">
                        {name}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500">
                        {email}
                    </p>
                </>
            )}
            <p className="mt-4 text-xs text-zinc-400">
                Member since June 2024
            </p>
            <button
                onClick={() => (editing ? onSave() : setEditing(true))}
                className="mt-6 min-h-11 w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400"
            >
                {editing ? 'Save Profile' : 'Edit Profile'}
            </button>
        </aside>
    )
}
