/**
 * The two decisions the save path puts to the player, as prompt specs.
 *
 * They live here rather than in `CommonUI/Prompt` because the renderer is deliberately
 * text-free, and rather than in `StateStorage` because the gate's job is to decide, not to
 * word. Everything this module owns is wording and action: which buttons, in what order,
 * and what each one means.
 *
 * Both prompts are about the same kind of judgement — *this save is not what this build
 * expects* — and they differ in what the player can still do about it. That difference is
 * the reason they are two prompts and not one with a substituted paragraph.
 *
 * ## Why this wording is mod-half text
 *
 * The engine draws these strings but never looks them up: the dialog is handed values that
 * are already resolved. So they are registered in the mod's own text group, addressed by a
 * path, and read back with {@link GetModText} — which is also what makes them translatable
 * without touching the shared group the engine reads our items from.
 *
 * @module FactionMachine/MachinePrime/Coordinator/Internal/SavePrompts
 */

import ModMetaData from '../../../../Utilities/ModMetadata'
import type { PromptSpec } from '../../../../Common/CommonUI/Prompt'
import type { RefusedOutcome } from '../../../../KDExtension/Release'
import { GetModText, RegisterModString } from '../../../../KDExtension'

/**
 * The prompt ids. Stable, because an id is what the renderer's reuse guard keys on: a
 * second request for the same kind of prompt is refused rather than stacked.
 */
const enum PromptId {
    UnversionedSave = 'unversioned-save',
    MigrationRefused = 'migration-refused',
}

/**
 * Where this module's wording lives in the text trees, and therefore what its keys are.
 *
 * `Common` rather than the faction because the subject is the mod's own release: `Release.ts`
 * already sits at mod level, and the load gate will be shared by a second faction. A
 * translator may override any of these at a shorter path and cover every entry beneath it.
 *
 * Exported so the suite can assert that every path it renders resolves, which is the property
 * a missing registration would break.
 */
export const TextPaths = {
    UnversionedTitle: ['Common', 'Session', 'Unversioned', 'Title'],
    UnversionedBody: ['Common', 'Session', 'Unversioned', 'Body'],
    UnversionedCause: ['Common', 'Session', 'Unversioned', 'Cause'],
    UnversionedConsequence: ['Common', 'Session', 'Unversioned', 'Consequence'],
    UnversionedCorruption: ['Common', 'Session', 'Unversioned', 'Corruption'],
    UnversionedLoadAnyway: ['Common', 'Session', 'Unversioned', 'LoadAnyway'],
    UnversionedCancel: ['Common', 'Session', 'Unversioned', 'Cancel'],

    RefusedTitle: ['Common', 'Session', 'Refused', 'Title'],
    RefusedBody: ['Common', 'Session', 'Refused', 'Body'],
    RefusedChange: ['Common', 'Session', 'Refused', 'Change'],
    RefusedConsequence: ['Common', 'Session', 'Refused', 'Consequence'],
    RefusedReturnToMenu: ['Common', 'Session', 'Refused', 'ReturnToMenu'],
    RefusedStay: ['Common', 'Session', 'Refused', 'Stay'],
} as const satisfies Record<string, readonly string[]>

/**
 * Registered here, beside the prompt that renders them, so a message's words and the decision
 * they describe cannot drift into different files.
 *
 * What used to be one multi-line value is two entries: a text entry is one line, and the
 * prompt already takes a list of paragraphs, so the line break belonged to the list rather
 * than to the string.
 */
RegisterModString({
    Path: TextPaths.UnversionedTitle,
    Local: `${ModMetaData.modname} | Compatibility Warning`,
    Slot: 'Dialog',
})
RegisterModString({
    Path: TextPaths.UnversionedBody,
    Local: `${ModMetaData.modname} cannot determine mod version in this save.`,
    Slot: 'Dialog',
})
RegisterModString({
    Path: TextPaths.UnversionedCause,
    Local: `This save might have been created either without ${ModMetaData.modname}or with an old version of it.`,
    Slot: 'Dialog',
})
RegisterModString({
    Path: TextPaths.UnversionedConsequence,
    Local: 'If you choose to load anyway, this mod would attempt initialization as if no version of it has been installed.',
    Slot: 'Dialog',
})
RegisterModString({
    Path: TextPaths.UnversionedCorruption,
    Local: 'Loading a save with incompatible mod version may break the game and permanently corrupt your save.',
    Slot: 'Dialog',
})
RegisterModString({ Path: TextPaths.UnversionedLoadAnyway, Local: 'Load anyway', Slot: 'Dialog' })
RegisterModString({ Path: TextPaths.UnversionedCancel, Local: 'Cancel', Slot: 'Dialog' })

