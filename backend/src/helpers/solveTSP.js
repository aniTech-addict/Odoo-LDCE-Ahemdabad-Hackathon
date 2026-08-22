/**
 * Solves the Traveling Salesperson Problem for a route matrix.
 */
export function solveTSP(matrix, keepFirstFixed = true) {
    const N = matrix.length
    if (N <= 1) return [0]

    if (N > 10) {
        // Nearest Neighbor (Greedy) approach for large N
        const path = [0]
        const visited = new Array(N).fill(false)
        visited[0] = true
        let curr = 0
        while (path.length < N) {
            let nextBest = -1
            let minTime = Infinity
            for (let next = 0; next < N; next++) {
                if (!visited[next]) {
                    const time = matrix[curr][next]?.time || 0
                    if (time < minTime) {
                        minTime = time
                        nextBest = next
                    }
                }
            }
            if (nextBest === -1) break
            visited[nextBest] = true
            path.push(nextBest)
            curr = nextBest
        }
        return path
    }

    // Exact Backtracking approach for N <= 10
    let bestPath = []
    let minCost = Infinity

    if (keepFirstFixed) {
        const visited = new Array(N).fill(false)
        visited[0] = true

        function backtrack(curr, path, cost) {
            if (cost >= minCost) return
            if (path.length === N) {
                if (cost < minCost) {
                    minCost = cost
                    bestPath = [...path]
                }
                return
            }
            for (let next = 0; next < N; next++) {
                if (!visited[next]) {
                    visited[next] = true
                    path.push(next)
                    backtrack(
                        next,
                        path,
                        cost + (matrix[curr][next]?.time || 0),
                    )
                    path.pop()
                    visited[next] = false
                }
            }
        }
        backtrack(0, [0], 0)
    } else {
        const visited = new Array(N).fill(false)
        function backtrack(curr, path, cost) {
            if (cost >= minCost) return
            if (path.length === N) {
                if (cost < minCost) {
                    minCost = cost
                    bestPath = [...path]
                }
                return
            }
            for (let next = 0; next < N; next++) {
                if (!visited[next]) {
                    visited[next] = true
                    path.push(next)
                    backtrack(
                        next,
                        path,
                        cost + (matrix[curr][next]?.time || 0),
                    )
                    path.pop()
                    visited[next] = false
                }
            }
        }
        for (let start = 0; start < N; start++) {
            visited[start] = true
            backtrack(start, [start], 0)
            visited[start] = false
        }
    }

    return bestPath
}
