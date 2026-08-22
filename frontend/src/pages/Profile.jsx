import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'

function Profile() {
    const { user, trips, cities } = useTripStore()
    const [tab, setTab] = useState('trips')
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(user?.name || 'Guest traveller')
    const [email, setEmail] = useState(user?.email || 'traveller@example.com')
    const [language, setLanguage] = useState('English')
    const [emailUpdates, setEmailUpdates] = useState(true)
    const [reminders, setReminders] = useState(true)
    const [confirm, setConfirm] = useState(false)
    return (
        <Shell>
            <div className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/"
                                aria-label="Back home"
                                className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
                                <ArrowRight size={17} className="rotate-180" />
                            </Link>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[.22em] text-zinc-500">
                                    Account
                                </p>
                                <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                                    Profile & Settings
                                </h1>
                            </div>
                        </div>
                        <span className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                            Resyncing...
                        </span>
                    </div>
                    <div className="mt-8 grid gap-6 lg:grid-cols-12">
                        <aside className="rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-4">
                            <div className="relative mx-auto w-fit">
                                <div className="grid h-28 w-28 place-items-center rounded-full bg-zinc-900 text-3xl font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                                    {name.slice(0, 2).toUpperCase()}
                                </div>
                                <button
                                    aria-label="Edit profile photo"
                                    className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-sky-500 text-white">
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
                                onClick={() => setEditing(!editing)}
                                className="mt-6 min-h-11 w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400">
                                {editing ? 'Save Profile' : 'Edit Profile'}
                            </button>
                        </aside>
                        <section className="lg:col-span-8">
                            <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
                                <button
                                    onClick={() => setTab('trips')}
                                    className={`pb-3 text-sm font-medium ${tab === 'trips' ? 'border-b-2 border-sky-500 text-sky-600' : ''}`}>
                                    My Trips & Destinations
                                </button>
                                <button
                                    onClick={() => setTab('preferences')}
                                    className={`pb-3 text-sm font-medium ${tab === 'preferences' ? 'border-b-2 border-sky-500 text-sky-600' : ''}`}>
                                    Account Preferences
                                </button>
                            </div>
                            {tab === 'trips' ? (
                                <div className="mt-7 space-y-8">
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Preplanned Trips
                                        </h2>
                                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                            {trips
                                                .filter(
                                                    t =>
                                                        t.status !==
                                                        'Completed',
                                                )
                                                .map(t => (
                                                    <article
                                                        key={t.id}
                                                        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                                                        <img
                                                            src={t.cover}
                                                            alt={t.name}
                                                            className="h-32 w-full object-cover"
                                                        />
                                                        <div className="flex items-center justify-between p-4">
                                                            <p className="font-semibold">
                                                                {t.name}
                                                            </p>
                                                            <Link
                                                                to="/builder"
                                                                className="text-sm font-medium text-sky-600">
                                                                View
                                                            </Link>
                                                        </div>
                                                    </article>
                                                ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Previous Trips
                                        </h2>
                                        <p className="mt-2 text-sm text-zinc-500">
                                            Your completed journeys will appear
                                            here.
                                        </p>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Saved Destinations
                                        </h2>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            {cities.slice(0, 4).map(c => (
                                                <div
                                                    key={c.id}
                                                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                                                    <img
                                                        src={c.image}
                                                        alt={c.name}
                                                        className="h-12 w-14 rounded-lg object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-medium">
                                                            {c.name}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">
                                                            {c.country}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-7 space-y-6">
                                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                                        <h2 className="text-xl font-semibold">
                                            Account Preferences
                                        </h2>
                                        <label className="mt-5 block text-sm font-medium">
                                            Language preference
                                            <select
                                                value={language}
                                                onChange={e =>
                                                    setLanguage(e.target.value)
                                                }
                                                className="input mt-2">
                                                <option>English</option>
                                                <option>Spanish</option>
                                                <option>French</option>
                                                <option>German</option>
                                            </select>
                                        </label>
                                        <label className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-5 text-sm dark:border-zinc-800">
                                            Email updates
                                            <input
                                                type="checkbox"
                                                checked={emailUpdates}
                                                onChange={e =>
                                                    setEmailUpdates(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-5 w-5 accent-sky-500"
                                            />
                                        </label>
                                        <label className="mt-4 flex items-center justify-between text-sm">
                                            Trip reminders
                                            <input
                                                type="checkbox"
                                                checked={reminders}
                                                onChange={e =>
                                                    setReminders(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-5 w-5 accent-sky-500"
                                            />
                                        </label>
                                    </div>
                                    <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/20">
                                        <h2 className="font-semibold text-rose-700 dark:text-rose-300">
                                            Danger Zone
                                        </h2>
                                        <p className="mt-2 text-sm text-rose-600/80">
                                            Deleting your account permanently
                                            removes your profile and trips.
                                        </p>
                                        <button
                                            onClick={() => setConfirm(true)}
                                            className="mt-5 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
                {confirm && (
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
                                    onClick={() => setConfirm(false)}
                                    className="btn flex-1 border border-zinc-200 dark:border-zinc-700">
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setConfirm(false)}
                                    className="btn flex-1 bg-rose-600 text-white">
                                    Confirm delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Shell>
    )
}

export default Profile
