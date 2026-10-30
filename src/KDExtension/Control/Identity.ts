/**
 * Mints stable dimension identifiers from readable names.
 * @module KDExtension/Control/Identity
 */

import { v5 as uuidv5 } from 'uuid'
import { Release } from '../Release'

/** A dimension's identifier: a UUID derived from its readable name under the current root. */
export type DimensionId = string

/**
 * The namespace every dimension id is derived under: the same root the variant bases and the save's
 * `root_uuid` use.
 */
export const ModRootNamespace = (): string => Release.Root

/**
 * The prefix every dimension's readable name carries.
 *
 * A dimension's id is a key in the dossier's `intent` and `config` maps, so changing this string
 * renames a saved key: a save migration, not an edit.
 */
export const MachinePrimeDimensionPrefix = 'Boids.MachinePrime.Dimension.'

/**
 * Mints a dimension id from its readable name, deterministically.
 *
 * `uuidv5` takes the value first and the namespace second, and the namespace has to parse as a
 * UUID; swapping the arguments throws and would rename every id.
 *
 * @param name - The dimension's readable name, e.g. `Sight`. Never a `uuid`: an already-derived
 *   value would be derived a second time into a different identifier.
 * @returns The derived id.
 */
export const DimensionId = (name: string): DimensionId =>
    uuidv5(`${MachinePrimeDimensionPrefix}${name}`, ModRootNamespace())
