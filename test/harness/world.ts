/**
 * A fresh world for the suites that build a body and a dossier. It resets in
 * place rather than reinstalling, because `InstallKDGlobals` may run only once.
 *
 * @module test/harness/world
 */

import { BuildBaseRestraints } from '../fixtures/base-game'
import { GetRecorder, ResetRecorderWorld } from './recorder'

/** Empties the body and starts the constraint registry from the base game's own restraints. */
export const FreshWorld = () => {
    const recorder = GetRecorder()
    ResetRecorderWorld()
    recorder.globals.KinkyDungeonRestraints.push(...BuildBaseRestraints())
    return recorder
}
