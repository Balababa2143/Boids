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

export function* Concat<T>(seqs: Iterable<Iterable<T>>): Iterable<T> {
    for(const seq of seqs){
        for(const item of seq){
            yield item
        }
    }
}

export function* Map<T, U>(seq: Iterable<T>, mapper: (_: T) => U): Iterable<U>{
    for(const item of seq){
        yield mapper(item)
    }
}