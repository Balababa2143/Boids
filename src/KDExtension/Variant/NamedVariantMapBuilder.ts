import { GetVariantIdFromBase, GetVariantNameFromBase, JSReceiver } from "./Common"
import { VariantMapBuilder } from "./VariantMapBuilder"
import { Map as IMMap } from 'immutable'

export interface ITextInfoBase {
    DisplayName?: string
}

/**
 * A variant map whose entries carry text.
 *
 * ## Three layers, merged rather than replaced
 *
 * A variant's text resolves as **the generated name, then the family's `baseText`, then the
 * variant's own {@link AddText}**, with each layer winning field by field.
 *
 * A family authors its shared text once because a family is exactly the case where one
 * sentence belongs to many registered variants: the arm links are five restraints sharing one
 * display name, and before this each of the five spelled it out. A variant then declares only
 * what differs — which is the "heavy reuse with selective override" that this mod's morphable
 * items are built on, where one family is forty restraints.
 *
 * The generated name sits **beneath** the family's. It is a description derived from a variant
 * key, useful as a placeholder and never as a name a reader should see, so an authored name
 * must not lose to it.
 *
 * @typeParam TextInfo - The text a variant carries; a family supplies a partial one.
 */
export class NamedVariantMapBuilder<VariantKey, TextInfo extends ITextInfoBase, WorkingType extends Object, ArchType extends Object = WorkingType>
    extends VariantMapBuilder<VariantKey, WorkingType, ArchType> {

    #GetVariantId: (variantKey: VariantKey) => string
    protected get _GetVariantId() { return this.#GetVariantId }

    #GetVariantName: ((variantKey: VariantKey) => string) | null

    #baseText: Partial<TextInfo>
    /** The text every variant of this family starts from. */
    protected get _BaseText() { return this.#baseText }

    #textInfoMap: IMMap<VariantKey, TextInfo>
    protected get _TextInfoMap() { return this.#textInfoMap }

    constructor(args: {
        baseId: string,
        baseName?: string,
        /** The family's shared text; a variant overrides it field by field. */
        baseText?: Partial<TextInfo>,
        receiver?: JSReceiver
    }) {
        const {
            baseId,
            baseName,
            baseText,
            receiver
        } = args
        super(receiver)
        this.#GetVariantId = GetVariantIdFromBase(baseId)
        this.#GetVariantName = null == baseName ? null : GetVariantNameFromBase(baseName)
        this.#baseText = baseText ?? {}
        this.#textInfoMap = IMMap()
    }

    public AddText(variantKey: VariantKey, text: TextInfo) {
        this.#textInfoMap = this.#textInfoMap.set(variantKey, text)
    }

    /**
     * One variant's text: the generated name under the family's text under the variant's own.
     *
     * The cast is the merge's own: a layer may supply only some fields, so the result is
     * complete only if the layers between them cover everything the type requires — which is
     * the family's responsibility, and was already true of the generated name it replaces.
     */
    protected _GetTextInfo(variantKey: VariantKey): { TextInfo?: TextInfo } {
        const getVariantName = this.#GetVariantName
        const generated = getVariantName == null ? {} : { DisplayName: getVariantName(variantKey) }
        const text = {
            ...generated,
            ...this.#baseText,
            ...this._TextInfoMap.get(variantKey),
        } as TextInfo
        return Object.keys(text).length > 0 ? { TextInfo: text } : {}
    }
}
