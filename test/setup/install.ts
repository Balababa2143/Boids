/**
 * Installs the KD global stubs before any module is evaluated: the mod reads them at module scope.
 */

import { InstallKDGlobals } from '../harness/kd-globals'

InstallKDGlobals()
