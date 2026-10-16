/**
 * The drone chastity set: a belt for `ItemPelvis` and a bra for `ItemBreast`, each in a slim and a
 * bulky model variant.
 *
 * ## Why a variant map rather than four literals
 *
 * The two variants of a garment share everything except the model, the faction filters and the flavour
 * word, and the belt and the bra share the whole dressing of a chastity item: the tightness, the
 * security level, the escape chances, the lock sounds, the arousal mode, the floor availability. As
 * literals that shared half was written out four times and repeated the escape table twice over; as a
 * map each garment is one template and each cut declares what tells it apart.
 *
 * A key is part of a persisted identity, so renaming one renames a saved item. The names change here
 * and are not migrated: 0.5.0 has not shipped.
 * @module FactionMachine/Futuristic/Aroused/Chastity
 */

import { Map as IMMap } from 'immutable'
import { AddRestraintVariantMapToGame, RestraintVariantMapBuilder, VariantPart } from '../../../KDExtension'
import { DerivedVariantBase } from '../../../KDExtension/Release'
import { ThrowIfNull } from '../../../Utilities'
import { ControlledTag } from '../../MachinePrime/Coordinator/Membership'
import { RequireLockedEvent, SFX } from '../Common'

/** The four garments: two shapes, each in a slim and a bulky cut. */
export const ChastityKind = {
    SlimBelt: 'SlimBelt',
    BulkyBelt: 'BulkyBelt',
    SlimBra: 'SlimBra',
    BulkyBra: 'BulkyBra',
} as const

/** One of the four. */
export type ChastityKind = typeof ChastityKind[keyof typeof ChastityKind]

/** Every kind, for a caller that has to walk the set. */
export const ChastityKinds: readonly ChastityKind[] = Object.values(ChastityKind)

/**
 * What the belt and the bra share: a lock-required, firmly-secured item that holds its chastity flag
 * outside arousal mode, is a **participant in the control model**, and resists struggle and cutting.
 *
 * `Remove: 1.0` is not a typo for a low difficulty — it is the base game's own reading of "easy to take
 * off by hand, and locked so that is not the approach available". The cut and struggle penalties are
 * what the item is actually for.
 */
const ChastityBase = {
    inventory: true,
    tightType: 'Secure',
    Security: {
        level_tech: 2,
    },
    escapeChance: {
        'Struggle': -1.3,
        'Cut': -0.8,
        'Remove': 1.0,
        'Pick': -0.35
    },
    ...SFX.ElectricMechLockSfx,
    // Can be worn in non arousal mode without vibe activation etc.
    arousalMode: false,
    weight: 0,
    enemyTags: {},
    minLevel: 4,
    allFloors: true,
    shrine: [
        'Chastity',
        'Metal',
        ControlledTag,
    ],
    events: [
        RequireLockedEvent,
    ],
} satisfies Partial<restraint>

/**
 * The per-kind parts.
 *
 * The two belts differ from their siblings in `maxwill`, the model and the flavour word; the bra also
 * carries `chastitybra` rather than `chastity`, drops `trappable`, and sets a different floor. Those
 * are the whole of the difference, which is why this table is short where the literals were long.
 */
