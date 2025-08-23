import { AddEventHandler } from '../KDInterface/KDExtension'

interface CharacterProfile {
    // CharacterAppearanceStringify & CharacterAppearanceRestore
    readonly Appearance: string
    // TODO: Backup and restore name, inventory, perks, skills, etc.
}

interface CharacterEntry {
    readonly ID: string
    readonly Profile: CharacterProfile
    // readonly ItemRegistry: ItemRegistry
}

type CharacterRegistry = {
    readonly [key: string]: CharacterEntry
}

const enum EventTriggers {

    TargetGagStrengthUpdate = '533BAA85-7C2B-45E5-9B0F-3C2BF005C734'
}

export const CharacterRegistryGameDataKey = 'D28D8AAB-DFE8-485E-A37A-9C70595AC307' as const

declare global {
    interface KDGameDataBase {
        [CharacterRegistryGameDataKey]: CharacterRegistry
    }
}

const GetCharacterRegistry = () => KDGameData[CharacterRegistryGameDataKey]
export const InitCharacterRegistry = () => {
    console.info(`Boids: setting afterLoadGame, KDGameData[${CharacterRegistryGameDataKey}]`)
    KDGameData[CharacterRegistryGameDataKey] = Object.freeze({})
}

// AddEventHandler({
//     eventMap: KDEventMapGeneric,
//     trigger: 'tick',
//     type: 'C0457AD2-9838-4E08-9903-4B685B48648C',
//     handler(e, data) {

//     },
// })

// AddEventHandler({
//     eventMap: KDEventMapGeneric,
//     trigger: 'afterNewGame',
//     type: '04E6C275-6E5C-4D55-B5E0-E912319655F6',
//     handler(e, data) {
//         if (null == KDGameData[CharacterRegistryGameDataKey]) {
//             InitCharacterRegistry()
//         }
//         else {
//             throw new Error(`KDGameData[${CharacterRegistryGameDataKey}] is set on new game!`)
//         }
//     },
// })

// AddEventHandler({
//     eventMap: KDEventMapGeneric,
//     trigger: 'afterLoadGame',
//     type: '8388125D-D6B4-427A-BDD2-7F4B62100DCD',
//     handler(e, data) {
//         if (null == KDGameData[CharacterRegistryGameDataKey]) {
//             InitCharacterRegistry()
//         }
//         else {
//             console.info(`Boids: afterLoadGame, KDGameData[${CharacterRegistryGameDataKey}] is set.`)
//         }
//     },
// })