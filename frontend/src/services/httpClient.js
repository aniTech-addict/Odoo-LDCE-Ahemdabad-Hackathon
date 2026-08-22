const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export async function request(path, options = {}) {
    if (!API_BASE_URL) {
        throw new Error('VITE_API_URL must be configured to connect to the backend')
    }

    // Retrieve the JWT token from Zustands persisted storage
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    try {
        const stateStr = localStorage.getItem('globetrotter-state')
        if (stateStr) {
            const parsed = JSON.parse(stateStr)
            const token = parsed?.state?.user?.token
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
        }
    } catch (e) {
        console.error('Failed to parse globetrotter-state', e)
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(
            body?.message || `Request failed with status ${response.status}`,
        )
    }

    return body?.payload ?? body
}
