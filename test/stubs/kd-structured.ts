/**
 * Test stand-in for the `kd-structured` mod's import-map module.
 *
 * In production it is a webpack promise external;
 * `webpack.test.config.ts` aliases the specifier here.
 */

import { GetRecorder } from '../harness/recorder'

export interface IGetModelLayersParameters {
    ModelName: string
    PrependString?: string
    AppendString?: string
    InheritColor?: string
    PriBonus?: number
    layerSwap?: string
    Folder?: string
    noTieToLayer?: boolean
}

/** Returns the base model's layers with the parameters applied, and records the call. */
export function GetModelLayers(args: IGetModelLayersParameters): ModelLayer[] {
    const recorder = GetRecorder()
    recorder.getModelLayersCalls.push({ ...args })

    const ModelDefs = recorder.globals.ModelDefs as Record<string, Model | undefined>
    const base = ModelDefs[args.ModelName]
    if (base == null) {
        throw new ReferenceError(`GetModelLayers: base model '${args.ModelName}' is not in ModelDefs`)
    }

    return Object.values(base.Layers).map((layer): ModelLayer => {
        let name = layer.Name
        if (args.PrependString != null) {
            name = args.PrependString + name
        }
        if (args.AppendString != null) {
            name = name + args.AppendString
        }
        return {
            ...layer,
            Name: name,
            ...(args.Folder != null ? { Folder: args.Folder } : {}),
            ...(args.PriBonus != null ? { Pri: (layer.Pri ?? 0) + args.PriBonus } : {}),
        }
    })
}

export interface IKinkyDungeonSendEventParameters {
    Event: string
    data: any
    forceSpell?: spell
    forceWeapon?: item
    mapData?: KDMapDataType
}

export function KinkyDungeonSendEvent(args: IKinkyDungeonSendEventParameters): void {
    GetRecorder().sentEvents.push({ Event: args.Event, data: args.data })
}

export interface IKinkyDungeonSendTextMessageParameters {
    priority: number
    text: string
    color: string
    time?: number
    noPush?: boolean
    noDupe?: boolean
    entity?: entity
    filter?: string
}

export function KinkyDungeonSendTextMessage(args: IKinkyDungeonSendTextMessageParameters): boolean {
    GetRecorder().sentTextMessages.push({ ...args })
    return true
}

export interface IKDEquipInventoryVariantParameters {
    variant: KDRestraintVariant
    prefix?: string
    Tightness?: number
    Bypass?: boolean
    Lock?: string
    Keep?: boolean
    Trapped?: boolean
    faction?: string
    Deep?: boolean
    curse?: string
    securityEnemy?: entity
    useAugmentedPower?: boolean
    _inventoryAs?: string
    ID?: string
    suffix?: string
    powerBonus?: number
    NoActionPrune?: boolean
    data?: any
}

export function KDEquipInventoryVariant(args: IKDEquipInventoryVariantParameters): number {
    GetRecorder().equippedVariants.push({ ...args } as Record<string, unknown>)
    return 0
}

export interface IKDMorphToInventoryVariantParameters {
    item: item
    variant: KDRestraintVariant
    prefix?: string
    curse?: string
    forceMorph?: boolean
}

export function KDMorphToInventoryVariant(args: IKDMorphToInventoryVariantParameters): item {
    GetRecorder().morphs.push({ ...args } as unknown as Record<string, unknown>)
    return args.item
}

export interface IKinkyDungeonRemoveRestraintSpecificParameters {
    item: item
    Keep?: boolean
    Add?: boolean
    NoEvent?: boolean
    Shrine?: boolean
    UnLink?: boolean
    Remover?: entity
    ForceRemove?: boolean
}

export function KinkyDungeonRemoveRestraintSpecific(args: IKinkyDungeonRemoveRestraintSpecificParameters): item[] {
    GetRecorder().removals.push({ ...args } as unknown as Record<string, unknown>)
    return []
}

export interface IKDLinkUnderParameters {
    restraint: restraint
    Tightness?: number
    Bypass?: boolean
    Lock?: string
    Keep?: boolean
    _Trapped?: boolean
    events?: KinkyDungeonEvent[]
    faction?: string
    Deep?: boolean
    Curse?: string
    securityEnemy?: entity
    _reserved?: boolean
    inventoryAs?: string
    data?: Record<string, any>
    powerBonus?: number
    noOverpower?: boolean
}

export function KDLinkUnder(args: IKDLinkUnderParameters): item {
    GetRecorder().linkUnders.push({ ...args } as unknown as Record<string, unknown>)
    return args.restraint as unknown as item
}
