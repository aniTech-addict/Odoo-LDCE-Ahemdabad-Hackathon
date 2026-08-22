export const DEFAULT_PLACE_IMAGE =
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'

export function imageOrDefault(image) {
    return image || DEFAULT_PLACE_IMAGE
}
