// Waits for the kd-structured mod to publish the `kd-structured` import map, so that this mod
// initializes correctly no matter which mod the game loads first.
const RetryDelayMs = 50
const WarnAfterMs = 10_000

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

declare global {
    var __loadKDStructured: () => Promise<unknown>
}

let loaderPromise: Promise<unknown> | undefined

globalThis.__loadKDStructured = function loadKDStructured(): Promise<unknown> {
    if (!loaderPromise) {
        loaderPromise = (async () => {
            const start = Date.now()
            let warned = false
            for (; ;) {
                try {
                    return await import(/* webpackIgnore: true */ 'kd-structured')
                } catch (error) {
                    if (!(error instanceof TypeError)) {
                        // Anything other than an unresolved specifier is a real module error.
                        throw error
                    }
                    if (!warned && Date.now() - start > WarnAfterMs) {
                        warned = true
                        console.warn('Boids: still waiting for the kd-structured mod to provide kd-structured')
                    }
                    await delay(RetryDelayMs)
                }
            }
        })()
    }
    return loaderPromise
}

export { }