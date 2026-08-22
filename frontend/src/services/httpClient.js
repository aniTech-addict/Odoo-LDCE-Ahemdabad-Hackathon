const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export async function request(path, options = {}) {
    if (!API_BASE_URL) {
        throw new Error('VITE_API_URL must be configured to connect to the backend')
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(
            body?.message || `Request failed with status ${response.status}`,
        )
    }

    return body?.payload ?? body
}

