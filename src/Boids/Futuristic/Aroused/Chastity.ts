import { AddRestraintWithTextThenGetName } from '../../../KDInterface/KDExtension';
import { ElectricMechLockSfx } from '../Common';

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

    ...ElectricMechLockSfx,

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
        { trigger: 'postUnlock', type: 'RequireLocked', inheritLinked: true },
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

    ...ElectricMechLockSfx,

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
        { trigger: 'postUnlock', type: 'RequireLocked', inheritLinked: true },
    ],
}

export const SlimBelt =
    AddRestraintWithTextThenGetName(
        {
            ...BeltBase,
            name: 'BD8079B8-DCE0-48C4-AA6C-A520E5C00D21',
            sfx: 'FutureLock',
            sfxRemove: 'SciFiConfigure',
            Asset: 'FuturisticChastityBelt',
            Modules: [3, 1, 1, 1, 1],
            OverridePriority: 26,
            Color: ['#222222', '#499ed6', '#555555', '#000000', '#555555', '#b927a8', '#3868E8', '#555555', '#222222'],
            // Body, Display, Panel, Lock, band, trim, band, underplug, plug, strap
            factionColor: [[0], [5], [1]],
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
            FunctionText: TextProvider.instance.getText(`Restraint${'CyberBelt'}Desc2`)
        }
    )

export const SlimBra =
    AddRestraintWithTextThenGetName(
        {
            ...BraBase,
            name: 'E0261BA0-1396-491B-8901-2A649E01E499',
            sfx: 'FutureLock',
            sfxRemove: 'SciFiConfigure',
            Asset: 'FuturisticBra2',
            OverridePriority: 26,
            Color: ['#499ed6', '#555555', '#222222', '#ffffff', '#555555', '#000000', KDBaseBlack],
            factionColor: [[2, 5], [2], [0]],
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
            FunctionText: TextProvider.instance.getText(`Restraint${'CyberBra'}Desc2`)
        }
    )

export const BulkyBelt =
    AddRestraintWithTextThenGetName(
        {
            ...BeltBase,
            name: '6428F8EA-53AE-4F76-A117-5BB8480D0DC5',
            sfx: 'FutureLock',
            sfxRemove: 'SciFiConfigure',
            Asset: 'FuturisticChastityBelt',
            Modules: [3, 1, 1, 1, 1],
            OverridePriority: 26,
            Color: ['#222222', '#499ed6', '#555555', '#000000', '#555555', '#b927a8', '#3868E8', '#555555', '#222222'],
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
            FunctionText: TextProvider.instance.getText(`Restraint${'CyberBelt'}Desc2`)
        }
    )

export const BulkyBra =
    AddRestraintWithTextThenGetName(
        {
            ...BraBase,
            name: 'EB459BF1-317C-4613-84CC-7E8DEFB3A374',
            sfx: 'FutureLock',
            sfxRemove: 'SciFiConfigure',
            Asset: 'FuturisticBra2',
            OverridePriority: 26,
            Color: ['#499ed6', '#555555', '#222222', '#ffffff', '#555555', '#000000', KDBaseBlack],
            factionColor: [[2, 5], [2], [0]],
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
            FunctionText: TextProvider.instance.getText(`Restraint${'CyberBra'}Desc2`)
        }
    )