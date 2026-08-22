import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'
import { api } from '../services/api'
import { ProfileSidebar } from '../components/profile/ProfileSidebar'
import { DeleteAccountModal } from '../components/profile/DeleteAccountModal'

function Profile() {
    const { user, trips, cities, setUser, logout } = useTripStore()

    if (!user) {
        return (
            <Shell>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-5">
                    <h2 className="serif text-3xl font-semibold mb-2">
                        User Profile
                    </h2>
                    <p className="text-zinc-500 text-sm max-w-sm mb-5 dark:text-zinc-400">
                        Please sign in to view your profile settings, configure
                        preferences, and manage your account.
                    </p>
                    <Link
                        to="/login"
                        className="bg-sky-500 hover:bg-sky-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition shadow-sm">
                        Sign In / Register
                    </Link>
                </div>
            </Shell>
        )
    }

    const [tab, setTab] = useState('trips')
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(
        user?.name ||
            [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
            'Guest traveller',
    )
    const [email, setEmail] = useState(user?.email || 'traveller@example.com')
    const [language, setLanguage] = useState('English')
    const [emailUpdates, setEmailUpdates] = useState(true)
    const [reminders, setReminders] = useState(true)
    const [confirm, setConfirm] = useState(false)
    const [actionError, setActionError] = useState('')

    const saveProfile = async () => {
        try {
            await api.updateUser({ name, email })
            setUser({ ...user, name, email })
            setEditing(false)
            setActionError('')
        } catch (error) {
            setActionError(error.message)
        }
    }

    const deleteAccount = async () => {
        try {
            await api.deleteUser()
            logout()
            nav('/')
        } catch (error) {
            setActionError(error.message)
        }
    }

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
                        <ProfileSidebar
                            name={name}
                            setName={setName}
                            email={email}
                            setEmail={setEmail}
                            editing={editing}
                            setEditing={setEditing}
                            onSave={saveProfile}
                        />
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
                <DeleteAccountModal
                    isOpen={confirm}
                    onClose={() => setConfirm(false)}
                    onConfirm={deleteAccount}
                />
            </div>
        </Shell>
    )
}

export default Profile
