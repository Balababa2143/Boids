
(() => {
    PIXI.Assets.load({
        src: "TextureAtlas/DroneModAsset-0.json",
        loadParser: "modAtlasLoader"
    })
    PIXI.Assets.load({
        src: "TextureAtlas/DroneModAsset-1.json",
        loadParser: "modAtlasLoader"
    })
})();

import * as Futuristic from './Futuristic'
import ModDesc from '../../Asset/mod.json'


const globalExport = {
    Futuristic
}
globalThis[ModDesc.modname] = globalExport;


declare global {
    interface window {
        [ModDesc.modname]: typeof globalExport
    }
}


import { KinkyDungeonAddRestraintIfWeaker } from '../../KDInterface/Structured/src/KinkyDungeonAddRestraintIfWeaker';

import { Earphone } from './Futuristic/HeadSet/Headphone'
import * as HeadSet from './Futuristic/HeadSet'
import * as HolographicHeadSet from './Futuristic/HeadSet/Holographic'
import * as OralDevice from './Futuristic/Gag/Muffler'
import * as FaceCover from './Futuristic/Gag/FaceCover'

(() => {
    const AddWeaker = (r: string | restraint) =>
        KinkyDungeonAddRestraintIfWeaker({
            restraint: r,
            Tightness:10,
            Bypass: true,
            Lock: 'Cyber3',
        })
    KDCategoriesStart.push(
        {name: "Drone Sensory Set1", buffs: [], debuffs: []},
        {name: "Drone Sensory Set2", buffs: [], debuffs: []},
    )
    interface StartPerkInfo{
        name: string,
        callBack: (_: void) => void,
        perk: KDPerk
    }
    const AddStart = (args: StartPerkInfo) => {
        const {name, callBack, perk} = args
        if (KDPerkStart[name] != null) {
            throw new Error('Duplicated start perk')
        }
        else {
            KDPerkStart[name] = callBack
            KinkyDungeonStatsPresets[name] = {
                ...perk,
                id: name
            }
        }
    }
    const PerkBase: KDPerk = {
        startPriority: 10,
        category: "Boss",
        id: 0,
        cost: 0,
        tags: ["start"]
    }
    const AddDroneMod1Left = (args: StartPerkInfo) =>
        AddStart({
            ...args,
            perk: {
                ...args.perk,
                category: "Drone Sensory Set1",
                buff: true
            }
        })
    AddDroneMod1Left({
        name: "Drone Sensory Harness Set 1",
        callBack: () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 1)),
                FaceCover.SimpleHarness,
                OralDevice.NonMuffler
            ]
            .forEach(AddWeaker)
        },
        perk: {
            ...PerkBase,
            cost: -0.5
        }
    })
    
    AddDroneMod1Left({
        name: "Drone Sensory Harness Set 2",
        callBack: () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 2)),
                FaceCover.AdvanceHarness,
                OralDevice.Ball
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    AddDroneMod1Left({
        name: "Drone Sensory Harness Set 3",
        callBack: () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 3)),
                FaceCover.PanelHarness,
                OralDevice.BigBall
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    AddDroneMod1Left({
        name: "Drone Sensory Harness Set 4",
        callBack: () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 4)),
                FaceCover.PanelHarnessWithPort,
                OralDevice.Plug
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    AddDroneMod1Left({
        name: "Drone Sensory Harness Set 5",
        callBack: () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 1)),
                FaceCover.MetalMuzzle1,
                OralDevice.NonMuffler
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    const AddDroneMod1Right = (args: StartPerkInfo) =>
        AddStart({
            ...args,
            perk: {
                ...args.perk,
                category: "Drone Sensory Set1",
                debuff: true
            }
        })
    AddDroneMod1Right({
        name: "Drone Sensory Muzzle Set 1",
        callBack: () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 2)),
                FaceCover.MetalMuzzle1,
                OralDevice.Ball
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    AddDroneMod1Right({
        name: "Drone Sensory Muzzle Set 2",
        callBack: () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 2)),
                FaceCover.MetalMuzzle2,
                OralDevice.Ball
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    AddDroneMod1Right({
        name: "Drone Sensory Muzzle Set 3",
        callBack: () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 3)),
                FaceCover.OTN1,
                OralDevice.BigBall
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    AddDroneMod1Right({
        name: "Drone Sensory Muzzle Set 4",
        callBack: () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 4)),
                FaceCover.OTN2,
                OralDevice.Plug
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })

    const AddDroneMod2Left = (args: StartPerkInfo) =>
        AddStart({
            ...args,
            perk: {
                ...args.perk,
                category: "Drone Sensory Set2",
                buff: true
            }
        })

    AddDroneMod2Left({
        name: "Drone Sensory Muzzle Set 5",
        callBack: () => {
            [
                Earphone,
                FaceCover.Transparent1,
                HolographicHeadSet.GetGlassOnlyMaskVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 1)),
                OralDevice.NonMuffler
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    AddDroneMod2Left({
        name: "Drone Sensory Muzzle Set 6",
        callBack: () => {
            [
                FaceCover.Transparent2,
                HolographicHeadSet.GetGlassOnlyMaskVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 1)),
                OralDevice.Ball
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    AddDroneMod2Left({
        name: "Drone Sensory Muzzle Set 7",
        callBack: () => {
            [
                FaceCover.MetalMuzzle1,
                HolographicHeadSet.GetGlassOnlyMaskVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 2)),
                OralDevice.BigBall
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    AddDroneMod2Left({
        name: "Drone Sensory Muzzle Set 8",
        callBack: () => {
            [
                Earphone,
                FaceCover.AdvanceHarness,
                FaceCover.MetalMuzzle2,
                HolographicHeadSet.GetGlassOnlyMaskVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 3)),
                OralDevice.NonMuffler
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
    AddDroneMod2Left({
        name: "Drone Sensory Muzzle Set 9",
        callBack: () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 2)),
                FaceCover.SimpleHarness,
                FaceCover.OTN1,
                HolographicHeadSet.GetGlassOnlyMaskVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 4)),
                OralDevice.Ball
            ]
            .forEach(AddWeaker)
        },
        perk:{
            ...PerkBase,
            cost: -1
        }
    })
})();

