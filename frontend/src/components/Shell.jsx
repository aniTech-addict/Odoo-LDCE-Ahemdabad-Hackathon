import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
    CalendarDays,
    Compass,
    House,
    LogOut,
    MapPin,
    Moon,
    Search,
    Share2,
    SlidersHorizontal,
    Sun,
    UserRound,
    WalletCards,
} from 'lucide-react'
import { useTripStore } from '../store/useTripStore'

export function Shell({ children }) {
    const nav = useNavigate()
    const location = useLocation()
    const { user, logout } = useTripStore()
    const [profileOpen, setProfileOpen] = useState(false)
    const [dark, setDark] = useState(() => {
        const storedTheme = localStorage.getItem('theme')
        if (storedTheme) {
            return storedTheme === 'dark'
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [dark])

    const active = path => location.pathname === path

    return (
        <div className="min-h-screen bg-paper text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
            <header className="border-b hairline bg-paper">
                <div className="max-w-7xl mx-auto px-5 py-5 flex items-center justify-between">
                    <Link
                        to="/"
                        className="serif text-2xl font-semibold tracking-tight">
                        Globe<span className="text-gold">Trotter</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-7 text-sm">
                        <Link
                            to="/"
                            className={`flex items-center gap-1.5 transition hover:text-sky-500 ${active('/') ? 'text-sky-500 font-semibold' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            <House size={15} strokeWidth={1.5} />
                            Home
                        </Link>
                        <Link
                            to="/trips"
                            className={`flex items-center gap-1.5 transition hover:text-sky-500 ${active('/trips') ? 'text-sky-500 font-semibold' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            <Compass size={15} strokeWidth={1.5} />
                            My trips
                        </Link>
                        <Link
                            to="/activities"
                            className={`flex items-center gap-1.5 transition hover:text-sky-500 ${active('/activities') ? 'text-sky-500 font-semibold' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            <Search size={15} strokeWidth={1.5} />
                            Activities
                        </Link>
                        <Link
                            to="/share"
                            className={`flex items-center gap-1.5 transition hover:text-sky-500 ${active('/share') ? 'text-sky-500 font-semibold' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            <Share2 size={15} strokeWidth={1.5} />
                            Shared view
                        </Link>
                        <Link
                            to="/builder"
                            className={`flex items-center gap-1.5 transition hover:text-sky-500 ${active('/builder') ? 'text-sky-500 font-semibold' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            <MapPin size={15} strokeWidth={1.5} />
                            Itinerary
                        </Link>
                        <Link
                            to="/budget"
                            className={`flex items-center gap-1.5 transition hover:text-sky-500 ${active('/budget') ? 'text-sky-500 font-semibold' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            <WalletCards size={15} strokeWidth={1.5} />
                            Budget
                        </Link>
                        <Link
                            to="/calendar"
                            className={`flex items-center gap-1.5 transition hover:text-sky-500 ${active('/calendar') ? 'text-sky-500 font-semibold' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            <CalendarDays size={15} strokeWidth={1.5} />
                            Calendar
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDark(!dark)}
                            aria-label={
                                dark
                                    ? 'Switch to light mode'
                                    : 'Switch to dark mode'
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 shadow-sm transition hover:border-sky-400 hover:text-sky-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
                            {dark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {user ? (
                            <div className="relative flex items-center gap-3">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    aria-label="Open profile menu"
                                    aria-expanded={profileOpen}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-paper hover:bg-sky-600 transition">
                                    <UserRound size={18} strokeWidth={1.5} />
                                </button>
                                {profileOpen && (
                                    <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border hairline bg-paper p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                        <button
                                            onClick={() => {
                                                setProfileOpen(false)
                                                nav('/profile')
                                            }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <UserRound size={16} />
                                            View profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setProfileOpen(false)
                                                nav('/admin')
                                            }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <SlidersHorizontal size={16} />
                                            Admin analytics
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout()
                                                setProfileOpen(false)
                                                nav('/')
                                            }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <LogOut size={16} />
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className="bg-sky-500 hover:bg-sky-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm hover:shadow-md flex items-center gap-1.5 active:translate-y-px"
                                onClick={() => nav('/login')}>
                                <UserRound size={16} />
                                Sign in
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="pb-16 md:pb-0">{children}</main>

            <div className="md:hidden fixed bottom-0 inset-x-0 bg-navy text-paper z-20 flex justify-around py-3">
                <Link
                    to="/"
                    aria-label="Home"
                    className={active('/') ? 'text-sky-400' : 'text-paper'}>
                    <House size={20} />
                </Link>
                <Link
                    to="/trips"
                    className={
                        active('/trips') ? 'text-sky-400' : 'text-paper'
                    }>
                    <Compass size={20} />
                </Link>
                <Link
                    to="/builder"
                    className={
                        active('/builder') ? 'text-sky-400' : 'text-paper'
                    }>
                    <MapPin size={20} />
                </Link>
                <Link
                    to="/activities"
                    aria-label="Activities"
                    className={
                        active('/activities') ? 'text-sky-400' : 'text-paper'
                    }>
                    <Search size={20} />
                </Link>
                <Link
                    to="/budget"
                    className={
                        active('/budget') ? 'text-sky-400' : 'text-paper'
                    }>
                    <WalletCards size={20} />
                </Link>
                <Link
                    to="/profile"
                    className={
                        active('/profile') ? 'text-sky-400' : 'text-paper'
                    }>
                    <UserRound size={20} />
                </Link>
            </div>
        </div>
    )
}
