export const AddTextKeyEx = (textKeyPrefix: string) => (baseKey: string, text: string) =>
    addTextKey(textKeyPrefix + baseKey, text)

export const AddVariantPrefix = AddTextKeyEx('KDVarPref')

export const AddVariantSuffix = AddTextKeyEx('KDVarSuff')