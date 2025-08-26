import { ThrowIfNull } from '../Utilities'
import * as Futuristic from './Futuristic'
import * as MachinePrime from './MachinePrime'
import { IKDEquipInventoryVariantParameters, KDEquipInventoryVariant, KDMorphToInventoryVariant, KinkyDungeonRemoveRestraintSpecific } from 'kd-structured'

const AddWeakerParams: Partial<IKDEquipInventoryVariantParameters> = {
    Tightness: 10,
    Bypass: true,
    Deep: true,
    Lock: 'Cyber3',
}

const AddVariant = (variant: KDRestraintVariant) =>
    KDEquipInventoryVariant({
        ...AddWeakerParams,
        variant
    })
const AddWeaker = (r: string) =>
    KDEquipInventoryVariant({
        ...AddWeakerParams,
        variant: {
            template: r,
            events: [
            ]
        }
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

let CurrentVisorVariant = {
    GlassType: Futuristic.GlassVisor.GlassType.BoidsGoggle,
    Colorize: true as boolean,
    Layering: Futuristic.GlassVisor.Layering.Goggle,
    Level: 1 as Futuristic.GlassVisor.Level
} satisfies Futuristic.GlassVisor.Variant

export const ToggleVisor = (morph: boolean) => {
    // const currentVisor = KinkyDungeonGetRestraintItem('ItemHead')
    // const currentVisor = KinkyDungeonGetRestraintsWithShrine({
    //     shrine: 'DroneVisor'
    // })[0]
    const currentVisor =
        ThrowIfNull(KinkyDungeonInventoryGetWorn(
            Futuristic.GlassVisor.GetSocketedVisorVariant(CurrentVisorVariant)
        ))

    const currentLevel = CurrentVisorVariant.Level
    if (currentLevel < 4) {
        CurrentVisorVariant = {
            ...CurrentVisorVariant,
            Level: (currentLevel + 1) as Futuristic.GlassVisor.Level
        }
    }
    else {
        CurrentVisorVariant = {
            ...CurrentVisorVariant,
            Colorize: !CurrentVisorVariant.Colorize,
            Level: 1
        }
    }
    const newVisor = Futuristic.GlassVisor.GetSocketedVisorVariant(CurrentVisorVariant)
    if (morph) {
        KDMorphToInventoryVariant({
            item: currentVisor,
            variant: {
                template: newVisor,
                events: []
            },
            forceMorph: true
        })
    }
    else {
        KinkyDungeonRemoveRestraintSpecific({
            item: currentVisor!
        })
        AddWeaker(Futuristic.GlassVisor.GetSocketedVisorVariant(CurrentVisorVariant))
    }


    KinkyDungeonAdvanceTime(1)
}

export const AddDroneSet = () => {
    const lockBackup = AddWeakerParams.Lock

    AddWeakerParams.Lock = 'Cyber3'
    AddWeaker(Futuristic.Suit.LatexSuit.HeavyLockableSuit)

    AddWeakerParams.Lock = 'Cyber2'
    AddWeaker(Futuristic.Headphone.Earphone)
    AddWeaker(Futuristic.GlassVisor.GetSocketedVisorVariant(CurrentVisorVariant))
    // for(let i = 0; i < 8; ++i){
    //     ToggleVisor()
    // }
    AddVariant(MachinePrime.Gag.MakeGagVariantWithBallSocket(Futuristic.Gag.FaceCover.PanelHarness))
    // MachinePrime.Gag.AddGag(Futuristic.Gag.FaceCover.MetalMuzzle2)
    // AddWeaker(Futuristic.HeadSet.Holographic.GetGlassOnlyMaskVariant(new Futuristic.HeadSet.Variant(Futuristic.HeadSet.GlassType.Color, 1)))

    AddWeakerParams.Lock = 'Cyber3'
    AddWeaker('NippleClamps3')
    AddWeaker(Futuristic.Aroused.Toys.LockVibe)

    AddWeaker(Futuristic.Aroused.Toys.DenialPlugF)
    AddWeaker(Futuristic.Aroused.Toys.DenialPlugR)

    AddWeaker(Futuristic.Aroused.Chastity.SlimBelt)

    AddWeaker(Futuristic.Aroused.Chastity.SlimBra)

    AddWeakerParams.Lock = 'Cyber2'
    AddWeaker(Futuristic.Cuff.LightCollar)
    // AddWeaker(Futuristic.Cuff.ElbowCuff)
    // AddWeaker(Futuristic.Cuff.WristCuff)
    AddWeaker(Futuristic.Cuff.ArmCuff)
    // AddWeaker(Futuristic.Cuff.WaistCuff)
    AddWeaker(Futuristic.Strap.ControlHarness)
    AddWeaker(Futuristic.Cuff.ThighCuff)
    AddWeaker(Futuristic.Cuff.AnkleCuff)

    AddWeakerParams.Lock = 'Cyber'
    AddWeaker(Futuristic.Link.Arm.GetRestraint('BetweenWristCuff'))
    AddWeaker(Futuristic.Link.Leg.GetRestraint('BetweenThighCuff'))
    AddWeaker(Futuristic.Link.Leg.GetRestraint('BetweenAnkleCuff'))

    AddWeakerParams.Lock = lockBackup
}

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
    callBack: AddDroneSet
})