import { GetVariantIdFromBase, GetVariantNameFromBase, JSReceiver } from "./Common"
import { VariantMapBuilder } from "./VariantMapBuilder"
import { Map as IMMap } from 'immutable'

export interface ITextInfoBase {
    DisplayName?: string
}

export class NamedVariantMapBuilder<VariantKey, TextInfo extends ITextInfoBase, WorkingType extends Object, ArchType extends Object = WorkingType>
    extends VariantMapBuilder<VariantKey, WorkingType, ArchType> {

    #GetVariantId: (variantKey: VariantKey) => string
    protected get _GetVariantId() { return this.#GetVariantId }

    #GetVariantName: ((variantKey: VariantKey) => string) | null

    #textInfoMap: IMMap<VariantKey, TextInfo>
    protected get _TextInfoMap() { return this.#textInfoMap }

    constructor(args: {
        baseId: string,
        baseName?: string,
        receiver?: JSReceiver
    }) {
        const {
            baseId,
            baseName,
            receiver
        } = args
        super(receiver)
        this.#GetVariantId = GetVariantIdFromBase(baseId)
        this.#GetVariantName = null == baseName ? null : GetVariantNameFromBase(baseName)
        this.#textInfoMap = IMMap()
    }

    public AddText(variantKey: VariantKey, text: TextInfo) {
        this.#textInfoMap = this.#textInfoMap.set(variantKey, text)
    }

    protected _GetTextInfo(variantKey: VariantKey) {
        const getVariantName = this.#GetVariantName
        return {
            ... getVariantName && {
                TextInfo: {
                    DisplayName: getVariantName(variantKey),
                }
            },
            ... this._TextInfoMap.has(variantKey) && {
                TextInfo: this._TextInfoMap.get(variantKey)
            }
        }
    }
}