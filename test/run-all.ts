/**
 * Test entry point: installs the KD globals, then imports every suite.
 * `./setup/install` must come first, and every `*.test.ts` must be listed here.
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
import './public-api-surface.test'
import './variant-map.property.test'
import './coordinator-state.property.test'
import './control-descriptor.test'
import './control-router.test'
import './control-pose.test'
import './control-facade.test'
import './control-baseline.property.test'
import './debug-driver.test'
import './restraint-contract.test'
import './save-round-trip.property.test'
import './save-version.test'
import './migration-refusal.test'
import './save-prompts.test'
import './prompt.test'
import './mitten-layers.test'
