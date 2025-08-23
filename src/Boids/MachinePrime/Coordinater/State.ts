import { ItemArchetype } from '../Common'

export interface ItemStateBase {
    readonly RegisteredItems: {
        readonly [_: string]: true
    }
}

export interface Gag extends ItemStateBase {
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