(() => {
    const r1 = <restraint>KinkyDungeonRestraints.find(r => r.name === 'NippleClamps')
    const r2 = <restraint>KinkyDungeonRestraints.find(r => r.name === 'TrapVibe')
    const r3 = <restraint>{
        ...r2,
        name: 'LockVibe',
        escapeChance: {
            ...r1!.escapeChance,
            Struggle: r2!.escapeChance.Struggle
        }
    }
    KinkyDungeonRestraints.push(r3)
    KinkyDungeonAddRestraintText(
        r3.name,
        'Lockable Vibe',
        TextProvider.instance.getText(`Restraint${r2!.name}Desc`),
        TextProvider.instance.getText(`Restraint${r2!.name}Desc2`),
    )
    const r4 = <restraint>{
        inventory: true,
        arousalMode: true,
        name: "DenialPlugF",
        Asset: "VibratingDildo",
        Color: "Default",
        Group: "ItemVulva",
        plugSize: 1.5,
        power: 3,
        weight: 2,
        failSuffix: { "Struggle": "Plug" },
        limited: true,
        escapeChance: { ...r1.escapeChance, "Struggle": 0.25, Remove: 0.5 },
        enemyTags: { "trap": 10, "maidRestraintsLight": 2, "genericToys": 2, 'machinePlug': 5, "toyPleasure": 2 },
        playerTags: { "NoVibes": -1000 },
        minLevel: 0,
        allFloors: true,
        shrine: ["Plugs", "Vibes", "Toys"],
        // linkedVibeTags: ["plugs"],
        allowRemote: true, events: [
            { trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true },
            { trigger: "remoteVibe", type: "RemoteActivatedVibe", power: 4, time: 5, edgeOnly: true },
            { trigger: "tick", type: "PeriodicDenial", power: 1, time: 13, edgeOnly: true, cooldown: { "normal": 15, "tease": 10 }, chance: 0.02 },
            { trigger: "tick", type: "PeriodicDenial", power: 2, time: 10, edgeOnly: true, cooldown: { "normal": 15, "tease": 10 }, chance: 0.025 },
            { trigger: "tick", type: "PeriodicDenial", power: 3, time: 7, edgeOnly: true, cooldown: { "normal": 15, "tease": 10 }, chance: 0.03 },
            { trigger: "tick", type: "PeriodicDenial", power: 4, time: 4, edgeOnly: true, cooldown: { "normal": 15, "tease": 10 }, chance: 0.015 },
            { trigger: "tick", type: "PeriodicDenial", power: 5, time: 6, edgeOnly: true, cooldown: { "normal": 15, "tease": 10 }, chance: 0.075 },
            { trigger: "tick", type: "PeriodicTeasing", power: 5, time: 3, edgeOnly: false, cooldown: { "normal": 15, "tease": 10 }, chance: 0.0025 },
        ]
    }
    KinkyDungeonRestraints.push(r4 as restraint)
    KinkyDungeonAddRestraintText(
        r4.name,
        'Lockable Plug',
        TextProvider.instance.getText(`Restraint${'TrapPlug3'}Desc`),
        TextProvider.instance.getText(`Restraint${'TrapPlug3'}Desc2`),
    )
    const r5 = <restraint>{
        inventory: true,
        arousalMode: true,
        name: "DenialPlugR",
        Asset: "VibratingDildoPlug",
        Color: "Default",
        Group: "ItemButt",
        plugSize: 2.0,
        power: 5,
        weight: 1,
        escapeChance: { ...r1.escapeChance, "Struggle": 0.25, Remove: 0.5 },
        enemyTags: { "genericToys": 1, "rearToys": 10, "toyEdgeMid": 2 },
        limited: true,
        playerTags: { "NoVibes": -1000 },
        minLevel: 0,
        allFloors: true,
        shrine: ["Plugs", "Vibes", "Toys"],
        failSuffix: { "Struggle": "Plug" },
        // linkedVibeTags: ["plugs"],
        allowRemote: true,
        events: [
            { trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true },
            { trigger: "remoteVibe", type: "RemoteActivatedVibe", power: 2, time: 30, edgeOnly: true },
            { trigger: "tick", type: "PeriodicDenial", power: 1, time: 24, edgeOnly: true, cooldown: { "normal": 50, "tease": 20 }, chance: 0.03 },
            { trigger: "tick", type: "PeriodicDenial", power: 2, time: 16, edgeOnly: true, cooldown: { "normal": 50, "tease": 20 }, chance: 0.02 },
        ]
    }
    KinkyDungeonRestraints.push(r5 as restraint)
    KinkyDungeonAddRestraintText(
        r5.name,
        'Lockable Rear Plug',
        TextProvider.instance.getText(`Restraint${'RearVibe1'}Desc`),
        TextProvider.instance.getText(`Restraint${'RearVibe1'}Desc2`),
    )
})();