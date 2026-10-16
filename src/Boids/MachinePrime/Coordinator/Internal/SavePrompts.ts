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
 * @module Boids/MachinePrime/Coordinator/Internal/SavePrompts
 */

import ModMetaData from '../../../../Utilities/ModMetadata'
import type { PromptSpec } from '../../../CommonUI/Prompt'
import type { RefusedOutcome } from '../../../../KDExtension/Release'

/**
 * The prompt ids. Stable, because an id is what the renderer's reuse guard keys on: a
 * second request for the same kind of prompt is refused rather than stacked.
 */
const enum PromptId {
    UnversionedSave = 'unversioned-save',
    MigrationRefused = 'migration-refused',
}

/**
 * The text keys this module registers.
 *
 * Registered here, beside the prompt that renders them, so a message's words and the
 * decision they describe cannot drift into different files.
 */
const enum TextKey {
    UnversionedTitle = 'BoidsLegacySaveTitle',
    UnversionedBody = 'BoidsLegacySaveBody',
    UnversionedConsequence = 'BoidsLegacySaveConsequence',
    UnversionedLoadAnyway = 'BoidsLegacySaveLoadAnyway',
    UnversionedCancel = 'BoidsLegacySaveCancel',

    RefusedTitle = 'BoidsMigrationRefusedTitle',
    RefusedBody = 'BoidsMigrationRefusedBody',
    RefusedConsequence = 'BoidsMigrationRefusedConsequence',
    RefusedReturnToMenu = 'BoidsMigrationRefusedReturnToMenu',
    RefusedStay = 'BoidsMigrationRefusedStay',
}

addTextKey(TextKey.UnversionedTitle, `${ModMetaData.modname} | Compatibility Warning`)
addTextKey(
    TextKey.UnversionedBody,
    `${ModMetaData.modname} cannot determine mod version in this save.\n` +
    `This save might have been created either without ${ModMetaData.modname}` +
    `or with an old version of it.`
)
addTextKey(
    TextKey.UnversionedConsequence,
    'If you choose to load anyway, this mod would attempt initialization as if no version of it has been installed.\n' +
    'Loading a save with incompatible mod version may break the game and permanently corrupt your save.'
)
addTextKey(TextKey.UnversionedLoadAnyway, 'Load anyway')
addTextKey(TextKey.UnversionedCancel, 'Cancel')

addTextKey(TextKey.RefusedTitle, `${ModMetaData.modname} | Compatibility Warning`)
addTextKey(
    TextKey.RefusedBody,
    `This save was written by a release of ${ModMetaData.modname} that this build cannot carry forward.\n` +
    'The change it needs is a breaking one, so loading it would leave the game reading a shape it ' +
    'no longer understands.'
)
addTextKey(
    TextKey.RefusedConsequence,
    'The save has not been loaded and has not been modified: nothing above this message has been ' +
    'written to it. Returning to the menu is the safe way out, and reinstalling the release that ' +
    'wrote the save is the way to continue it.'
)
addTextKey(TextKey.RefusedReturnToMenu, 'Return to main menu')
addTextKey(TextKey.RefusedStay, 'Stay here')

/**
 * The warning for a save that records no release, and the two answers to it.
 *
 * @param onLoadAnyway - Accept the warning: load the save and initialise the mod as though
 *   it had never been installed.
 * @param onCancel - Decline it. The save is left as it is.
 */
export const UnversionedSavePrompt = (onLoadAnyway: () => void, onCancel: () => void): PromptSpec => ({
    Id: PromptId.UnversionedSave,
    Title: TextGet(TextKey.UnversionedTitle),
    Body: [
        TextGet(TextKey.UnversionedBody),
        TextGet(TextKey.UnversionedConsequence),
    ],
    Buttons: [
        { Label: TextGet(TextKey.UnversionedCancel), OnPress: onCancel },
        { Label: TextGet(TextKey.UnversionedLoadAnyway), Emphasised: true, OnPress: onLoadAnyway },
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
    Title: TextGet(TextKey.RefusedTitle),
    Body: [
        TextGet(TextKey.RefusedBody),
        // The slot's own reason, last and unmerged: it is the one part of this message the
        // mod did not author, and a player quoting a problem should be quoting exactly it.
        outcome.reason,
        TextGet(TextKey.RefusedConsequence),
    ],
    Buttons: [
        { Label: TextGet(TextKey.RefusedStay), OnPress: onStay },
        {
            Label: TextGet(TextKey.RefusedReturnToMenu),
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
