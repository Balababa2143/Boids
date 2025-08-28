export type KDEventMap =
    typeof KDEventMapAlt |
    typeof KDEventMapBuff |
    typeof KDEventMapBullet |
    typeof KDEventMapEnemy |
    typeof KDEventMapFacility |
    typeof KDEventMapGeneric |
    typeof KDEventMapInventory |
    typeof KDEventMapInventoryIcon |
    typeof KDEventMapInventorySelected |
    typeof KDEventMapOutfit |
    typeof KDEventMapSpell |
    typeof KDEventMapWeapon

export interface KinkyDungeonEventPostRemovalData {
    item: restraint | null
    Character: Character
    keep: boolean
    shrine: boolean
    add?: true
    Link?: true
    dynamic?: true
}