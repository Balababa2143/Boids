import { GetVariantIdFromBase, GetVariantNameFromBase, JSReceiver } from "./Common"
import { VariantMapBuilder } from "./VariantMapBuilder"
import { Map as IMMap } from 'immutable'

export interface ITextInfoBase {
    DisplayName?: string
}

/**
 * A variant map whose entries carry text.
 *
 * A variant's text resolves as the generated name, then the family's `baseText`, then the variant's own
 * {@link AddText}, each layer winning field by field. The generated name sits beneath the family's, so
 * an authored name never loses to it.
 *
 * @typeParam TextInfo - The text a variant carries; a family supplies a partial one.
 */
export class NamedVariantMapBuilder<VariantKey, TextInfo extends ITextInfoBase, WorkingType extends Object, ArchType extends Object = WorkingType>
    extends VariantMapBuilder<VariantKey, WorkingType, ArchType> {

    #GetVariantId: (variantKey: VariantKey) => string
    protected get _GetVariantId() { return this.#GetVariantId }

    #GetVariantName: ((variantKey: VariantKey) => string) | null

    #baseText: Partial<TextInfo>
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
     * The cast is the merge's own: a layer may supply only some fields, so the result is complete
     * only if the layers between them cover everything the type requires.
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
