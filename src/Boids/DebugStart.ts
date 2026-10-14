import * as Futuristic from './Futuristic'
import * as MachinePrime from './MachinePrime'
import { IKDEquipInventoryVariantParameters, KDEquipInventoryVariant } from 'kd-structured'

const AddWeakerParams: Partial<IKDEquipInventoryVariantParameters> = {
    Tightness: 10,
    Bypass: true,
    Deep: true,
    Lock: 'Cyber3',
    faction: 'Dollmaker'
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
            events: null!
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

export const AddDroneSet = () => {
    const lockBackup = AddWeakerParams.Lock

    AddWeakerParams.Lock = 'Cyber3'
    // KDEquipInventoryVariant({
    //     ...AddWeakerParams,
    //     variant: {
    //         template: Futuristic.Suit.LatexSuit.HeavyLockableSuit,
    //         events: null!
    //     },
    //     faction: 'AncientRobot'
    // })

    AddWeakerParams.Lock = 'Cyber2'
    AddWeaker(Futuristic.Headphone.Earphone)
    // AddWeaker(Futuristic.GlassVisor.GetVariant({
    //     GlassType: Futuristic.GlassVisor.Constant.GlassType.BoidsGoggle,
    //     Colorize: true,
    //     Layering: Futuristic.GlassVisor.Constant.Layering.Goggle,
    //     Socketed: true,
    //     Level: 4,
    //     HideBrows: true,
    // }))
    AddVariant(MachinePrime.Item.Visor.Dollmaker.Variant({
        GlassType: Futuristic.GlassVisor.Constant.GlassType.DollmakerGoggle,
        // Colorize: true,
        Layering: Futuristic.GlassVisor.Constant.Layering.Goggle
    }))

    AddWeaker(Futuristic.GlassVisor.FullMaskMount)
    AddWeaker(Futuristic.GlassVisor.GetVariant({
        GlassType: Futuristic.GlassVisor.Constant.GlassType.BoidsMask,
        Colorize: false,
        Layering: Futuristic.GlassVisor.Constant.Layering.Hood,
        Socketed: true,
        Level: 2,
        HideBrows: false,
    }))
    // AddVariant(MachinePrime.Item.Visor.Boids.Variant({
    //     GlassType: Futuristic.GlassVisor.Constant.GlassType.BoidsMask,
    //     Colorize: true,
    //     Layering: Futuristic.GlassVisor.Constant.Layering.Hood
    // }))
    AddVariant(MachinePrime.Item.Visor.Boids.Variant({
        GlassType: Futuristic.GlassVisor.Constant.GlassType.BoidsMask,
        Colorize: false,
        Layering: Futuristic.GlassVisor.Constant.Layering.Hood
    }))

    AddVariant(MachinePrime.Item.Gag.MakeGagVariantWithBallSocket(Futuristic.Gag.FaceCover.AdvanceHarness))
    AddVariant(MachinePrime.Item.Gag.MakeGagVariantWithBallSocket(Futuristic.Gag.FaceCover.MetalMuzzle1))



    AddWeakerParams.Lock = 'Cyber3'
    AddWeaker('NippleClamps3')
    // AddWeaker('NippleWeights')
    AddWeaker(Futuristic.Aroused.Toys.LockVibe)

    AddWeaker(Futuristic.Aroused.Toys.DenialPlugF)
    AddWeaker(Futuristic.Aroused.Toys.DenialPlugR)

    AddWeaker(Futuristic.Aroused.Chastity.BulkyBelt)

    AddWeaker(Futuristic.Aroused.Chastity.BulkyBra)

    AddWeakerParams.Lock = 'Cyber2'
    AddWeaker(Futuristic.Cuff.LightCollar)
    AddWeaker(Futuristic.Cuff.ElbowCuff)
    AddWeaker(Futuristic.Cuff.WristCuff)
    // AddWeaker(Futuristic.Cuff.ArmCuff)
    AddWeaker(Futuristic.Cuff.WaistCuff)
    // AddWeaker(Futuristic.Strap.ControlHarness)
    AddWeaker(Futuristic.Cuff.ThighCuff)
    AddWeaker(Futuristic.Cuff.AnkleCuff)
    // AddWeaker(Futuristic.Limb.Boot.Heel)
    // AddWeaker(Futuristic.Limb.Mitten.WireCuff)

    AddWeakerParams.Lock = 'Cyber'
    AddWeaker(Futuristic.Link.Arm.GetRestraintVariant('BetweenWristCuff'))
    AddWeaker(Futuristic.Link.Arm.GetRestraintVariant('BetweenElbowCuff'))
    AddWeaker(Futuristic.Link.Leg.GetRestraintVariant('BetweenThighCuff'))
    AddWeaker(Futuristic.Link.Leg.GetRestraintVariant('BetweenAnkleCuff'))

    AddWeakerParams.Lock = lockBackup

    const outfitName = 'DollSuit'

    const outfit = {name: outfitName, id: KinkyDungeonGetItemID(), type: Outfit}
    if (!KinkyDungeonInventoryGet(outfitName)){
        KinkyDungeonInventoryAdd(outfit)
    } 
    KinkyDungeonSetDress(outfitName, outfitName)
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