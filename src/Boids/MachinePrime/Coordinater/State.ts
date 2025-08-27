import { ItemArchetype } from '../Constant'

export interface ItemStateBase {
    readonly RegisteredItems: {
        readonly [_: string]: true
    }
}

export interface Gag extends ItemStateBase {
    /**
     * Value between 0.0 to 1.0,
     * higher means more severely gagged
     */
    readonly TargetGagStrength: number
}

export interface ItemRegistry {
    readonly [ItemArchetype.Visor]: ItemStateBase
    readonly [ItemArchetype.HeadPhone]: ItemStateBase
    readonly [ItemArchetype.Gag]: Gag
}

export interface Entry {
    readonly ID: string
    readonly Items: ItemRegistry
}

export interface State {
    readonly ActivePC: Entry
    readonly ActiveNPC: Readonly<Record<string, Entry>>
}