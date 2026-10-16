# Using Boids from another mod

> How another mod reaches `globalThis.Boids` -- and what to do when it cannot wait for it.

Mods load in descending `priority` and the game awaits each file it evaluates, so a
mod that declares a lower priority than Boids' `10` finds `globalThis.Boids` ready
and needs none of the below. If you cannot arrange that, poll for it.

```js
// A mod file is eval'd as a classic script, and the game awaits what the eval
// returns before starting the next mod. Two consequences: never reject, and never
// wait forever, or loading stalls with nothing in the log to explain it.
;(async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const waitFor = async (name, read, timeoutMs = 30_000) => {
        const deadline = Date.now() + timeoutMs
        for (;;) {
            const value = read()
            if (typeof value !== 'undefined') return value
            if (Date.now() > deadline) {
                console.error(`${name} did not load within ${timeoutMs} ms; skipping`)
                return undefined
            }
            await sleep(50)
        }
    }

    // `Boids` is never a promise, so this is a plain property read. If you also
    // need kd-structured, see its README: it is reached by import, not by a global.
    const Boids = await waitFor('Boids', () => globalThis.Boids)
    if (!Boids) return

    Boids.FactionMachine.MachinePrime.Debug.SetBlindStrength(0.5)
})().catch(error => console.error('my mod failed:', error))
```

The surface is two namespaces: `Boids.FactionMachine`, one level per major faction, and
`Boids.CommonUI`. The faction holds `Boids.FactionMachine.Futuristic`,
`Boids.FactionMachine.MachinePrime` and `Boids.FactionMachine.DebugStart`; a second
faction is a sibling of `src/FactionMachine/` rather than a fourth name here. Everything
else — the variant infrastructure in `src/KDExtension`, the utilities, the mod's own
manifest — is internal for now, and `test/public-api.test.ts` fails if that changes
without the baseline being regenerated.

`CommonUI` is the one that exists for other mods rather than for content: a
compatibility warning has the same problem Boids' own does, and
`Boids.CommonUI.Prompt.ShowPrompt` is the dialog that solves it — a title, some
paragraphs, and buttons whose actions the caller supplies. It carries **no text of
its own**, so reusing it costs a caller nothing but the wording.

> **Three spellings, one word.** `Boids` is the published global and `Boids.X` is a path
> into it; `src/FactionMachine/` is a folder; and `Boids/` inside
> `Futuristic/Common/Constant.ModelSetRootDir` is the **asset namespace** the packed
> atlases name their frames by. None of the three is any other, and only the folder moved.
> A fourth is the `Boids.` prefix on a variant base name in `src/KDExtension/Release.ts`,
> which is **frozen save format** — read the note beside `VariantBaseNames` before
> "correcting" any of them.
