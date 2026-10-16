/**
 * The models the collar and cuff items render with: each one a copy of a base-game model under a name
 * derived from this family's variant key, differing only in that its lock layers are marked as such.
 * The models are registered as a side effect of importing this module, and `Cuff/Item` uses the names
 * it exports.
 *
 * ## Why a variant map rather than eight literals
 *
 * The eight copies differ in one thing — which base-game model they are a copy of — and every other
 * part of them is the same transformation. Written as literals, that transformation was repeated
 * eight times beside eight hand-written GUIDs; written as a map, the transformation is
 * `_DoFinalizeWorkingDraft` and each variant declares only its source.
 *
 * **A variant key is a persisted identity.** Every registered name here is
 * `uuidv5(JSON.stringify({Name: key}), baseId)`, so renaming a key renames a saved item. See
 * `docs/guide/invariants.md`.
 * @module FactionMachine/Futuristic/Cuff/Model
 */

import { fromJS, Map as IMMap } from 'immutable'
import { AddModelVariantMapToGame, IMVariantPart, ModelVariantMapBuilder, ModelWithLayerSet, VariantPart } from '../../../KDExtension'
import { DerivedVariantBase } from '../../../KDExtension/Release'
import { ThrowIfNull } from '../../../Utilities'
import { CuffKind, CuffKinds, CuffModelSource } from './Common'

/**
 * The colour banks the copied models' layers inherit from, named once so `Cuff/Item` can key its
 * `factionFilters` by them instead of repeating string literals. A bank is what `InheritColor` on a
 * model layer points at, so these are the keys through which a faction can recolour a whole group of
 * layers at once.
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
 * `Folder` and `Categories` are filled by each variant — a collar draws from the collar artwork and a
 * belt from the belt artwork — so neither has a family-wide answer.
 */
const ModelTemplate = {
    Folder: '',
    Categories: [] as string[],
} satisfies Partial<ModelWithLayerSet>

/**
 * The builder for the family, whose only work beyond the base class is the copy itself.
 *
 * The source model is read out of `CuffModelSource` by the **variant key** rather than carried in a
 * part, so the table is the single statement of which copy is which and a part cannot disagree with
 * it. `LockLayer` is what makes the copy worth making: the base-game models do not mark their own
 * lock layers, and the game draws the lock icon from that flag.
 *
 * ## The one cast, and why it is the base class's
 *
 * `ModelVariantMapBuilder._DoFinalizeWorkingDraft` is declared to return
 * `FromJS<Partial<ModelVariant>>`, while the working type is `ModelWithLayerSet` — and
 * `FromJS<Partial<ModelWithLayerSet>>` is `Map<keyof ModelWithLayerSet, …>` against
 * `Map<'Model' | 'TextInfo', …>`, so the two are not assignable even though the value the base class
 * actually consumes is the working draft. The cast is therefore to the *base class's* declared return
 * type, not to a shape of this file's invention; the same one appears in
 * `Futuristic/GlassVisor/Item.ts`, which subclasses the same base for the same reason.
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
 * `AddModelVariantMapToGame` is what registers them, and it is called at module evaluation: the
 * registration is the point, and the map it returns is the lookup `Cuff/Item` needs so a restraint
 * can name the model registered for its own kind.
 */
export const CuffModelNames: IMMap<CuffKind, string> =
    AddModelVariantMapToGame(builder.BuildVariantMap(ModelTemplate))
