
(() => {
    PIXI.Assets.load({
        src: 'TextureAtlas/DroneModAsset-0.json',
        loadParser: 'modAtlasLoader'
    })
    PIXI.Assets.load({
        src: 'TextureAtlas/DroneModAsset-1.json',
        loadParser: 'modAtlasLoader'
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


import { KinkyDungeonAddRestraintIfWeaker } from '../../KDInterface/Structured/src/KinkyDungeonAddRestraintIfWeaker'
import { KinkyDungeonRemoveRestraint } from '../../KDInterface/Structured/src/KinkyDungeonRemoveRestraint'

import { Earphone } from './Futuristic/HeadSet/Headphone'
import * as HeadSet from './Futuristic/HeadSet'
import * as HolographicHeadSet from './Futuristic/HeadSet/Holographic'
import * as OralDevice from './Futuristic/Gag/Muffler'
import * as FaceCover from './Futuristic/Gag/FaceCover'
import { SlimBelt, SlimBra } from './Futuristic/Aroused/Chastity'
import { LockVibe, DenialPlugF, DenialPlugR } from './Futuristic/Aroused/Toys';
import { ControlHarness } from './Futuristic/Restraint/Belt';
import { AnkleCuff, ArmCuff, LightCollar, ThighCuff, WaistCuff } from './Futuristic/Restraint/Cuff';

const AddWeakerParams = {
    Tightness: 10,
    Bypass: true,
    Lock: 'Cyber3',
}

const AddWeaker = (r: string | restraint) =>
    KinkyDungeonAddRestraintIfWeaker({
        restraint: r,
        ...AddWeakerParams,
    })
KDCategoriesStart.push(
    { name: 'Drone Sensory Set1', buffs: [], debuffs: [] },
    { name: 'Drone Sensory Set2', buffs: [], debuffs: [] },
)
interface StartPerkInfo {
    name: string,
    callBack: (_: void) => void,
    perk: KDPerk
}
const AddStart = (args: StartPerkInfo) => {
    const { name, callBack, perk } = args
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
    category: 'Boss',
    id: 0,
    cost: 0,
    tags: ['start']
}
const AddDroneMod1Left = (args: StartPerkInfo) =>
    AddStart({
        ...args,
        perk: {
            ...args.perk,
            category: 'Drone Sensory Set1',
            buff: true
        }
    })
AddDroneMod1Left({
    name: 'Drone Sensory Harness Set 1',
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
    name: 'Drone Sensory Harness Set 2',
    callBack: () => {
        [
            Earphone,
            HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 2)),
            FaceCover.AdvanceHarness,
            OralDevice.Ball
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})
AddDroneMod1Left({
    name: 'Drone Sensory Harness Set 3',
    callBack: () => {
        [
            Earphone,
            HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 3)),
            FaceCover.PanelHarness,
            OralDevice.BigBall
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})
AddDroneMod1Left({
    name: 'Drone Sensory Harness Set 4',
    callBack: () => {
        [
            Earphone,
            HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 4)),
            FaceCover.PanelHarnessWithPort,
            OralDevice.Plug
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})
AddDroneMod1Left({
    name: 'Drone Sensory Harness Set 5',
    callBack: () => {
        [
            Earphone,
            HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 1)),
            FaceCover.MetalMuzzle1,
            OralDevice.NonMuffler
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})
const AddDroneMod1Right = (args: StartPerkInfo) =>
    AddStart({
        ...args,
        perk: {
            ...args.perk,
            category: 'Drone Sensory Set1',
            debuff: true
        }
    })
AddDroneMod1Right({
    name: 'Drone Sensory Muzzle Set 1',
    callBack: () => {
        [
            Earphone,
            HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 2)),
            FaceCover.MetalMuzzle1,
            OralDevice.Ball
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})
AddDroneMod1Right({
    name: 'Drone Sensory Muzzle Set 2',
    callBack: () => {
        [
            Earphone,
            HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 2)),
            FaceCover.MetalMuzzle2,
            OralDevice.Ball
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})
AddDroneMod1Right({
    name: 'Drone Sensory Muzzle Set 3',
    callBack: () => {
        [
            Earphone,
            HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 3)),
            FaceCover.OTN1,
            OralDevice.BigBall
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})
AddDroneMod1Right({
    name: 'Drone Sensory Muzzle Set 4',
    callBack: () => {
        [
            Earphone,
            HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 4)),
            FaceCover.OTN2,
            OralDevice.Plug
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})

const AddDroneMod2Left = (args: StartPerkInfo) =>
    AddStart({
        ...args,
        perk: {
            ...args.perk,
            category: 'Drone Sensory Set2',
            buff: true
        }
    })

AddDroneMod2Left({
    name: 'Drone Sensory Muzzle Set 5',
    callBack: () => {
        [
            Earphone,
            FaceCover.Transparent1,
            HolographicHeadSet.GetGlassOnlyMaskVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 1)),
            OralDevice.NonMuffler
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})
AddDroneMod2Left({
    name: 'Drone Sensory Muzzle Set 6',
    callBack: () => {
        [
            FaceCover.Transparent2,
            HolographicHeadSet.GetGlassOnlyMaskVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 1)),
            OralDevice.Ball
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})
AddDroneMod2Left({
    name: 'Drone Sensory Muzzle Set 7',
    callBack: () => {
        [
            FaceCover.MetalMuzzle1,
            HolographicHeadSet.GetGlassOnlyMaskVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 2)),
            OralDevice.BigBall
        ]
            .forEach(AddWeaker)
    },
    perk: {
        ...PerkBase,
        cost: -1
    }
})
AddDroneMod2Left({
    name: 'Drone Sensory Muzzle Set 8',
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
    perk: {
        ...PerkBase,
        cost: -1
    }
})

AddDroneMod2Left({
    name: 'Drone Sensory Muzzle Set 9',
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
    perk: {
        ...PerkBase,
        cost: -1
    }
})

AddStart({
    name: 'Drone Toys',
    perk: {
        startPriority: 10,
        category: 'Start',
        id: 0,
        cost: -2,
        buff: true,
        tags: ['start']
    },
    callBack: () => {
        const lockBackup = AddWeakerParams.Lock

        AddWeakerParams.Lock = 'Cyber2'
        AddWeaker(Earphone)
        AddWeaker(HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 2)))
        AddWeaker(FaceCover.AdvanceHarness)
        AddWeaker(OralDevice.NonMuffler)
        AddWeaker(FaceCover.MetalMuzzle1)

        AddWeakerParams.Lock = 'Cyber3'
        // AddWeakerParams.Lock = undefined!
        AddWeaker('NippleClamps')
        AddWeaker(LockVibe)
        KinkyDungeonRemoveRestraint({
            Group: 'ItemVulva',
            Keep: false,
            NoEvent: true
        })
        AddWeaker(DenialPlugF)
        AddWeaker(DenialPlugR)
        KinkyDungeonRemoveRestraint({
            Group: 'ItemPelvis',
            Keep: false,
            NoEvent: true
        })
        AddWeaker(SlimBelt)
        KinkyDungeonRemoveRestraint({
            Group: 'ItemBreast',
            Keep: false,
            NoEvent: true
        })
        AddWeaker(SlimBra)
        AddWeaker(ControlHarness)

        AddWeakerParams.Lock = 'Cyber1'
        AddWeaker(LightCollar)
        AddWeaker(ArmCuff)
        AddWeaker(WaistCuff)
        AddWeaker(ThighCuff)
        AddWeaker(AnkleCuff)

        AddWeakerParams.Lock = 'Disc'
        // AddWeaker('SteelWBelt')
        // KinkyDungeonRestraints
        //     .filter(r => ['Steel', 'Cuffs'].every(kw => r.name.includes(kw)))
        //     .forEach(AddWeaker)
        KinkyDungeonRestraints
            .filter(r => ['Link'].every(kw => r.name.includes(kw)))
            .filter(r => r.shrine.includes('Chains'))
            .filter(r => [/*'Neo', 'Cyber',*/ 'Elbow', 'Wrist', 'Short', 'Raw'].every(kw => !r.name.includes(kw)))
            .forEach(AddWeaker)

        AddWeakerParams.Lock = lockBackup
    }
})