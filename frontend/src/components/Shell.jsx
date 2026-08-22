import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    const { user, logout, activeTripId } = useTripStore()
    const [profileOpen, setProfileOpen] = useState(false)
    const [dark, setDark] = useState(() =>
        document.documentElement.classList.contains('dark'),
    )

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
    }, [dark])

    return (
        <div className="min-h-screen bg-paper">
            <header className="border-b hairline bg-paper">
                <div className="max-w-7xl mx-auto px-5 py-5 flex items-center justify-between">
                    <Link to="/" className="serif text-2xl font-semibold tracking-tight">
                        Globe<span className="text-gold">Trotter</span>
                    </Link>
                    <button
                        onClick={() => setDark(!dark)}
                        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 shadow-sm transition hover:border-sky-400 hover:text-sky-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
                        {dark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <nav className="hidden md:flex items-center gap-7 text-sm">
                        <Link to="/" className="flex items-center gap-1.5 font-medium"><House size={15} strokeWidth={1.5} />Home</Link>
                        <Link to="/trips" className="flex items-center gap-1.5"><Compass size={15} strokeWidth={1.5} />My trips</Link>
                        <Link to="/activities" className="flex items-center gap-1.5"><Search size={15} strokeWidth={1.5} />Activities</Link>
                        <Link to={activeTripId ? `/share/${activeTripId}` : '/trips'} className="flex items-center gap-1.5"><Share2 size={15} strokeWidth={1.5} />Shared view</Link>
                        <Link to="/builder" className="flex items-center gap-1.5"><MapPin size={15} strokeWidth={1.5} />Itinerary</Link>
                        <Link to="/budget" className="flex items-center gap-1.5"><WalletCards size={15} strokeWidth={1.5} />Budget</Link>
                        <Link to="/calendar" className="flex items-center gap-1.5"><CalendarDays size={15} strokeWidth={1.5} />Calendar</Link>
                    </nav>
                    {user ? (
                        <div className="relative flex items-center gap-3">
                            <button onClick={() => setProfileOpen(!profileOpen)} aria-label="Open profile menu" aria-expanded={profileOpen} className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-paper"><UserRound size={18} strokeWidth={1.5} /></button>
                            {profileOpen && <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border hairline bg-paper p-2 shadow-lg">
                                <button onClick={() => { setProfileOpen(false); nav('/profile') }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-ivory"><UserRound size={16} />View profile</button>
                                <button onClick={() => { setProfileOpen(false); nav('/admin') }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-ivory"><SlidersHorizontal size={16} />Admin analytics</button>
                                <button onClick={() => { logout(); setProfileOpen(false); nav('/') }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-ivory"><LogOut size={16} />Log out</button>
                            </div>}
                        </div>
                    ) : <button className="flex items-center gap-2 text-sm" onClick={() => nav('/login')}><UserRound size={17} />Sign in</button>}
                </div>
            </header>
            <main>{children}</main>
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-navy text-paper z-20 flex justify-around py-3">
                <Link to="/" aria-label="Home"><House size={20} /></Link>
                <Link to="/trips"><Compass size={20} /></Link>
                <Link to="/builder"><MapPin size={20} /></Link>
                <Link to="/activities" aria-label="Activities"><Search size={20} /></Link>
                <Link to="/budget"><WalletCards size={20} /></Link>
                <Link to="/profile"><UserRound size={20} /></Link>
            </div>
        </div>
    )
}
