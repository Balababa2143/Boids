/**
 * Test entry point, bundled by `webpack.test.config.ts` and executed with
 * `node --test`.
 *
 * Order matters: `./setup/install` must be evaluated before any module that
 * touches the game's globals at import time, which is why the KD stubs are
 * installed through this side-effect import rather than from each test file.
 *
 * Every `test/**\/*.test.ts` file must be listed here; `self-check.test.ts`
 * enforces that so a new suite cannot be silently skipped.
 */

import './setup/install'

import './self-check.test'
import './registration-manifest.test'
import './public-api.test'
import './variant-map.property.test'
import './coordinator-state.property.test'
import './mitten-layers.test'
