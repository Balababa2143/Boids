import { DeepCopy, Record, RecordOf, Set, Map } from 'immutable'
import { v7 as NewUUID } from 'uuid'
import { ItemArchetype } from '../Constant'

interface _ItemStateBase {
    readonly RegisteredItems: Set<string>
}

export type ItemStateBase = RecordOf<_ItemStateBase>

export const ItemStateBase = Object.assign(
    Record<_ItemStateBase>({
        RegisteredItems: Set()
    }),
    {
        fromJS: (js: DeepCopy<_ItemStateBase>) =>
            ItemStateBase({
                RegisteredItems: Set(js.RegisteredItems as Iterable<string>)
            })
    }
)

interface _Gag extends _ItemStateBase {
    /**
     * Value between 0.0 to 1.0,
     * higher means more severely gagged
     */
    readonly TargetGagStrength: number
}

export type Gag = RecordOf<_Gag>

export const Gag = Object.assign(
    Record<_Gag>({
        RegisteredItems: Set(),
        TargetGagStrength: 0
    }),
    {
        fromJS: (js: DeepCopy<_Gag>) =>
            Gag({
                ...ItemStateBase.fromJS(js),
                TargetGagStrength: js.TargetGagStrength
            })
    }
)

interface _Visor extends _ItemStateBase {
    /**
     * Value between 0.0 to 10.0,
     * higher means more blinded
     */
    readonly TargetBlindStrength: number
}

export type Visor = RecordOf<_Visor>

export const Visor = Object.assign(
    Record<_Visor>({
        RegisteredItems: Set(),
        TargetBlindStrength: 0
    }),
    {
        fromJS: (js: DeepCopy<_Visor>) =>
            Visor({
                ...ItemStateBase.fromJS(js),
                TargetBlindStrength: js.TargetBlindStrength
            })
    }
)

interface _ItemRegistry {
    readonly [ItemArchetype.Visor]: _Visor
    readonly [ItemArchetype.HeadPhone]: _ItemStateBase
    readonly [ItemArchetype.Gag]: _Gag
}

export type ItemRegistry = RecordOf<_ItemRegistry>

export const ItemRegistry = Object.assign(
    Record<_ItemRegistry>({
        [ItemArchetype.Visor]: Visor(),
        [ItemArchetype.HeadPhone]: ItemStateBase(),
        [ItemArchetype.Gag]: Gag(),
    }),
    {
        fromJS: (js: DeepCopy<_ItemRegistry>) =>
            ItemRegistry({
                [ItemArchetype.Visor]: Visor.fromJS(js[ItemArchetype.Visor] as any),
                [ItemArchetype.HeadPhone]: ItemStateBase.fromJS(js[ItemArchetype.HeadPhone] as any),
                [ItemArchetype.Gag]: Gag.fromJS(js[ItemArchetype.Gag] as any),
            })
    }
)

interface _Entry {
    readonly ID: string
    readonly Items: _ItemRegistry
}

const EntryDefault = {
    Items: ItemRegistry()
} as unknown as _Entry

Object.defineProperty(
    EntryDefault,
    'ID',
    {
        get: () => NewUUID()
    }
)

export type Entry = RecordOf<_Entry>

export const Entry = Object.assign(
    Record(EntryDefault),
    {
        fromJS: (js: DeepCopy<_Entry>) =>
            Entry({
                ID: js.ID,
                Items: ItemRegistry.fromJS(js.Items as any)
            })
    }
)

interface _State {
    readonly ActivePC: _Entry
    readonly ActiveNPC: Map<string, _Entry>
}

export type State = RecordOf<_State>

export const State = Object.assign(
    Record<_State>({
        ActivePC: Entry(),
        ActiveNPC: Map()
    }),
    {
        fromJS: (js: DeepCopy<_State>) =>
            State({
                ActivePC: Entry.fromJS(js.ActivePC as any),
                ActiveNPC: 
                    Map<string, _Entry>(js.ActiveNPC as any).map(Entry.fromJS)
            })
    }
)