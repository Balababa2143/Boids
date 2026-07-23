import { GetVariantIdFromBase, GetVariantNameFromBase, IMVariantPart, JSReceiver } from "./Common"
import { VariantMapBuilder } from "./VariantMapBuilder"
import { fromJS, FromJS, Map as IMMap, Set as IMSet } from 'immutable'

export interface ITextInfoBase {
    DisplayName?: string
}

export class NamedVariantMapBuilder<VariantKey, TextInfo extends ITextInfoBase, WorkingType extends Object, ArchType extends Object = WorkingType>
    extends VariantMapBuilder<VariantKey, WorkingType, ArchType> {

    #GetVariantId: (variantKey: VariantKey) => string
    protected get _GetVariantId() { return this.#GetVariantId }

    #GetVariantName: ((variantKey: VariantKey) => string) | null
    protected get _GetVariantName() { return this.#GetVariantId }

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
        return {
            ... this.#GetVariantName && {
                TextInfo: {
                    DisplayName: this._GetVariantName(variantKey),
                }
            },
            ... this._TextInfoMap.has(variantKey) && {
                TextInfo: this._TextInfoMap.get(variantKey)
            }
        }
    }
}