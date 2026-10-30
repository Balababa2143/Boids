/**
 * The models the collar and cuff items render with: each one a copy of a base-game model under a
 * name derived from this family's variant key, with its lock layers marked.
 *
 * The copies are registered as a side effect of importing this module; `Cuff/Item` names them from
 * the exported map.
 *
 * A variant key is a persisted identity: every registered name here is
 * `uuidv5(JSON.stringify({Name: key}), baseId)`, so renaming a key renames a saved item.
 * @module FactionMachine/Futuristic/Cuff/Model
 */

import { fromJS, Map as IMMap } from 'immutable'
import { AddModelVariantMapToGame, IMVariantPart, ModelVariantMapBuilder, ModelWithLayerSet, VariantPart } from '../../../KDExtension'
import { DerivedVariantBase } from '../../../KDExtension/Release'
import { ThrowIfNull } from '../../../Utilities'
import { CuffKind, CuffKinds, CuffModelSource } from './Common'

/**
 * The colour banks the copied models' layers inherit from, named once so `Cuff/Item` can key its
 * `factionFilters` by them. A model layer's `InheritColor` names one of these.
 */
export const InheritColor = {
    BaseMetal: 'BaseMetal',
    Display: 'Display',
    Screen: 'Screen',
    Lock: 'Lock',
} as const

/**
 * The template every copied model starts from.
 *
 * `Folder` and `Categories` are filled by each variant — a collar draws from the collar artwork and
 * a belt from the belt artwork — so neither has a family-wide answer.
 */
const ModelTemplate = {
    Folder: '',
    Categories: [] as string[],
} satisfies Partial<ModelWithLayerSet>

/**
 * The builder for the family, whose only work beyond the base class is the copy.
 *
 * The source model is read out of `CuffModelSource` by the variant key rather than carried in a
 * part, so the table is the single statement of which copy is which.
 *
 * The cast is to the base class's own declared return type: the working draft is wider than
 * `FromJS<Partial<ModelVariant>>`, so the two are not assignable. `Futuristic/GlassVisor/Item.ts`
 * casts the same way for the same reason.
 */
class CuffModelMapBuilder extends ModelVariantMapBuilder<CuffKind> {
    protected override _DoFinalizeWorkingDraft(
        workingItem: IMVariantPart<ModelWithLayerSet>,
        variantKey: CuffKind
    ) {
        const source = ThrowIfNull(
            ModelDefs[CuffModelSource[variantKey].Source],
            `Boids: the base-game model '${CuffModelSource[variantKey].Source}' is not loaded.`
        )

        const copied = workingItem
            .set('Folder', source.Folder)
            .set('Categories', fromJS(source.Categories))
            .set('Layers', fromJS(
                Object.values(source.Layers).map(layer => ({
                    ...layer,
                    LockLayer: layer.Name.includes('Lock'),
                }))
            ))
            .set('Name', this._GetVariantId(variantKey))

        return super._DoFinalizeWorkingDraft(copied, variantKey) as ReturnType<
            ModelVariantMapBuilder<CuffKind>['_DoFinalizeWorkingDraft']
        >
    }
}

const builder = new CuffModelMapBuilder({ baseId: DerivedVariantBase.CuffModel })

for (const kind of CuffKinds) {
    builder.AddVariantPart(kind, {} satisfies VariantPart<ModelWithLayerSet>)
}

/**
 * Every copied model, registered under its derived name.
 *
 * `AddModelVariantMapToGame` registers at module evaluation; the map it returns is the lookup
 * `Cuff/Item` needs so a restraint can name the model registered for its own kind.
 */
export const CuffModelNames: IMMap<CuffKind, string> =
    AddModelVariantMapToGame(builder.BuildVariantMap(ModelTemplate))
