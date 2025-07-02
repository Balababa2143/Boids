
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

import { Earphone } from './Futuristic/HeadSet/Headphone'
import * as HeadSet from './Futuristic/HeadSet'
import * as HolographicHeadSet from './Futuristic/HeadSet/Holographic'
import * as OralDevice from './Futuristic/Gag/Muffler'
import * as FaceCover from './Futuristic/Gag/FaceCover';


(() => {
    const AddWeaker = (r: string | restraint) =>
        KinkyDungeonAddRestraintIfWeaker(
            r,
            10,
            true,
            'Cyber3',
            undefined,
            undefined,
            undefined,
            'Dollsmith',
            true
        )
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