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
 *
 * `guid-uniqueness.test.ts` and `layering.test.ts` read `src/**` from disk rather than
 * importing it, so their placement here carries no ordering meaning; they are listed
 * with the other source-level gates.
 */

import './setup/install'

import './self-check.test'
import './guid-uniqueness.test'
import './layering.test'
import './release.test'
import './registration-manifest.test'
import './text-registry.test'
import './text-tree.test'
import './text-reference.test'
import './public-api.test'
import './variant-map.property.test'
import './coordinator-state.property.test'
import './save-round-trip.property.test'
import './save-version.test'
import './migration-refusal.test'
import './save-prompts.test'
import './prompt.test'
import './mitten-layers.test'
