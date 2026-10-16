/**
 * A fresh world for the suites that build a body and a dossier.
 *
 * ## Why this is not `InstallKDGlobals`
 *
 * `InstallKDGlobals` installs **everything**, which is what the first suite to import the mod needs and
 * what no later suite may do twice: the mod wraps `KinkyDungeonLoadGame` and
 * `KinkyDungeonGenerateSaveData` exactly once, at module evaluation, and it closes over `KDGameData`.
 * Reinstalling replaces both wrappers and hands out a new `KDGameData`, so every suite after the first
 * would be driving a loader with no gate on it and writing saves onto an object nothing reads — and the
 * symptom is not a failing assertion about a wrapper, it is a prompt nobody creates.
 *
 * ## What a fresh world resets, and what it keeps
 *
 * It resets the things a case actually seeds: the recorder (so the constraint registry starts with the
 * base game's own restraints rather than a template a previous case pushed), the body, the player tag
 * map, the variant registry and `KDGameData`. It **keeps the identity of `globals`**, so `KDGameData`
 * and the mod's wrappers stay the objects the module graph is already holding.
 *
 * Restraint **variants** go with it, because a variant is per-save state that a case writes when it
 * puts an item on a body; leaving one behind would let a later case resolve a template it never
 * registered.
 * @module test/harness/world
 */

import { BuildBaseRestraints } from '../fixtures/base-game'
import { GetRecorder, ResetRecorderWorld } from './recorder'

/**
 * Empties the body and starts the constraint registry from the base game's own restraints.
 *
 * @returns The recorder, so a case can continue from the same object.
 */
export const FreshWorld = () => {
    const recorder = GetRecorder()
    ResetRecorderWorld()
    recorder.globals.KinkyDungeonRestraints.push(...BuildBaseRestraints())
    return recorder
}
