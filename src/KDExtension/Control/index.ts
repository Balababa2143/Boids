/**
 * The control model's mechanism layer: the facets a dimension composes, the descriptor registry
 * that says which dimensions exist and what tools they use, the persisted shape, its write
 * rules, and the router that resolves a dimension against what is worn.
 *
 * ## Why this is in `KDExtension` and the dimensions are not
 *
 * A **dimension is content** — `MachinePrime` needs `Sight` and `Struggle`, and a second
 * faction would need different ones. The **mechanism is not**: facets, descriptors, the store
 * and the bidding rule are the same whatever the dimensions are called.
 *
 * The layering arrow (`Utilities < KDInterface < KDExtension < Common < FactionMachine`) is what
 * enforces that split rather than a convention. A mechanism that lived in `FactionMachine` could
 * not be used by a sibling faction without importing it, and one that lived in `Common` would
 * still be the wrong layer for something this general. Here, a new faction adds a catalogue and
 * changes nothing in this folder.
 *
 * ## What is deliberately absent
 *
 * Nothing here reads the game. The router takes bids as an argument rather than enumerating
 * worn items, so the whole folder is a pure function of its inputs — which is what makes the
 * property suite able to cover it, and what makes "adding a dimension is adding one record" a
 * claim that can be tested rather than asserted.
 *
 * `design/spec.md` §6.1–6.7 is the specification; §6.12 is the contract a restraint meets to
 * take part.
 * @module KDExtension/Control
 */

export * from './Facet'
export * from './Pose'
export * from './BodyState'
export * from './Identity'
export * from './Capability'
export * from './Descriptor'
export * from './Store'
export * from './Router'
export * from './Validator'