const ChastityParts: Readonly<Record<ChastityKind, VariantPart<restraint>>> = {
    SlimBelt: {
        Group: 'ItemPelvis',
        sfx: 'FutureLock',
        sfxRemove: 'SciFiConfigure',
        // Body, Display, Panel, Lock, band, trim, band, underplug, plug, strap
        Model: 'CyberBelt',
        factionFilters: {
            Lining: { color: 'LightNeutral', override: true },
            Metal: { color: 'DarkNeutral', override: true },
            Display: { color: 'Highlight', override: false },
            Plug: { color: 'Highlight', override: true },
        },
        chastity: true,
        power: 20,
        maxwill: 0.4,
        minLevel: 7,
        shrine: [
            'ChastityBelts',
        ],
        LinkableBy: [
            'Wrapping'
        ],
        playerTags: {
            'ItemVulvaEmpty': -5,
            'ItemVulvaPiercingsEmpty': -5,
        },
    },
    BulkyBelt: {
        Group: 'ItemPelvis',
        sfx: 'FutureLock',
        sfxRemove: 'SciFiConfigure',
        Model: 'ProtoBelt',
        factionFilters: {
            Lining: { color: 'LightNeutral', override: true },
            Metal: { color: 'DarkNeutral', override: true },
            Display: { color: 'Highlight', override: false },
            Plug: { color: 'Highlight', override: true },
        },
        chastity: true,
        power: 20,
        maxwill: 0.4,
        minLevel: 7,
        shrine: [
            'ChastityBelts',
        ],
        LinkableBy: [
            'Wrapping'
        ],
        playerTags: {
            'ItemVulvaEmpty': -5,
            'ItemVulvaPiercingsEmpty': -5,
        },
    },
    SlimBra: {
        Group: 'ItemBreast',
        sfx: 'FutureLock',
        sfxRemove: 'SciFiConfigure',
        Model: 'BraCyber',
        factionFilters: {
            Display: { color: 'Highlight', override: false },
            Lining: { color: 'LightNeutral', override: true },
            Metal: { color: 'DarkNeutral', override: true },
        },
        chastitybra: true,
        trappable: true,
        power: 15,
        maxwill: 0.6,
        shrine: [
            'ChastityBras',
            'Cyber',
            'CyberChastityU',
        ],
        playerTags: {
            'FreeBoob': -1000,
        },
    },
    BulkyBra: {
        Group: 'ItemBreast',
        sfx: 'FutureLock',
        sfxRemove: 'SciFiConfigure',
        Model: 'BraProto',
        factionFilters: {
            Display: { color: 'Highlight', override: false },
            Lining: { color: 'LightNeutral', override: true },
            Metal: { color: 'DarkNeutral', override: true },
        },
        chastitybra: true,
        trappable: true,
        power: 15,
        maxwill: 0.6,
        shrine: [
            'ChastityBras',
            'Cyber',
            'CyberChastityU',
        ],
        playerTags: {
            'FreeBoob': -1000,
        },
    },
}

/**
 * The two display names and flavour words, and the restraint each garment's function line comes from.
 *
 * The function line is the only thing that tells two belts or two bras apart in a list, because their
 * display name is the same; `Source` is carried so the flavour and function lines inherit from the
 * base-game restraint the model was drawn from, declared rather than read at module evaluation.
 */
const ChastityText: Readonly<Record<ChastityKind, {
    readonly DisplayName: string
    readonly FlavorText: string
    readonly Source: string
}>> = {
    SlimBelt: { DisplayName: 'Drone Belt', FlavorText: 'Slim', Source: 'CyberBelt' },
    BulkyBelt: { DisplayName: 'Drone Belt', FlavorText: 'Bulky', Source: 'CyberBelt' },
    SlimBra: { DisplayName: 'Drone Bra', FlavorText: 'Slim', Source: 'CyberBra' },
    BulkyBra: { DisplayName: 'Drone Bra', FlavorText: 'Bulky', Source: 'CyberBra' },
}

const builder = new RestraintVariantMapBuilder<ChastityKind>({
    baseId: DerivedVariantBase.ChastityRestraint,
})

for (const kind of ChastityKinds) {
    builder.AddVariantPart(kind, {
        ...ChastityParts[kind],
        name: '',
    } satisfies VariantPart<restraint>)
    builder.AddText(kind, ChastityText[kind])
}

/**
 * The **registered restraint name** for each kind — not the variant name.
 *
 * `BuildVariantMap`'s key is the restraint's name, so this is what `KinkyDungeonGetRestraintByName`
 * resolves and what the game's equip entry points expect. The *variant* name is minted separately when
 * the game equips a variant; handing one to a `ByName` lookup silently finds nothing.
 *
 * A lookup rather than four exported names, so an unknown kind is a compile error rather than an
 * undefined name at runtime.
 */
export const ChastityRestraints: IMMap<ChastityKind, string> =
    AddRestraintVariantMapToGame(builder.BuildVariantMap(ChastityBase))

/**
 * The registered restraint for one kind.
 *
 * @param kind - One of the four.
 */
export const GetChastity = (kind: ChastityKind): string =>
    ThrowIfNull(ChastityRestraints.get(kind), `Boids: no restraint was registered for '${kind}'.`)