RegisterModString({
    Path: TextPaths.RefusedTitle,
    Local: `${ModMetaData.modname} | Compatibility Warning`,
    Slot: 'Dialog',
})
RegisterModString({
    Path: TextPaths.RefusedBody,
    Local: `This save was written by a release of ${ModMetaData.modname} that this build cannot carry forward.`,
    Slot: 'Dialog',
})
RegisterModString({
    Path: TextPaths.RefusedChange,
    Local: 'The change it needs is a breaking one, so loading it would leave the game reading a shape it no longer understands.',
    Slot: 'Dialog',
})
RegisterModString({
    Path: TextPaths.RefusedConsequence,
    Local: 'The save has not been loaded and has not been modified: nothing above this message has been written to it. ' +
        'Returning to the menu is the safe way out, and reinstalling the release that wrote the save is the way to continue it.',
    Slot: 'Dialog',
})
RegisterModString({ Path: TextPaths.RefusedReturnToMenu, Local: 'Return to main menu', Slot: 'Dialog' })
RegisterModString({ Path: TextPaths.RefusedStay, Local: 'Stay here', Slot: 'Dialog' })

/**
 * The warning for a save that records no release, and the two answers to it.
 *
 * @param onLoadAnyway - Accept the warning: load the save and initialise the mod as though
 *   it had never been installed.
 * @param onCancel - Decline it. The save is left as it is.
 */
export const UnversionedSavePrompt = (onLoadAnyway: () => void, onCancel: () => void): PromptSpec => ({
    Id: PromptId.UnversionedSave,
    Title: GetModText(TextPaths.UnversionedTitle),
    Body: [
        GetModText(TextPaths.UnversionedBody),
        GetModText(TextPaths.UnversionedCause),
        GetModText(TextPaths.UnversionedConsequence),
        GetModText(TextPaths.UnversionedCorruption),
    ],
    Buttons: [
        { Label: GetModText(TextPaths.UnversionedCancel), OnPress: onCancel },
        { Label: GetModText(TextPaths.UnversionedLoadAnyway), Emphasised: true, OnPress: onLoadAnyway },
    ],
})

/**
 * The warning for a save a migration slot refuses.
 *
 * **Both answers leave the save alone.** "Stay here" keeps the player in the load menu so a
 * different save can be chosen; "Return to main menu" puts the game back on its own menu.
 * Neither writes anything, which is the property the caller is relying on when it refuses
 * before the game has adopted the save.
 *
 * @param outcome - The refusing slot's outcome, which carries its own reason string.
 * @param onReturnToMenu - Leave the load menu for the game's own main menu.
 * @param onStay - Dismiss the warning and remain where the player is.
 */
export const MigrationRefusedPrompt = (
    outcome: RefusedOutcome,
    onReturnToMenu: () => void,
    onStay: () => void
): PromptSpec => ({
    Id: PromptId.MigrationRefused,
    Title: GetModText(TextPaths.RefusedTitle),
    Body: [
        GetModText(TextPaths.RefusedBody),
        GetModText(TextPaths.RefusedChange),
        // The slot's own reason, last and unmerged: it is the one part of this message the
        // mod did not author, and a player quoting a problem should be quoting exactly it.
        outcome.reason,
        GetModText(TextPaths.RefusedConsequence),
    ],
    Buttons: [
        { Label: GetModText(TextPaths.RefusedStay), OnPress: onStay },
        {
            Label: GetModText(TextPaths.RefusedReturnToMenu),
            Emphasised: true,
            OnPress: outcome.ReturnToMenu ? onReturnToMenu : onStay,
        },
    ],
})

/**
 * A refusal that reports itself without interrupting the player.
 *
 * The quiet default for a slot: the caller announces it on the game's own status line,
 * which is the right weight for a refusal the player has no decision to make about. A slot
 * that *does* want a decision sets `ReturnToMenu` on its outcome instead.
 *
 * @param reason - What the gate should report, in the slot's own words.
 */
export const QuietRefusal = (reason: string): RefusedOutcome => ({
    kind: 'refuse',
    reason,
    ReturnToMenu: false,
})
