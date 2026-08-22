import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Share2, Plus, Sparkles, User, Copy, Check } from 'lucide-react'
import { Shell } from '../components/Shell'
import { useTripStore } from '../store/useTripStore'
import { api } from '../services/api'

function Share() {
    const nav = useNavigate()
    const { user, trips, createTrip } = useTripStore()
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTripId, setSelectedTripId] = useState('')
    const [sharePending, setSharePending] = useState(false)
    const [copiedTripId, setCopiedTripId] = useState(null)

    // Load feed from backend
    const loadFeed = async () => {
        try {
            const shared = await api.getSharedTrips()
            setPosts(shared)
        } catch (e) {
            console.error('Error loading shared feed:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFeed()
    }, [])

    // Handle sharing a trip
    const handleShare = async () => {
        if (!selectedTripId) return
        setSharePending(true)
        try {
            await api.shareTrip(selectedTripId, true)
            setSelectedTripId('')
            await loadFeed()
        } catch (e) {
            console.error('Error sharing trip:', e)
        } finally {
            setSharePending(false)
        }
    }

    // Handle liking a post
    const handleLike = async id => {
        // Optimistic update
        setPosts(prev =>
            prev.map(post =>
                post.id === id ? { ...post, likes: (post.likes || 0) + 1 } : post,
            ),
        )
        try {
            await api.likeTrip(id)
        } catch (e) {
            console.error('Error liking trip:', e)
        }
    }

    // Handle copying a trip to my profile
    const handleCopyTrip = async trip => {
        setCopiedTripId(trip.id)
        createTrip({
            id: 'trip-' + Date.now(),
            name: `${trip.name} (Copy)`,
            cities: trip.city_names || [],
            startDate: trip.start_date,
            endDate: trip.end_date,
            description: trip.description,
            status: 'Upcoming',
            cover: trip.cover_image_url,
            itinerary: {},
        })
        setTimeout(() => setCopiedTripId(null), 2000)
    }

    return (
        <Shell>
            <div className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                            <Sparkles size={13} /> GlobeTrotter Feed
                        </span>
                        <h1 className="serif text-4xl mt-3 font-semibold">Shared Journeys Wall</h1>
                        <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto">
                            Explore itineraries published by travel enthusiasts. Love their plans? Copy them to start editing!
                        </p>
                    </div>

                    {/* Share Trip Card */}
                    {user && (
                        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                                <Share2 size={16} className="text-sky-500" /> Share one of your trips
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select
                                    value={selectedTripId}
                                    onChange={e => setSelectedTripId(e.target.value)}
                                    className="h-11 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                                    <option value="">-- Choose a trip to publish --</option>
                                    {trips
                                        .filter(t => !t.is_shared)
                                        .map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({t.startDate})
                                            </option>
                                        ))}
                                </select>
                                <button
                                    onClick={handleShare}
                                    disabled={!selectedTripId || sharePending}
                                    className="bg-sky-500 hover:bg-sky-600 text-white font-medium h-11 px-5 rounded-lg text-sm transition shadow-sm hover:shadow flex items-center justify-center gap-1.5 disabled:opacity-50">
                                    <Plus size={16} /> Publish Post
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Feed Posts */}
                    {loading ? (
                        <div className="text-center py-10">
                            <p className="text-sm text-zinc-500 animate-pulse">Loading social wall posts...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-500 text-sm">No shared trips yet. Be the first to share your journey!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {posts.map(post => (
                                <article
                                    key={post.id}
                                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    {/* Post Header */}
                                    <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{post.created_by || 'GlobeTrotter'}</p>
                                            <p className="text-[11px] text-zinc-500">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Cover Image */}
                                    {post.cover_image_url && (
                                        <div className="h-64 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                            <img
                                                src={post.cover_image_url}
                                                alt={post.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Post Content */}
                                    <div className="p-5">
                                        <h3 className="serif text-2xl font-semibold mb-2">{post.name}</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                                            {post.description || 'Exploring some beautiful places along the way!'}
                                        </p>

                                        {/* Cities Visited */}
                                        {post.city_names && post.city_names.length > 0 && (
                                            <div className="mb-4 flex flex-wrap gap-1.5">
                                                {post.city_names.map((city, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                        {city}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Bar */}
                                        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-rose-500 transition dark:text-zinc-300">
                                                <Heart
                                                    size={18}
                                                    className="text-rose-500 fill-rose-500"
                                                    strokeWidth={2}
                                                />
                                                <span className="font-medium">{post.likes || 0}</span>
                                            </button>

                                            <button
                                                onClick={() => handleCopyTrip(post)}
                                                className="flex items-center gap-1.5 text-sm bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold px-3 py-1.5 rounded-lg transition dark:bg-sky-950/40 dark:text-sky-300">
                                                {copiedTripId === post.id ? (
                                                    <>
                                                        <Check size={15} /> Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={15} /> Copy Trip
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Shell>
    )
}

export default Share
