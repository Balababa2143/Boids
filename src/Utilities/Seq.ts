export function* PowerSet<T>(input: Iterable<T>): Iterable<Iterable<T>> {
    const items = [...input]
    for (let mask = 0; mask < (1 << items.length); mask++) {
        yield (function* () {
            for (let i = 0; i < items.length; i++) {
                if ((1 << i & mask) !== 0) {
                    yield items[i]
                }
            }
        })()
    }
}