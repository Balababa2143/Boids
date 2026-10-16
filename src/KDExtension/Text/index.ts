/**
 * The text adapter: where a text value comes from, how it is addressed, and where it is
 * written.
 *
 * The whole of the mod's text handling is these five modules, and they are worth reading in
 * dependency order:
 *
 * - {@link module:KDExtension/Text/Tree} — a layer of text data, the merge, and the
 *   specific-to-general lookup pass;
 * - {@link module:KDExtension/Text/Data} — the trees the scopes register, merged per
 *   language, and the language to read first;
 * - {@link module:KDExtension/Text/Sink} — the one place a key is written, the two groups,
 *   the pin, and the deferred engine pass;
 * - {@link module:KDExtension/Text/Slot} — the key shapes the engine composes, which no
 *   call site may spell itself;
 * - {@link module:KDExtension/Text/Spec} — the authoring shape and the precedence list that
 *   turns it into the values the engine reads.
 *
 * The invariant that ties them together is the boundary rule: **if the engine resolves the
 * key, it is composed and lives in `default`; if the mod resolves it, it is addressed by a
 * tree path and lives in the mod's own group.** A string the engine merely displays from a
 * value the mod resolved belongs to the mod's group.
 * @module KDExtension/Text
 */

export * from './Data'
export * from './Sink'
export * from './Slot'
export * from './Spec'
export * from './Tree'
