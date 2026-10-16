/**
 * How a `DimensionId` is minted, and why it is minted rather than picked.
 *
 * ## The construction
 *
 * ```ts
 * uuidv5(identifierName, ModRootNamespace)
 * //      └─ the namespaced name is the VALUE ─┘  └─ the mod root is the NAMESPACE ─┘
 * ```
 *
 * The **name is the value** and the **root is the namespace**, and the argument order is the
 * trap: `uuid`'s signature is `v5(value, namespace)`, the namespace has to parse as a UUID, and
 * `node_modules/uuid/dist/v35.js` calls `parse()`, which throws `TypeError('Invalid UUID')` for
 * anything else. Swapping the two arguments is the single easiest way to break every
 * identifier in the mod, and `src/KDExtension/Variant/Common.ts` is the working call this
 * mirrors.
 *
 * ## Why the root comes from `KDExtension/Release.ts` rather than lying here
 *
 * The root is the **version carrier** — the only place version information lives, and a bump
 * renames every identifier the mod derives. There is one such value, it belongs to the release,
 * and a second copy of the recipe would be a second answer to the same question. The access is
 * a function call rather than an import of the literal, so this module never has to know when
 * the root changes.
 *
 * ## What this module does not do
 *
 * It does not register anything, and it does not decide which dimensions exist. The catalogue
 * lives with the faction that needs it (`FactionMachine/MachinePrime/Coordinator/Catalog`), so
 * a second faction adds dimensions without touching this file.
 * @module KDExtension/Control/Identity
 */

import { v5 as uuidv5 } from 'uuid'
import { Release } from '../Release'

/**
 * A dimension's identifier: a UUID derived from its readable name under the current root.
 *
 * The type is `string` rather than a branded primitive on purpose. Branding would make a
 * catalogue's literal array — `{ Id: DimensionId('Sight'), … }` — a wall of casts at the one
 * place a reader most needs to see plain data, and it would buy nothing: the ids are only ever
 * *produced* here and *consumed* by the registry, so the registry's parameter type is what
 * actually keeps a stray string out.
 */
export type DimensionId = string

/**
 * The namespace every dimension id is derived under.
 *
 * Read from the release rather than redeclared: it is the same root the variant bases and the
 * save's `root_uuid` use, so there is exactly one value to bump and exactly one to reason about.
 */
export const ModRootNamespace = (): string => Release.Root

/**
 * The prefix every dimension's readable name carries.
 *
 * ### This string is a persisted-format decision
 *
 * A dimension's id ends up as a key in the dossier's `intent` and `config` maps, so **changing
 * a name here renames a saved key**: an existing save's intent for `Sight` would no longer be
 * found, and the dimension would silently read `Free`. That is a save migration, exactly as
 * moving a variant-key field is, and the migration chain (§4.4) is what carries it rather than
 * a quiet edit here.
 */
export const MachinePrimeDimensionPrefix = 'Boids.MachinePrime.Dimension.'

/**
 * Mints a dimension id from its readable name.
 *
 * Deterministic and pure: the same name always yields the same value, which is what makes the
 * name the stable half and the id a derived, recomputable consequence of it.
 *
 * @param name - The dimension's readable name, e.g. `Sight`. Never a `uuid`: an already-derived
 *   value would be derived a second time into a different identifier.
 * @returns The derived id.
 */
export const DimensionId = (name: string): DimensionId =>
    uuidv5(`${MachinePrimeDimensionPrefix}${name}`, ModRootNamespace())
