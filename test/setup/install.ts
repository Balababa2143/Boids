/**
 * vitest `setupFiles` entry: installs the KD global stubs before any test file
 * (and therefore before any `src/**` module) is evaluated.
 *
 * Ordering matters: the mod reads `ModelDefs`, `KinkyDungeonRestraints`,
 * `TextProvider`, the tag collections and `LAYERS_BASE` at module scope, so the
 * globals must exist by the time the import graph starts running.
 */

import { InstallKDGlobals } from '../harness/kd-globals'

InstallKDGlobals()
