/**
 * The visor models: one per variant key, registered into `ModelDefs` as a side
 * effect of importing this module, plus the model for the mask mount.
 *
 * Each model wraps the variant's glass layer from `Layer.ts`, picks the Dollmaker
 * or the Boids texture folder, hides the brows when the key says so, and adds the
 * `HoodMask` pose to the hood layering. The display names the player sees come
 * from the restraints in `Item.ts`, not from here.
 * @module Boids/Futuristic/GlassVisor/Model
 */

import { Constant } from '../Common'
import Variant, { AddValidVariants } from './Variant'
import { GetVariant as GetLayerVariant } from './Layer'
import { ThrowIfNull } from '../../../Utilities'
import { InheritColor, Layering } from './Constant'
import { AddModelVariantMapToGame, AddModelWithTextThenGetName, VariantKeyOrImmutable, ModelVariantMapBuilder, VariantKeyToImmutable } from '../../../KDExtension'
import { FromJS } from 'immutable'

const ModelTemplate = {
    Categories: ['Accessories', 'Face'],
    Restraint: true,
    TopLevel: true,
} satisfies Partial<Model>

const DollMakerVisorFolder = 'Visors' as const
const BoidsGlassVisorFolder = `${Constant.ModelSetRootDir}/Visor` as const

const BaseName = 'E5050056-23AD-4935-BBC9-68B49F27FB9A' as const

const ValidVariantMap = (() => {
    const builder = new ModelVariantMapBuilder<FromJS<Variant>>({ baseId: BaseName })

    const AddVariant = (variant: Variant) => {
        const immutableVariantKey = VariantKeyToImmutable<Variant>(variant)
        builder.AddVariantPart(immutableVariantKey,{
            Layers: [GetLayerVariant(variant)]
        })
        if (Variant.IsBoidsVariant(variant)) {
            builder.AddVariantPart(immutableVariantKey,{
                Folder: BoidsGlassVisorFolder
            })
        }
        else {
            builder.AddVariantPart(immutableVariantKey,{
                Folder: DollMakerVisorFolder
            })
        }
        if (variant.HideBrows) {
            builder.AddVariantPart(immutableVariantKey,{
                HideLayers: ["Brows"]
            })
        }
        if (variant.Layering === Layering.Hood) {
            builder.AddVariantPart(immutableVariantKey,{
                AddPose: ['HoodMask']
            })
        }
    }

    AddValidVariants(AddVariant)

    return AddModelVariantMapToGame(builder.BuildVariantMap(ModelTemplate))
})()

/**
 * The name the model for a visor variant was registered under.
 *
 * `Item.ts` asks for it once per variant, which is what keeps a restraint and its
 * model from drifting apart: both are keyed by the same variant list.
 *
 * @param variant - The variant key, as a plain literal or already Immutable.
 * @returns The registered model name, the string a restraint uses as its `Model`.
 * @throws If the key is not one of the variants `AddValidVariants` enumerates.
 */
export const GetGlassModelVariant =
    (variant: VariantKeyOrImmutable<Variant>) => ThrowIfNull(ValidVariantMap.get(VariantKeyToImmutable<Variant>(variant)))

/**
 * The model for the `Mask Mount` restraint: one metal rim on the `MaskOver`
 * layer, wearing the base-metal faction colour at a fixed priority.
 *
 * It is the family's only model that is not keyed by a variant — the mount is a
 * single restraint rather than a set — and it is exported so `Item.ts` can name
 * it. Invariant and `NoOverride` mean the rim neither changes with the pose nor
 * takes part in overriding the layers under it.
 */
export const MaskMountModel = AddModelWithTextThenGetName({
    ...ModelTemplate,
    Name: 'A76D546D-D8D9-40AD-86A7-C7C69B396DD4',
    Folder: "Visors",
    Layers: ToLayerMap([
		{ Name: "DollmakerFullRim",
            Layer: "MaskOver",
            Pri: 50.1,
			InheritColor: InheritColor.BaseMetal,
			Invariant: true,
			NoOverride: true
		},
	])
} satisfies Model)

