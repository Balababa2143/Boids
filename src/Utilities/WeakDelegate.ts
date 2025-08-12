export type Callable<TArgs extends unknown[], TResult> = (...args: TArgs) => TResult

export type Action<TArgs extends unknown[]> = Callable<TArgs, unknown>

export interface IMulticastAction<TArgs extends unknown[]> extends Callable<TArgs, void> {
    /**
     * Add a action to the multicast action.
     * @param f The action to add.
     * @returns True if the action was added, false if it was already present.
     */
    Add(f: Callable<TArgs, unknown>): boolean

    /**
     * Remove an action from the multicast action.
     * @param f The action to remove.
     * @returns True if the action was removed, false if it was not present.
     */
    Remove(f: Callable<TArgs, unknown>): boolean

    /**
     * Invoke the action with the provided arguments.
     * @param args The arguments to pass to the action.
     * @throws AggregateError if one or more actions throw an error.
     */
    Invoke(...args: TArgs): void
}

class MultiCastWeakAction<TArgs extends unknown[]> {
    #handlers = new Set<WeakRef<Action<TArgs>>>()
    #bookKeeper = new WeakMap<Action<TArgs>, WeakRef<Action<TArgs>>>()

    Add(f: Action<TArgs>): boolean {
        if (this.#bookKeeper.has(f)) {
            return false;
        }
        else {
            const ref = new WeakRef(f)
            this.#handlers.add(ref)
            this.#bookKeeper.set(f, ref)
            return true;
        }
    }

    Remove(f: Action<TArgs>): boolean {
        const ref = this.#bookKeeper.get(f)
        if (null != ref) {
            this.#handlers.delete(ref)
            this.#bookKeeper.delete(f)
            return true
        }
        else {
            return false
        }
    }

    Invoke(...args: TArgs): void {
        const deleteList: WeakRef<Action<TArgs>>[] = []
        const exList: unknown[] = []
        for (const ref of this.#handlers) {
            const f = ref.deref()
            if (null != f) {
                try {
                    f(...args)
                }
                catch (ex) {
                    exList.push(ex)
                }
            }
            else {
                deleteList.push(ref)
            }
        }
        if (exList.length > 0) {
            throw new AggregateError(exList)
        }
        for (const toDelete of deleteList) {
            this.#handlers.delete(toDelete)
        }
    }
}

export const CreateWeakAction = <TArgs extends unknown[]>() =>
    new Proxy(
        new MultiCastWeakAction<TArgs>(),
        {
            apply(target, _, argArray: TArgs): void {
                target.Invoke(...argArray)
            },
        }
    ) as unknown as IMulticastAction<TArgs> // Type assertion to match the interface
    
export type EventHandler<TSender extends object, TEventArgs> =
    Action<[TSender, TEventArgs]>

export type IEvent<TSender extends object, TEventArgs> = IMulticastAction<[TSender, TEventArgs]>