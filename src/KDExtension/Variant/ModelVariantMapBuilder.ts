import { FromJS, fromJS, isKeyed, Map, Set } from 'immutable'
import { AddModelWithTextThenGetName, ModelText } from '../Model'
import { JSReceiver, VariantKeyOrImmutable, IsComplete, GetVariantNameFromBase, VariantPart, VariantKeyToImmutable } from './Common'
import { VariantMap, VariantMapBuilder } from './VariantMapBuilder'
import { ThrowIfNull } from '../../Utilities'

/**
 * A {@link JSReceiver} that transforms Immutable.js collections during `fromJS` deserialization.
 * - If the key is `'Layers'`, converts the value to an Immutable `Set`.
 * - Otherwise, converts keyed collections to `Map` and indexed collections to `Set`.
 */
export const ModelReceiver: JSReceiver =
    (key, value, _path) =>
        key === 'Layers' ?
            value.valueSeq().toSet()
            : isKeyed(value) ? value.toMap() : value.toSet()

/**
 * A variant of the game {@link Model} type where the `Layers` property is represented
 * as a plain array of {@link ModelLayer} instead of its original immutable form.
 * Used as an intermediate representation during model variant construction.
 */
export type ModelWithLayerSet =
    Omit<Model, 'Layers'> & {
        Layers: ModelLayer[]
    }

/**
 * Represents a complete model variant, pairing a game {@link Model} with its
 * associated {@link ModelText} metadata (display name, description, etc.).
 */
export interface ModelVariant {
    /** The fully constructed game model. */
    Model: Model,
    /** Text metadata for the model (name, description, and other localizable strings). */
    TextInfo: ModelText
}

/**
 * A mapping from a variant key to its corresponding {@link ModelVariant}.
 * Specializes the generic {@link VariantMap} for model-based variants.
 *
 * @typeParam VariantKey - The key type used to identify each variant.
 */
export type ModelVariantMap<VariantKey> = VariantMap<VariantKey, ModelVariant>

/**
 * Builds a {@link ModelVariantMap} by progressively accumulating model data and text metadata,
 * then finalizing each entry into a complete {@link ModelVariant}.
 *
 * Extends the generic {@link VariantMapBuilder} to handle model-specific concerns such as
 * layer conversion and text attachment.
 *
 * @typeParam VariantKey - The key type used to identify each variant.
 */
export class ModelVariantMapBuilder<VariantKey> extends VariantMapBuilder<VariantKey, ModelWithLayerSet, ModelVariant> {
    #GetVariantName: (variantKey: VariantKeyOrImmutable<VariantKey>) => string
    protected get _GetVariantName() { return this.#GetVariantName }

    #textInfoMap: Map<FromJS<VariantKey>, ModelText>
    protected get _TextInfoMap() { return this.#textInfoMap }

    /**
     * Creates a new {@link ModelVariantMapBuilder}.
     *
     * @param args - Configuration object.
     * @param args.baseName - The base name used to derive variant display names.
     * @param args.receiver - Optional {@link JSReceiver} for Immutable.js deserialization; defaults to {@link ModelReceiver}.
     * @param args.isItemComplete - Optional predicate to determine whether a model variant is fully constructed; defaults to {@link ModelVariantMapBuilder.IsItemComplete}.
     */
    constructor(args: {
        baseName: string,
        receiver?: JSReceiver,
        isItemComplete?: IsComplete<ModelVariant>,
    }) {
        const args2 = {
            receiver: args.receiver ?? ModelReceiver,
            isItemComplete: args.isItemComplete ?? (maybeModelVariant => ModelVariantMapBuilder.IsItemComplete(maybeModelVariant?.Model)) as IsComplete<ModelVariant>
        }
        super(args2)
        this.#GetVariantName = GetVariantNameFromBase(args.baseName)
        this.#textInfoMap = Map()
    }

    /**
     * Associates text metadata with the given variant key.
     * This text will be attached to the finalized {@link ModelVariant} during post-processing.
     *
     * @param variantKey - The variant key to associate the text with.
     * @param text - The {@link ModelText} metadata (name, description, etc.).
     */
    public AddText(variantKey: VariantKeyOrImmutable<VariantKey>, text: ModelText) {
        this.#textInfoMap = this.#textInfoMap.set(VariantKeyToImmutable(variantKey), text)
    }

    /**
     * Finalizes a working model variant by:
     * 1. Converting the `Layers` {@link Set} into a keyed {@link Map} (keyed by layer name).
     * 2. Assigning the derived variant display name.
     * 3. Attaching any previously registered {@link ModelText} via {@link AddText}.
     *
     * @param variantKey - The immutable form of the variant key being finalized.
     * @param workingItem - The partially accumulated model data.
     * @returns The complete {@link ModelVariant} as an Immutable.js structure.
     */
    protected override _PostProcess(variantKey: FromJS<VariantKey>, workingItem: FromJS<VariantPart<ModelWithLayerSet>>): FromJS<ModelVariant> {
        const completeItem = workingItem.update(
            'Layers',
            (ls) =>
                Map(
                    (ls as Set<FromJS<ModelLayer>>)
                        .map(ls => {
                            const name = ls.get('Name')
                            return [name, ls]
                        })
                )
        )
            .set('Name', this.#GetVariantName(variantKey))
        return fromJS({
            Model: completeItem,
            ... this._TextInfoMap.has(variantKey) && { TextInfo: this._TextInfoMap.get(variantKey) }
        }) as FromJS<ModelVariant>
    }

    /**
     * Determines whether a partial model is sufficiently complete to be considered a valid {@link Model}.
     *
     * @param x - A partial model object or `undefined`.
     * @returns `true` if the partial model qualifies as a complete {@link Model}; `false` otherwise.
     * @remarks Currently returns `true` unconditionally (full type checking is a TODO).
     */
    protected static IsItemComplete(x: Partial<Model> | undefined): x is Model {
        //TODO: Implement type check
        return true
    }
}

/**
 * Registers every model variant from the given {@link ModelVariantMap} into the game engine.
 * Each variant's model and text are submitted via {@link AddModelWithTextThenGetName},
 * producing an Immutable map of variant keys to registered model names.
 *
 * @typeParam VariantKey - The key type identifying each variant.
 * @param variantMap - The complete model variant map to register.
 * @returns An object containing:
 *  - `ValidVariantMap`: An Immutable {@link Map} of variant keys to registered model names.
 *  - `GetVariant`: A lookup function that retrieves a registered model name by variant key, throwing if not found.
 */
export function AddModelVariantMapToGame<VariantKey>(variantMap: ModelVariantMap<VariantKey>) {
    const validVariantMap =
        variantMap.map(({ Model, TextInfo }) =>
            AddModelWithTextThenGetName(
                Model,
                TextInfo
            )
        )
    return {
        ValidVariantMap: validVariantMap,
        GetVariant:
            (variant: VariantKeyOrImmutable<VariantKey>) => ThrowIfNull(validVariantMap.get(VariantKeyToImmutable<VariantKey>(variant)))
    }
}