/**
 * The arousal-system items: chastity belts and bras, and the toys. Both halves are restraint families
 * over items whose effects are arousal-system effects — a chastity lock, an edging vibe, a denial plug
 * — which is why they are grouped here rather than by body slot as the rest of `Futuristic` is.
 *
 * Each half is a namespace rather than a flat re-export because a caller names a **kind** to ask for a
 * restraint: `Futuristic.Aroused.Chastity.GetChastity(…)`. The kind unions are exported flat beside
 * them, so `Chastity.ChastityKind` and `Chastity.GetChastity` sit at the same level.
 * @module FactionMachine/Futuristic/Aroused
 */

/** The drone belts and bras, each in a slim and a bulky cut. */
export * as Chastity from './Chastity'
/** The lockable vibe and the two denial plugs, front and rear. */
export * as Toys from './Toys'
