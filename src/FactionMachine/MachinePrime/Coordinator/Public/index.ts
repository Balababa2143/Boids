/**
 * The item-facing half of the coordinator: what an item may use to take part in the control
 * model.
 *
 * ## Two things an item does, and neither is registration
 *
 * An item **declares itself mine** by carrying the controlled tag in its template's `shrine`
 * list — that is code, written once per family, and it is the whole membership test
 * (`design/spec.md` §6.12, clause 1).
 *
 * An item then **declares what it moves**: a list of `ProviderDeclaration`s written onto its own
 * `item.data` when the game applies it, through the shared `SetItemDataOnApply` event builder in
 * `Common/CommonEvent`. That is §6.7's first rule, and it reuses the stamped-event pattern items
 * already use rather than inventing a second mechanism.
 *
 * ## What is gone, and why nothing replaced it
 *
 * The two builders that used to live here — `RegisterItemOnApply` and `UnRegisterItemOnRemoval` —
 * maintained a set of names in the dossier. That set is not in the dossier any more: the
 * participants are a property of **what is worn**, read from the game's own inventory when a
 * dimension is resolved. An item does not register, and therefore does not have to unregister.
 *
 * Nothing here calls into the controller. The controller is a **subscriber, never a callee**
 * (§6.12, clause 5), which is what keeps an item's own definition free of control logic.
 * @module FactionMachine/MachinePrime/Coordinator/Public
 */

/** The dossier, the two writes with their validators, and the resolution. */
export * from './Control'

/** Choosing which provider to wear, drivable from the console. */
export * from './Selection'
