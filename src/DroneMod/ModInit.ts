const tmp = LAYERS_BASE[219]
LAYERS_BASE[219] = LAYERS_BASE[220]
LAYERS_BASE[220] = tmp
for(const [k, v] of Object.entries(InitLayers(LAYERS_BASE))){
    ModelLayers[k] = v
}

PIXI.Assets.load({
    src: 'TextureAtlas/DroneModAsset-0.json',
    loadParser: 'modAtlasLoader'
})
PIXI.Assets.load({
    src: 'TextureAtlas/DroneModAsset-1.json',
    loadParser: 'modAtlasLoader'
})
import * as Futuristic from './Futuristic'
import ModDesc from '../../Asset/mod.json'

const globalExport = {
    Futuristic
}
globalThis[ModDesc.modname] = globalExport;

import { IKinkyDungeonAddRestraintIfWeakerParameters, KinkyDungeonAddRestraintIfWeaker } from '../../KDInterface/Structured/src/KinkyDungeonAddRestraintIfWeaker'
import { KinkyDungeonRemoveRestraint } from '../../KDInterface/Structured/src/KinkyDungeonRemoveRestraint'

import * as Aroused from './Futuristic/Aroused'
import * as Coating from './Futuristic/Coating'
import * as Gag from './Futuristic/Gag'
import * as HeadSet from './Futuristic/HeadSet'
import * as Restraint from './Futuristic/Restraint'

const AddWeakerParams: IKinkyDungeonAddRestraintIfWeakerParameters = {
    restraint: '',
    Tightness: 10,
    Bypass: true,
    Deep: true,
    Lock: 'Cyber3',
}

const AddWeaker = (r: string | restraint) =>
    KinkyDungeonAddRestraintIfWeaker({
        ...AddWeakerParams,
        restraint: r,
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
    startPriority: 1100,
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
const AddDroneMod1Right = (args: StartPerkInfo) =>
    AddStart({
        ...args,
        perk: {
            ...args.perk,
            category: 'Drone Sensory Set1',
            debuff: true
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

        AddWeakerParams.Lock = undefined
        AddWeaker(Coating.LatexSuit.HeavyLockableSuit)

        AddWeakerParams.Lock = 'Cyber2'
        AddWeaker(HeadSet.Headphone.Earphone)
        AddWeaker(HeadSet.Holographic.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 2)))
        AddWeaker(Gag.FaceCover.PanelHarness)
        // AddWeaker(Gag.FaceCover.MetalMuzzle2)
        AddWeaker(Gag.Muffler.NonMuffler)
        // AddWeaker(HeadSet.Holographic.GetGlassOnlyMaskVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 1)))

        AddWeakerParams.Lock = 'Cyber3'
        AddWeaker('NippleClamps3')
        AddWeaker(Aroused.Toys.LockVibe)

        AddWeaker(Aroused.Toys.DenialPlugF)
        AddWeaker(Aroused.Toys.DenialPlugR)

        AddWeaker(Aroused.Chastity.BulkyBelt)

        AddWeaker(Aroused.Chastity.BulkyBra)

        AddWeakerParams.Lock = 'Cyber2'
        // AddWeaker(Restraint.Cuff.LightCollar)
        // AddWeaker(Restraint.Cuff.ElbowCuff)
        // AddWeaker(Restraint.Cuff.WristCuff)
        AddWeaker(Restraint.Cuff.ArmCuff)
        AddWeaker(Restraint.Cuff.WaistCuff)
        // AddWeaker(Restraint.Strap.ControlHarness)
        AddWeaker(Restraint.Cuff.ThighCuff)
        AddWeaker(Restraint.Cuff.AnkleCuff)

        AddWeakerParams.Lock = 'Cyber'
        AddWeaker(Futuristic.Restraint.Link.Arm.GetRestraint('BetweenWristCuff'))
        AddWeaker(Futuristic.Restraint.Link.Leg.GetRestraint('BetweenThighCuff'))
        AddWeaker(Futuristic.Restraint.Link.Leg.GetRestraint('BetweenAnkleCuff'))

        AddWeakerParams.Lock = lockBackup
    }
})