/**
 * The item-facing half of the coordinator: what an item may use to take part in the control model.
 * An item declares itself by carrying the controlled tag in its template's `shrine` list, and what
 * it moves by writing `ProviderDeclaration`s onto its own `item.data` through `SetItemDataOnApply`.
 * Nothing here calls into the controller, which is a subscriber and never a callee.
 * @module FactionMachine/MachinePrime/Coordinator/Public
 */

/** The dossier, the two writes with their validators, and the resolution. */
export * from './Control'

/** Choosing which provider to wear, drivable from the console. */
export * from './Selection'
