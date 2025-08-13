import * as Futuristic from './Futuristic'
import { IKinkyDungeonAddRestraintIfWeakerParameters, KinkyDungeonAddRestraintIfWeaker } from '../../KDInterface/Structured/src/KinkyDungeonAddRestraintIfWeaker'

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

        AddWeakerParams.Lock = 'Cyber3'
        AddWeaker(Futuristic.Suit.LatexSuit.HeavyLockableSuit)

        AddWeakerParams.Lock = 'Cyber2'
        AddWeaker(Futuristic.HeadSet.Headphone.Earphone)
        AddWeaker(Futuristic.HeadSet.Holographic.GetGoggleVariant(new Futuristic.HeadSet.Variant(Futuristic.HeadSet.GlassType.Color, 2)))
        AddWeaker(Futuristic.Gag.FaceCover.PanelHarness)
        // AddWeaker(Futuristic.Gag.FaceCover.MetalMuzzle2)
        AddWeaker(Futuristic.Gag.Muffler.NonMuffler)
        // AddWeaker(Futuristic.HeadSet.Holographic.GetGlassOnlyMaskVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 1)))

        AddWeakerParams.Lock = 'Cyber3'
        AddWeaker('NippleClamps3')
        AddWeaker(Futuristic.Aroused.Toys.LockVibe)

        AddWeaker(Futuristic.Aroused.Toys.DenialPlugF)
        AddWeaker(Futuristic.Aroused.Toys.DenialPlugR)

        AddWeaker(Futuristic.Aroused.Chastity.BulkyBelt)

        AddWeaker(Futuristic.Aroused.Chastity.BulkyBra)

        AddWeakerParams.Lock = 'Cyber2'
        AddWeaker(Futuristic.Cuff.LightCollar)
        // AddWeaker(Futuristic.Cuff.ElbowCuff)
        // AddWeaker(Futuristic.Cuff.WristCuff)
        AddWeaker(Futuristic.Cuff.ArmCuff)
        AddWeaker(Futuristic.Cuff.WaistCuff)
        // AddWeaker(Futuristic.Strap.ControlHarness)
        AddWeaker(Futuristic.Cuff.ThighCuff)
        AddWeaker(Futuristic.Cuff.AnkleCuff)

        AddWeakerParams.Lock = 'Cyber'
        AddWeaker(Futuristic.Link.Arm.GetRestraint('BetweenWristCuff'))
        AddWeaker(Futuristic.Link.Leg.GetRestraint('BetweenThighCuff'))
        AddWeaker(Futuristic.Link.Leg.GetRestraint('BetweenAnkleCuff'))

        AddWeakerParams.Lock = lockBackup
    }
})