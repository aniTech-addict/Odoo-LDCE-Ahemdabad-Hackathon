import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { loadInitialData } from './services/dataIntegration'
import { useTripStore } from './store/useTripStore'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Trips from './pages/Trips'
import Create from './pages/Create'
import Builder from './pages/Builder'
import Budget from './pages/Budget'
import Calendar from './pages/Calendar'
import Share from './pages/Share'
import Profile from './pages/Profile'
import Activities from './pages/Activities'
import Admin from './pages/Admin'

function App() {
    const { setData } = useTripStore()
    const [loading, setLoading] = useState(true)
    const [dataError, setDataError] = useState(null)

    useEffect(() => {
        loadInitialData()
            .then(({ cities, activities, trips }) =>
                setData(cities, activities, trips),
            )
            .catch(setDataError)
            .finally(() => setLoading(false))
    }, [setData])

    return (
        <BrowserRouter>
            {loading ? (
                <div className="grid min-h-screen place-items-center text-sm text-zinc-500">
                    Loading data...
                </div>
            ) : dataError ? (
                <div className="grid min-h-screen place-items-center p-5 text-center text-sm text-rose-600">
                    Unable to load data from the backend: {dataError.message}
                </div>
            ) : (
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/trips" element={<Trips />} />
                    <Route path="/builder" element={<Builder />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/share/:id" element={<Share />} />
                    <Route path="/activities" element={<Activities />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Landing />} />
                </Routes>
            )}
        </BrowserRouter>
    )
}

export default App
