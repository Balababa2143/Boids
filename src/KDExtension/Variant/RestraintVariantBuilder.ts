import { FromJS, fromJS, isKeyed, Map as IMMap } from 'immutable'
import { AddRestraintWithTextThenGetName, RestraintText } from '../Restraint'
import { JSReceiver, GetVariantIdFromBase, IMVariantPart } from './Common'
import { ArraySemantics, RestraintArraySemantics } from './Semantics'
import { VariantMap, VariantMapBuilder } from './VariantMapBuilder'
import { NamedVariantMapBuilder } from './NamedVariantMapBuilder'

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
    TextInfo: RestraintText
}

export type RestraintVariantMap<VariantKey> = VariantMap<VariantKey, RestraintVariant>

export class RestraintVariantMapBuilder<VariantKey> 
    extends NamedVariantMapBuilder<VariantKey, RestraintText, restraint, RestraintVariant> {

    constructor(args: {
        baseId: string,
        baseName?: string,
        receiver?: JSReceiver,
    }) {
        args.receiver = args.receiver ?? RestraintReceiver
        super(args)
    }

    protected override _DoFinalizeWorkingDraft(workingItem: IMVariantPart<restraint>, variantKey: VariantKey) : FromJS<Partial<RestraintVariant>> {
        const completeItem: IMVariantPart<restraint> =
            workingItem
                .set('name', this._GetVariantId(variantKey))
        return fromJS({
            Restraint: completeItem,
            ... this._GetTextInfo(variantKey)
        })
    }
}

export function AddRestraintVariantMapToGame<VariantKey>(variantMap: RestraintVariantMap<VariantKey>) {
    const validVariantMap =
        variantMap.map(({ Restraint, TextInfo }) =>
            AddRestraintWithTextThenGetName(
                Restraint,
                TextInfo
            )
        )
    return validVariantMap
}