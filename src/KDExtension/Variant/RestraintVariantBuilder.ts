import { FromJS, fromJS, isKeyed, Map } from 'immutable'
import { IRestraintText } from '../Restraint'
import { JSReceiver, VariantKeyOrImmutable, IsComplete, GetVariantNameFromBase, VariantKeyToImmutable, VariantPart } from './Common'
import { ModelReceiver } from './ModelVariantMapBuilder'
import { ArraySemantics, RestraintArraySemantics } from './Semantics'
import { VariantMapBuilder } from './VariantMapBuilder'

export const RestraintReceiver: JSReceiver =
    (key, value, _path) => {
        if (isKeyed(value)) {
            return value.toMap()
        }
        else {
            const semantic: ArraySemantics | undefined = RestraintArraySemantics[key]
            if (null != semantic && semantic) { // true = Set
                return value.toSet()
            }
            else {
                return value.toList()
            }
        }
    }

export interface RestraintVariant {
    Restraint: restraint,
    TextInfo: IRestraintText
}

export class RestraintVariantMapBuilder<VariantKey> extends VariantMapBuilder<VariantKey, restraint, RestraintVariant>
{
    #GetVariantName: (variantKey: VariantKeyOrImmutable<VariantKey>) => string
    protected get _GetVariantName() { return this.#GetVariantName}

    #textInfoMap: Map<FromJS<VariantKey>, IRestraintText>
    protected get _TextInfoMap() { return this.#textInfoMap }

    constructor(args: {
        baseName: string,
        receiver?: JSReceiver,
        isItemComplete?: IsComplete<RestraintVariant>,
    }) {
        const args2 = {
            receiver: args.receiver ?? ModelReceiver,
            isItemComplete: args.isItemComplete ?? (maybeComplete => RestraintVariantMapBuilder.IsItemComplete(maybeComplete?.Restraint)) as IsComplete<RestraintVariant>
        }
        super(args2)
        this.#GetVariantName = GetVariantNameFromBase(args.baseName)
        this.#textInfoMap = Map()
    }

    public AddText(variantKey: VariantKeyOrImmutable<VariantKey>, text: IRestraintText)
    {
        this.#textInfoMap = this.#textInfoMap.set(VariantKeyToImmutable(variantKey), text)
    }

    protected override _PostProcess(variantKey: FromJS<VariantKey>, workingItem: FromJS<VariantPart<restraint>>): FromJS<RestraintVariant> {
        const completeItem = 
            workingItem
            .set('name', this.#GetVariantName(variantKey))
        return fromJS({
            Restraint: completeItem,
            ... this._TextInfoMap.has(variantKey) && {TextInfo: this._TextInfoMap.get(variantKey)}
        }) as FromJS<RestraintVariant>
    }

    protected static IsItemComplete(x: Partial<restraint> | undefined): x is restraint {
        //TODO: Implement type check
        return true
    }
}