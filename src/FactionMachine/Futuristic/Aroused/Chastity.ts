/**
 * The drone chastity set: a belt for `ItemPelvis` and a bra for `ItemBreast`, each
 * in a slim and a bulky model variant. The two variants of a garment share
 * everything except the model and the flavour word, so they are built from two
 * private templates rather than from a variant map.
 *
 * Every export is the registered restraint's name, a generated GUID; the reader-
 * facing name comes from the text key `AddRestraintWithTextThenGetName` writes.
 * @module FactionMachine/Futuristic/Aroused/Chastity
 */

import { AddRestraintWithTextThenGetName } from '../../../KDExtension';
import { SFX } from '../Common';
import { RequireLockedEvent } from '../Common';

const BeltBase = {
    inventory: true,
    name: '',
    Group: 'ItemPelvis',
    shrine: [
        'Chastity',
        'Metal',
        'ChastityBelts'
    ],
    LinkableBy: [
        'Wrapping'
    ],

    ...SFX.ElectricMechLockSfx,

    // DefaultLock: 'Cyber3',
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

    arousalMode: false, // Can be worn in non arousal mode without vibe activation etc.
    chastity: true,
    power: 20,
    weight: 0,
    maxwill: 0.4,
    enemyTags: {
        // 'cyberdollchastity': 1000
    },
    playerTags: {
        'ItemVulvaEmpty': -5,
        'ItemVulvaPiercingsEmpty': -5
    },
    minLevel: 7,
    allFloors: true,
    events: [
        RequireLockedEvent,
    ],
}

const BraBase = {
    inventory: true,
    name: '',
    Group: 'ItemBreast',
    shrine: ['ChastityBras', 'Chastity', 'Metal', 'Cyber', 'CyberChastityU'],

    // DefaultLock: 'Cyber3',
    tightType: 'Secure',
    Security: {
        level_tech: 2,
    },
    escapeChance: {
        'Struggle': -1.1,
        'Cut': -0.8,
        'Remove': 1.0,
        'Pick': -0.35
    },

    ...SFX.ElectricMechLockSfx,

    arousalMode: false, // Can be worn in non arousal mode without vibe activation etc.
    trappable: true,
    chastitybra: true,
    power: 15,
    weight: 0,
    maxwill: 0.6,
    enemyTags: {
        // 'cyberdollchastity': 1000
    },
    playerTags: {
        'FreeBoob': -1000
    },
    minLevel: 4,
    allFloors: true,

    events: [
        RequireLockedEvent,
    ],
}

/**
 * The slim pelvis belt, shown in game as "Drone Belt" with the flavour word
 * "Slim". A chastity belt in `ItemPelvis` from level 7, it needs no arousal mode,
 * stays on until unlocked, and resists struggle and cutting while being easier to
 * remove outright than the average restraint.
 */
export const SlimBelt =
    AddRestraintWithTextThenGetName(
        {
            ...BeltBase,
            name: 'BD8079B8-DCE0-48C4-AA6C-A520E5C00D21',
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
        },
        {
            DisplayName: 'Drone Belt',
            FlavorText: 'Slim',
            Source: 'CyberBelt'
        }
    )

/**
 * The slim chest bra, shown in game as "Drone Bra" with the flavour word "Slim".
 * A chastity bra in `ItemBreast` from level 4; like the belt it is wearable outside
 * arousal mode and requires a lock to come off, and it can be trapped, which fires
 * when the wearer struggles out.
 */
export const SlimBra =
    AddRestraintWithTextThenGetName(
        {
            ...BraBase,
            name: 'E0261BA0-1396-491B-8901-2A649E01E499',
            sfx: 'FutureLock',
            sfxRemove: 'SciFiConfigure',
            Model: 'BraCyber',
            factionFilters: {
                Display: { color: 'Highlight', override: false },
                Lining: { color: 'LightNeutral', override: true },
                Metal: { color: 'DarkNeutral', override: true },
            },
        },
        {
            DisplayName: 'Drone Bra',
            FlavorText: 'Slim',
            Source: 'CyberBra'
        }
    )

/**
 * The bulky pelvis belt: "Drone Belt", flavour word "Bulky". Same rules as
 * {@link SlimBelt} — `ItemPelvis`, level 7, lock-on-until-unlocked — with the
 * thicker `ProtoBelt` model instead of `CyberBelt`.
 */
export const BulkyBelt =
    AddRestraintWithTextThenGetName(
        {
            ...BeltBase,
            name: '6428F8EA-53AE-4F76-A117-5BB8480D0DC5',
            sfx: 'FutureLock',
            sfxRemove: 'SciFiConfigure',
            // Body, Display, Panel, Lock, band, trim, band, underplug, plug, strap
            Model: 'ProtoBelt',
            factionFilters: {
                Lining: { color: 'LightNeutral', override: true },
                Metal: { color: 'DarkNeutral', override: true },
                Display: { color: 'Highlight', override: false },
                Plug: { color: 'Highlight', override: true },
            },
        },
        {
            DisplayName: 'Drone Belt',
            FlavorText: 'Bulky',
            Source: 'CyberBelt'
        }
    )

/**
 * The bulky chest bra: "Drone Bra", flavour word "Bulky". Same rules as
 * {@link SlimBra} — `ItemBreast`, level 4, lock-on-until-unlocked — with the
 * `BraProto` model instead of `BraCyber`.
 */
export const BulkyBra =
    AddRestraintWithTextThenGetName(
        {
            ...BraBase,
            name: 'EB459BF1-317C-4613-84CC-7E8DEFB3A374',
            sfx: 'FutureLock',
            sfxRemove: 'SciFiConfigure',
            Model: 'BraProto',
            factionFilters: {
                Display: { color: 'Highlight', override: false },
                Lining: { color: 'LightNeutral', override: true },
                Metal: { color: 'DarkNeutral', override: true },
            },
        },
        {
            DisplayName: 'Drone Bra',
            FlavorText: 'Bulky',
            Source: 'CyberBra'
        }
    )