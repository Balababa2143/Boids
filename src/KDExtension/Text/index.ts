/**
 * The text adapter: where a text value comes from, how it is addressed, and where it is written.
 *
 * The boundary rule: if the engine resolves the key, it is composed and lives in `default`; if the
 * mod resolves it, it is addressed by a tree path and lives in the mod's own group. A string the
 * engine merely displays from a value the mod resolved belongs to the mod's group.
 * @module KDExtension/Text
 */

export * from './Data'
export * from './Sink'
export * from './Slot'
export * from './Spec'
export * from './Tree'
