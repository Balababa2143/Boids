/**
 * The three lock/unlock sound pairs this mod's items use, spread into a restraint
 * literal rather than repeated: `sfx` plays when the item is locked on, `sfxRemove`
 * when it comes off.
 * @module FactionMachine/Futuristic/Common/SFX
 */

/** Mechanical bolts. Used by the cuffs, face covers, headphones, boots and mittens. */
export const MechanicalLockSfx = {
    sfx: 'Mechlock',
    sfxRemove: 'MechUnlock'
} satisfies Partial<restraint>

/** A pump inflating and venting. Used by the plugs; the gag morph handler borrows both keys. */
export const InflateLockSfx = {
    sfx: 'MechPumpUp',
    sfxRemove: 'MechPumpRelease'
} satisfies Partial<restraint>

/** The sci-fi lock-up, with a mechanical release. Used by the chastity belts and the harness. */
export const ElectricMechLockSfx = {
    sfx: 'FutureLock',
    sfxRemove: 'MechUnlock'
} satisfies Partial<restraint>