/**
 * A demo driver rather than a library: importing it registers the `Drone Toys` start
 * perk and two empty start categories, and taking that perk equips the whole drone set.
 *
 * The perk's callback is `AddDroneSet`, which is also exported for the console. The
 * registration is a one-shot side effect at module evaluation — a second `Drone Toys`
 * perk, whether from another copy of this module or from another mod, throws instead of
 * merging.
 * @module FactionMachine/DebugStart
 */

import * as Futuristic from './Futuristic'
import * as MachinePrime from './MachinePrime'
import { CategoryKey, RegisterEngineString, StartPerkKeys } from '../KDExtension'
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


/**
 * The start screen's grouping for this faction, and where its labels live.
 *
 * A category's name **is** a key suffix: the engine draws `TextGet('KDCategory' + c.name)`
 * (`KinkyDungeonPerks.ts:1218`), so registering the label is not optional — an unregistered
 * one draws the tag itself. The name stays as it is because it is also the grouping key.
 */
const SensoryCategories = [
    { Name: 'Drone Sensory Set1', Path: ['FactionMachine', 'Start', 'SensorySet1'] },
    { Name: 'Drone Sensory Set2', Path: ['FactionMachine', 'Start', 'SensorySet2'] },
] as const satisfies readonly { readonly Name: string, readonly Path: readonly string[] }[]

KDCategoriesStart.push(
    ...SensoryCategories.map(category => ({ name: category.Name, buffs: [], debuffs: [] })),
)

for (const category of SensoryCategories) {
    RegisterEngineString({
        Key: CategoryKey(category.Name),
        Local: category.Name,
        Slot: 'Category',
        Path: category.Path,
    })
}

interface StartPerkInfo {
    name: string,
    /** Where this perk's name and description live in the text trees. */
    path: readonly string[],
    callBack: (_: void) => void,
    perk: KDPerk
}
const AddStart = (args: StartPerkInfo) => {
    const { name, path, callBack, perk } = args
    if (KDPerkStart[name] != null) {
        throw new Error('Duplicated start perk')
    }
    else {
        KDPerkStart[name] = callBack
        KinkyDungeonStatsPresets[name] = {
            ...perk,
            id: name
        }
        // The perk screen draws the name from the preset's `id` and the description from a
        // sibling key (`KinkyDungeonShrine.ts:1007-1009`), so both are registered even though
        // this mod authors no description yet: an unregistered one draws the tag.
        RegisterEngineString({
            Key: StartPerkKeys(name).Name,
            Local: name,
            Slot: 'StartPerkName',
            Path: path,
        })
        RegisterEngineString({
            Key: StartPerkKeys(name).Description,
            Local: '',
            Slot: 'StartPerkDescription',
            Path: [...path, 'Description'],
        })
    }
}

