import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Globe, Loader2 } from 'lucide-react'
import { api } from '../services/api'
import { useTripStore } from '../store/useTripStore'
import { FormInputField } from '../components/login/FormInputField'

function Login() {
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('judge@demo.com')
    const [password, setPassword] = useState('globetrotter')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')
    const [info, setInfo] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const [pending, setPending] = useState(false)
    const login = useTripStore(s => s.login)
    const nav = useNavigate()

    const validate = () => {
        const next = {}
        if (!email.includes('@')) next.email = 'Enter a valid email address'
        if (password.length < 6) next.password = 'Use at least 6 characters'
        if (mode === 'signup') {
            if (!firstName.trim()) next.firstName = 'Required'
            if (!lastName.trim()) next.lastName = 'Required'
            if (!phone.trim()) next.phone = 'Required'
            if (!city.trim()) next.city = 'Required'
            if (!country.trim()) next.country = 'Required'
        }
        setErrors(next)
        return !Object.keys(next).length
    }

    const submit = async e => {
        e.preventDefault()
        if (!validate()) return
        setPending(true)
        await new Promise(r => setTimeout(r, 650))
        login(await api.login(email))
        setPending(false)
        nav('/trips')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
            <form
                onSubmit={submit}
                noValidate
                className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                        <Globe size={24} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        GlobeTrotter
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Plan the journeys that stay with you.
                    </p>
                </div>
                <div className="mt-7 grid grid-cols-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
                    <button
                        type="button"
                        onClick={() => {
                            setMode('login')
                            setErrors({})
                        }}
                        className={`rounded-md py-2 text-sm font-medium ${mode === 'login' ? 'bg-white shadow-sm dark:bg-zinc-700' : ''}`}>
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode('signup')
                            setErrors({})
                        }}
                        className={`rounded-md py-2 text-sm font-medium ${mode === 'signup' ? 'bg-white shadow-sm dark:bg-zinc-700' : ''}`}>
                        Sign Up
                    </button>
                </div>
                <div className="mt-6 space-y-4">
                    {mode === 'signup' && (
                        <div className="grid grid-cols-2 gap-4">
                            <FormInputField
                                label="First Name"
                                value={firstName}
                                setValue={setFirstName}
                                fieldKey="firstName"
                                errors={errors}
                                setErrors={setErrors}
                            />
                            <FormInputField
                                label="Last Name"
                                value={lastName}
                                setValue={setLastName}
                                fieldKey="lastName"
                                errors={errors}
                                setErrors={setErrors}
                            />
                        </div>
                    )}
                    <FormInputField
                        label="Email Address"
                        value={email}
                        setValue={setEmail}
                        fieldKey="email"
                        type="email"
                        placeholder="you@example.com"
                        errors={errors}
                        setErrors={setErrors}
                    />
                    {mode === 'login' && (
                        <div className="-mb-1 text-right">
                            <button
                                type="button"
                                className="text-xs text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100">
                                Forgot Password?
                            </button>
                        </div>
                    )}
                    <div className="relative">
                        <FormInputField
                            label="Password"
                            value={password}
                            setValue={setPassword}
                            fieldKey="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="At least 6 characters"
                            errors={errors}
                            setErrors={setErrors}
                        />
                        <button
                            type="button"
                            aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-8 text-zinc-400">
                            {showPassword ? (
                                <EyeOff size={17} />
                            ) : (
                                <Eye size={17} />
                            )}
                        </button>
                    </div>
                    {mode === 'signup' && (
                        <>
                            <FormInputField
                                label="Phone Number"
                                value={phone}
                                setValue={setPhone}
                                fieldKey="phone"
                                type="tel"
                                placeholder="+91 00000 00000"
                                errors={errors}
                                setErrors={setErrors}
                            />
                            <FormInputField
                                label="City"
                                value={city}
                                setValue={setCity}
                                fieldKey="city"
                                placeholder="Mumbai"
                                errors={errors}
                                setErrors={setErrors}
                            />
                            <FormInputField
                                label="Country"
                                value={country}
                                setValue={setCountry}
                                fieldKey="country"
                                placeholder="India"
                                errors={errors}
                                setErrors={setErrors}
                            />
                            <div className="space-y-1.5">
                                <label
                                    className="text-sm font-medium"
                                    htmlFor="info">
                                    Additional Information
                                </label>
                                <textarea
                                    id="info"
                                    value={info}
                                    onChange={e => setInfo(e.target.value)}
                                    rows="3"
                                    placeholder="Tell us about your travel style"
                                    className="w-full resize-none rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400/40 dark:border-zinc-700"
                                />
                            </div>
                        </>
                    )}
                </div>
                <button
                    disabled={pending}
                    className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                    {pending && <Loader2 size={17} className="animate-spin" />}
                    {mode === 'login' ? 'Login' : 'Register'}
                </button>
                {mode === 'login' && (
                    <p className="mt-5 text-center text-sm text-zinc-500">
                        Don&apos;t have an account?{' '}
                        <button
                            type="button"
                            onClick={() => setMode('signup')}
                            className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100">
                            Sign Up
                        </button>
                    </p>
                )}
            </form>
        </div>
    )
}

export default Login