/**
 * Equips the drone set on the player and puts them into the game's `DollSuit` outfit.
 *
 * Every piece goes on through `KDEquipInventoryVariant` with a soft fit (`Tightness: 10`, `Bypass`,
 * `Deep`) and the Dollmaker faction, in three passes that differ only in the lock they use: `Cyber3`,
 * then `Cyber2`, then the plain `Cyber` for the links.
 *
 * ## The two visors are chosen, not written down
 *
 * This used to spell out which glass to equip — a Dollmaker mask and a Boids mask, in that order,
 * each named inline. Nothing decided between them; the order of two calls did. They are now
 * **candidates with the dimensions they would cover**, handed to
 * `Coordinator.SelectProvider`, which keeps the ones the Host's current demand can be honoured on.
 *
 * That is step 1.5 of the dev plan and it is the whole point: adding a third glass family is adding
 * a candidate, and a family that would cover a dimension the Host is not engaged with is passed over
 * rather than equipped and ignored.
 *
 * The set is otherwise unchanged: the lock passes are preserved as found, and the `Lock` field they
 * share is restored before the outfit work.
 *
 * This is what the `Drone Toys` perk calls, so it takes no arguments; it is exported for the console
 * as well.
 */
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

    // One candidate per glass family, each with what it would cover. `Sight` is the dimension a
    // visor moves; a family that moved something else would say so here and be judged on that.
    const Sight = MachinePrime.Coordinator.Catalog.DimensionIdOf(
        MachinePrime.Coordinator.Catalog.DimensionName.Sight
    )
    const visorCandidates = [
        {
            Source: 'Dollmaker goggle',
            Dimensions: [Sight],
            Build: () => MachinePrime.Item.Visor.Dollmaker.Variant({
                GlassType: Futuristic.GlassVisor.Constant.GlassType.DollmakerGoggle,
                Layering: Futuristic.GlassVisor.Constant.Layering.Goggle,
            }),
        },
        {
            Source: 'Boids mask',
            Dimensions: [Sight],
            Build: () => MachinePrime.Item.Visor.Boids.Variant({
                GlassType: Futuristic.GlassVisor.Constant.GlassType.BoidsMask,
                Colorize: false,
                Layering: Futuristic.GlassVisor.Constant.Layering.Hood,
            }),
        },
    ]
    const chosenVisor = MachinePrime.Coordinator.SelectProvider(visorCandidates)
    if (chosenVisor != null) {
        AddVariant(chosenVisor.Build())
    }

    AddWeaker(Futuristic.GlassVisor.FullMaskMount)
    AddWeaker(Futuristic.GlassVisor.GetVariant({
        GlassType: Futuristic.GlassVisor.Constant.GlassType.BoidsMask,
        Colorize: false,
        Layering: Futuristic.GlassVisor.Constant.Layering.Hood,
        Socketed: true,
        Level: 2,
        HideBrows: false,
    }))

    AddVariant(MachinePrime.Item.Gag.MakeGagVariantWithBallSocket(Futuristic.Gag.FaceCover.AdvanceHarness))
    AddVariant(MachinePrime.Item.Gag.MakeGagVariantWithBallSocket(Futuristic.Gag.FaceCover.MetalMuzzle1))



    AddWeakerParams.Lock = 'Cyber3'
    AddWeaker('NippleClamps3')
    // AddWeaker('NippleWeights')
    AddWeaker(Futuristic.Aroused.Toys.GetToy(Futuristic.Aroused.Toys.ToyKind.LockVibe))

    AddWeaker(Futuristic.Aroused.Toys.GetToy(Futuristic.Aroused.Toys.ToyKind.DenialPlugF))
    AddWeaker(Futuristic.Aroused.Toys.GetToy(Futuristic.Aroused.Toys.ToyKind.DenialPlugR))

    AddWeaker(Futuristic.Aroused.Chastity.GetChastity(Futuristic.Aroused.Chastity.ChastityKind.BulkyBelt))

    AddWeaker(Futuristic.Aroused.Chastity.GetChastity(Futuristic.Aroused.Chastity.ChastityKind.BulkyBra))

    AddWeakerParams.Lock = 'Cyber2'
    AddWeaker(Futuristic.Cuff.GetCuff(Futuristic.Cuff.CuffKind.LightCollar))
    // AddWeaker(Futuristic.Cuff.GetCuff(Futuristic.Cuff.CuffKind.ElbowCuff))
    // AddWeaker(Futuristic.Cuff.GetCuff(Futuristic.Cuff.CuffKind.WristCuff))
    // AddWeaker(Futuristic.Cuff.GetCuff(Futuristic.Cuff.CuffKind.ArmCuff))
    AddWeaker(Futuristic.Cuff.GetCuff(Futuristic.Cuff.CuffKind.WaistCuff))
    // AddWeaker(Futuristic.Strap.ControlHarness)
    AddWeaker(Futuristic.Cuff.GetCuff(Futuristic.Cuff.CuffKind.ThighCuff))
    AddWeaker(Futuristic.Cuff.GetCuff(Futuristic.Cuff.CuffKind.AnkleCuff))
    AddWeaker(Futuristic.Limb.Boot.Heel)
    AddWeaker(Futuristic.Limb.Mitten.WireCuff)

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
    path: ['FactionMachine', 'Start', 'DroneToys'],
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