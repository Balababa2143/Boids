/**
 * The coordinator's state as a module owns it: one live value, the accessors that
 * read and write it, and the hooks that put it into a save and take it back out —
 * plus the load gate that decides whether a save may be read at all.
 *
 * The live value is an Immutable record tree, so every write produces a new tree and
 * the module swaps its reference; nothing here hands the current tree out to be
 * mutated. `GetState` reads it, the two `…In` helpers are what a caller writes with,
 * and `SetState` replaces the whole tree — which is what the two helpers go through,
 * and what the load path uses when it has a complete state in hand.
 *
 * ## Persistence writes to `KDGameData`, and that is the fix
 *
 * `KinkyDungeonGenerateSaveData` serialises **`KDGameData`**
 * (`base/KinkyDungeon.ts:7292`) and the load path replaces `KDGameData` with
 * `Object.assign({}, saveData.KDGameData)` (`:7434-7436`). `KDGameDataBase` is only
 * ever the *defaults literal* (`:595`, `:893`) — what a new game starts from, not what
 * a save carries. This module used to write to `KDGameDataBase` and read from
 * `KDGameData`, so the round-trip never closed (issue #48). Both halves now name
 * `KDGameData`, and the state key is spelled once.
 *
 * ## The root UUID, and why it is a sibling of the state rather than inside it
 *
 * A save records the `root_uuid` it was written under, and that single value is what
 * localises the release for the gate. It is deliberately **not** part of the
 * coordinator's state tree: the state is the dossier — what the Host demands of this
 * character — while the root is metadata about the *file*. Keeping one outside the
 * other is what lets route 1 clear the dossier (Phase 5) without disturbing the record
 * of what produced the save.
 *
 * ## The gate
 *
 * `KinkyDungeonLoadGame` is wrapped once, at module evaluation. It is the single
 * funnel every load goes through — the local slot, the legacy local value, a pasted
 * save code and a database row all arrive here — and it returns a **synchronous
 * boolean** that both call sites test and handle by staying on the load menu
 * (`base/KinkyDungeon.ts:5743`, `:6534`). That is what makes a clean refusal possible
 * without hanging the game.
 * @module Boids/MachinePrime/Coordinator/Internal/StateStorage
 */

import { AddEventHandler } from '../../../../KDExtension'
import { State } from './State'
import { KeyPath, PropAtPath } from '../../../../Utilities'
import { ShowPrompt } from '../../../CommonUI/Prompt'
import { CheckPersistedVariantNames } from './Integrity'
import { MigrationRefusedPrompt, UnversionedSavePrompt } from './SavePrompts'
import {
    GetCurrentReleaseIndex,
    GetMigrationsForRoot,
    GetReleaseIndexOf,
    MigrationOutcome,
    RefusedOutcome,
    Release,
    RootUuidKey,
} from '../../../../KDExtension/Release'

/**
 * The key the coordinator's state lives under on `KDGameData`.
 *
 * A UUID rather than a readable name, because it is a key in a namespace shared with
 * the game and every other mod, and a readable name invites a collision that surfaces
 * as two mods overwriting each other's saves.
 */
const GameDataStateKey = '68C84945-3A9A-4024-8CC6-E3CE092E9154' as const

declare global {
    interface KDGameDataBase {
        [GameDataStateKey]?: ReturnType<State['toJS']>
        [RootUuidKey]?: string
    }
}

let CoordinatorState: State = State()

/**
 * The coordinator's live state, seeded at module evaluation with a fresh default so a
 * call made before any save is loaded still answers.
 */
export const GetState = () => CoordinatorState

/**
 * Replaces the whole stored state in one step, and returns the state that was passed
 * in.
 *
 * A state that `.equals` the current one is dropped rather than installed, so a write
 * that changes nothing leaves the module holding the object it already had — which is
 * how a no-op `Register` or `UnRegister` leaves the stored tree untouched. This is the
 * wholesale setter: for one value inside the tree, prefer `SetStateIn` or
 * `UpdateStateIn`, which cannot silently discard sibling fields.
 *
 * @param newState - The tree to store, complete; nothing is merged into the old one.
 * @returns `newState`, whether or not it was installed.
 */
export const SetState = (newState: State) => {
    if (!newState.equals(CoordinatorState)) {
        CoordinatorState = newState
    }
    return newState
}

/**
 * Writes one value into the state, at the place a `KeyPath` names, replacing whatever
 * was stored there.
 *
 * The path is an array of keys rather than a dotted string because it is typed:
 * `KeyPath<State>` spells out which chains of fields exist and `PropAtPath` derives
 * what the last one holds, so an unknown field, or a value of the wrong type, is a
 * compile error instead of a lost write. A path like
 * `['ActivePC', 'Items', type, 'TargetStrength']` is one field of one slot of one
 * entity, and assigning through Immutable produces a new tree along the way.
 *
 * Read a value, change it, and write it back is `UpdateStateIn`; use this one when the
 * caller already knows the value to store.
 *
 * @param path - The field to write, as the chain of keys leading to it.
 * @param newProp - The value to store there.
 * @returns The state now in effect.
 */
export const SetStateIn = <Path extends KeyPath<State>>(path: Path, newProp: PropAtPath<State, Path>) =>
    SetState(GetState().setIn(path, newProp))

/**
 * A write whose value is derived from what is already stored. The path is spelled
 * once, so the read and the write cannot drift apart.
 *
 * The cast is Immutable's: `getIn` is typed as returning `unknown` however the path is
 * typed, while `setIn` keeps the path's type. Writing a value the caller computed stays
 * checked by `SetStateIn`.
 *
 * This is the read-modify-write helper: it suits a set that gains or loses a member, or
 * a counter, better than `SetStateIn`, because the caller never has to name the current
 * value.
 *
 * @param path - The field to update, as the chain of keys leading to it.
 * @param update - Called with the value stored there now; its result replaces it.
 * @returns The state now in effect.
 */
export const UpdateStateIn = <Path extends KeyPath<State>>(path: Path, update: (current: PropAtPath<State, Path>) => PropAtPath<State, Path>) =>
    SetStateIn(path, update(GetState().getIn(path) as PropAtPath<State, Path>))

//#region Messages

/**
 * The status-line messages this module reports.
 *
 * The prompt *wording* lives in `SavePrompts`, beside the prompt that renders it. What is
 * left here is the aftermath: the one-line acknowledgement of a decision already taken, and
 * the fallback for a refusal that could not be put in front of the player at all. These sit
 * with the gate because they describe what the gate just did.
 */
const enum TextKey {
    /** The save predates versioned identifiers and the player declined to load it. */
    LegacySaveDeclined = 'BoidsLegacySaveDeclined',
    /** The save predates versioned identifiers and the player chose to load it anyway. */
    LegacySaveAccepted = 'BoidsLegacySaveAccepted',
    /** A refusal that reached the status line instead of a prompt. */
    RefusalReported = 'BoidsSaveRefusalReported',
}

addTextKey(
    TextKey.LegacySaveDeclined,
    'This save was written before the mod recorded which release made it. It has been left ' +
    'unloaded; confirm the warning to load it anyway.'
)
addTextKey(
    TextKey.LegacySaveAccepted,
    "This save predates the mod's release record. It is being loaded as though it had never " +
    "carried any of the mod's equipment or control state."
)
addTextKey(
    TextKey.RefusalReported,
    'This save cannot be loaded by this release of the mod:'
)

/**
 * Reports a save decision to the player.
 *
 * The priority sits with the game's own urgent messages, and no sound is played:
 * nothing has happened to the character, and a noise would claim otherwise.
 */
const TellPlayer = (text: string) => {
    KinkyDungeonSendTextMessage(10, text, '#e0a020', 6, false, true)
}

//#endregion

//#region The load gate

/** What the player is being asked about, and the decompressed save they are asked about. */
type PendingLegacyLoad = {
    /** The identity a second load must match before the approval applies. */
    readonly identity: string
    /** The text as passed to the loader, kept so the retry loads exactly what was inspected. */
    readonly request: string
}

let PendingLegacyLoad: PendingLegacyLoad | null = null

/**
 * The one legacy load the player has approved, if any.
 *
 * **A single pending approval rather than a flag and rather than a set.** A flag leaks
 * across saves — in a save list, approving one character and then clicking another would
 * silently load the second — so the approval has to name the save it belongs to. A set
 * would name it too, but it accumulates: every cancelled decision would leave an entry
 * behind, and an approval that outlives its click is the same leak wearing a different
 * shape. Tying the approval to the one pending load makes it bounded by construction, and
 * means discarding the pending load *is* discarding the approval.
 */
let ApprovedLegacyLoad: string | null = null

/**
 * The migrations a load already accepted, but which need the live `KDGameData` to run.
 * `afterLoadGame` consumes and clears this list, so a superseded or refused load cannot
 * leave work behind for the next character.
 */
let PendingMigrations: ((_: unknown) => void)[] = []

/**
 * Whether the load now in flight is an unversioned save the player confirmed.
 *
 * **This flag is the whole reason the reset works.** Installing the fresh state from the gate
 * would be pointless: the game adopts the save *after* the gate decides, and the save still
 * carries whatever the old build wrote under the state key, so `afterLoadGame` would immediately
 * read that stale state back over the top of the reset. The reset therefore happens in the
 * handler, which is the first moment the game has finished adopting the save — and the flag is
 * what tells the handler, `null !=` guard and all, that this load is a deliberate fresh start
 * rather than a character that never had any.
 */
let PendingFreshState = false

/** The current release's root, which every save written by this build is stamped with. */
const ReleaseRoot = Release.Root

/**
 * Resolves the save text a load call refers to.
 *
 * The base game's own default does the same thing in its own body (`:7369-7371`): an
 * explicit string wins, and otherwise the local save is used, with the legacy
 * `loadedsaveslots` entry as the fallback for a save created before slot storage.
 */
const ResolveSaveText = (request: string) =>
    request.trim()
        ? request
        : (localStorage.getItem('KinkyDungeonSave') || loadedsaveslots[KDSaveSlot - 1] || '')

/** The base game's loader, captured before this module replaces it. */
const OriginalLoadGame = globalThis.KinkyDungeonLoadGame

/**
 * The part of a save the gate needs, or a report that there is nothing readable there.
 *
 * The save arrives compressed and the base game decompresses it only after this point,
 * so the gate decompresses it itself to look at the header. On every path that
 * proceeds, the *original request* is forwarded unchanged rather than the gate's own
 * copy being re-encoded: the loader is the only thing that should decide how a save
 * string is read.
 *
 * @param request - The save string the caller passed, empty meaning the local slot.
 */
const ReadSaveHeader = (request: string): { readonly kind: 'unreadable' } | { readonly kind: 'read', readonly root: unknown, readonly gameData: object } => {
    let source: string
    try {
        source = DecompressB64(ResolveSaveText(request).trim())
    }
    catch {
        return { kind: 'unreadable' }
    }
    if (!source) {
        return { kind: 'unreadable' }
    }

    let parsed: { KDGameData?: object } | undefined
    try {
        parsed = JSON.parse(source) as { KDGameData?: object }
    }
    catch {
        return { kind: 'unreadable' }
    }
    if (parsed == null || typeof parsed !== 'object') {
        return { kind: 'unreadable' }
    }

    const gameData = parsed.KDGameData ?? {}
    return { kind: 'read', root: (gameData as Record<string, unknown>)[RootUuidKey], gameData }
}

/**
 * Marks the next completed load as a deliberate fresh start.
 *
 * Called by the gate instead of installing the state there, for the reason recorded on
 * {@link PendingFreshState}: the game has not adopted the save yet at that point, and the save's
 * own stale state would win.
 */
const RequestFreshState = () => {
    PendingFreshState = true
}

/**
 * Walks a save's migration chain once and reports what it decided.
 *
 * The chain runs **once** per load: a slot that both refuses and carries work would
 * otherwise be consulted twice, and a migration is not a pure function of its own
 * arguments the second time round. A refusal stops the walk — a later slot has no business
 * editing a save an earlier one has just declared unreadable.
 *
 * @param root - The save's recorded root, already known to be a release in the table.
 * @returns The refusal to report, or the work to run once the game has adopted the save.
 */
const WalkMigrations = (root: unknown): { refused: RefusedOutcome | null, apply: ((_: unknown) => void)[] } => {
    const apply: ((_: unknown) => void)[] = []

    const slots = GetMigrationsForRoot(root) ?? []
    for (const slot of slots) {
        const outcome: MigrationOutcome = slot.Migrate()
        if (outcome.kind === 'refuse') {
            return { refused: outcome, apply: [] }
        }
        if (outcome.kind === 'accept-and-apply') {
            apply.push(outcome.apply)
        }
    }

    return { refused: null, apply }
}

/**
 * The canonical refusal for a save whose root this build does not know.
 *
 * It is a refusal of *this* build, not of the save: the table carries the whole history, so
 * an unknown root can only be a newer release's save, and updating the mod is the way to
 * read it. Returning to the menu is offered because staying would not help.
 */
const UnknownRootRefusal: RefusedOutcome = {
    kind: 'refuse',
    reason: 'This save was written by a newer release than the one installed.',
    ReturnToMenu: true,
}

/**
 * Puts a refusal in front of the player and, when the slot says it will not help, offers the
 * way out of the load menu.
 *
 * **The two answers differ in nothing that touches the save.** "Stay here" leaves the player
 * in the load menu so another save can be chosen, and "Return to main menu" sets the game's
 * own state — the same single assignment the game makes for its own back buttons
 * (`base/KinkyDungeon.ts:3315`). Neither writes anything, which is what makes refusing
 * graceful: the save on disk is exactly as it was, still loadable by a release that
 * understands it.
 *
 * A refusal that cannot be shown is still reported on the status line. The player has to be
 * told *something*: a load that silently does nothing is indistinguishable from a bug, and
 * this is the one place the mod knows for certain that the save could not be read.
 *
 * @param outcome - The refusing slot's own words and preference.
 * @param release - Which release refused, for the console line.
 * @returns Always `false`, so the gate's every refusal path reads the same.
 */
const RefuseLoad = (outcome: RefusedOutcome, release: string): boolean => {
    console.warn(`Boids: ${release} refused the save. ${outcome.reason}`)
    ForgetPendingLoad()
    PendingMigrations = []

    const asked = ShowPrompt(MigrationRefusedPrompt(
        outcome,
        () => {
            KinkyDungeonState = 'Menu'
        },
        () => {
            // Staying is the whole of the "stay" answer: the player is already in the load
            // menu, and the save has not been touched, so there is nothing to undo.
        }
    ))

    if (!asked) {
        // No document to ask in, or a prompt is already up. The status line is the fallback,
        // because a refusal the player is never told about is worse than a rough one.
        TellPlayer(`${TextGet(TextKey.RefusalReported)} ${outcome.reason}`)
    }
    return false
}

/**
 * The load gate: decides whether a save may be read, and leaves the state side of the
 * decision to `afterLoadGame`.
 *
 * Every branch returning `false` does so **before the game has adopted anything**, so a
 * refused save cannot half-load a character.
 *
 * It throws nowhere. A throw from inside the game's loader walks into the game's own
 * crash-report path, which `docs/spec.md` §4.4 forbids, so a refusal is always a value.
 *
 * @param String - A save string to load, or empty for the local slot. Forwarded
 *   untouched to the original loader on every path that proceeds.
 * @param kdloadconsent - The consent override the caller was given.
 * @returns Whatever the original loader returned, or `false` for a refusal.
 */
const GuardedLoadGame = function (String: string = '', kdloadconsent = false): boolean {
    const header = ReadSaveHeader(String)

    if (header.kind === 'unreadable') {
        // Nothing to inspect and nothing to refuse: the base game reports an
        // unloadable save itself, and its message is better than a second one.
        ForgetPendingLoad()
        return OriginalLoadGame(String, kdloadconsent)
    }

    const { root, gameData } = header
    const hasRoot = Object.prototype.hasOwnProperty.call(gameData, RootUuidKey)

    if (hasRoot) {
        const savedIndex = GetReleaseIndexOf(root)
        if (savedIndex == null || savedIndex > GetCurrentReleaseIndex()) {
            // An absent root and an unknown one are different findings, and this is the
            // unknown half: the table carries the whole history, so a value it does not
            // know can only come from a release this build has never heard of.
            return RefuseLoad(UnknownRootRefusal, 'this build')
        }

        const walked = WalkMigrations(root)
        if (walked.refused != null) {
            return RefuseLoad(walked.refused, `the release before ${Release.Version}`)
        }

        PendingMigrations = walked.apply
        ForgetPendingLoad()
        return OriginalLoadGame(String, kdloadconsent)
    }

    // No root recorded: a character written before this release, or by a build that never
    // stamped one. It loads only once the player has been warned and has said yes.
    const identity = String
    if (ApprovedLegacyLoad === identity) {
        // Marked, not installed: `afterLoadGame` is the first point at which the game has adopted
        // the save, and until then the save's own old state is still the thing a read would find.
        RequestFreshState()
        PendingMigrations = []
        ApprovedLegacyLoad = null
        PendingLegacyLoad = null
        TellPlayer(TextGet(TextKey.LegacySaveAccepted))
        return OriginalLoadGame(String, kdloadconsent)
    }

    // A new question supersedes the previous one, and the previous approval with it: an
    // approval is a decision about *this* save and must not survive a different one.
    PendingLegacyLoad = { identity, request: String }
    ApprovedLegacyLoad = null
    const asked = ShowPrompt(UnversionedSavePrompt(
        () => {
            if (PendingLegacyLoad != null) {
                ApprovedLegacyLoad = PendingLegacyLoad.identity
                RetryPendingLoad(PendingLegacyLoad.identity)
            }
        },
        () => {
            ForgetPendingLoad()
            TellPlayer(TextGet(TextKey.LegacySaveDeclined))
        }
    ))

    if (!asked) {
        // No prompt was shown — there is no document to show one in, or one was already up.
        // Either way the player has not consented to losing the dossier, so the pending load
        // is discarded rather than waiting for an approval that can no longer arrive.
        ForgetPendingLoad()
        TellPlayer(TextGet(TextKey.LegacySaveDeclined))
    }
    return false
}

/**
 * Discards the question the player was being asked, and the approval that belonged to it.
 *
 * The two are one decision, so they are discarded together: leaving an approval behind for
 * a load nobody is being asked about is exactly the leak the single pending approval exists
 * to prevent.
 */
const ForgetPendingLoad = () => {
    PendingLegacyLoad = null
    ApprovedLegacyLoad = null
}

/**
 * Carries an approved legacy load into the game.
 *
 * The first attempt returned `false`, so the base game's own click handler has already
 * returned and will not run its post-load work. Rather than reimplementing that work —
 * the map callback, the state transition, the keybinding commit and
 * `KDModsAfterGameStart`, which live inline at `base/KinkyDungeon.ts:5743-5761` and
 * `:6534-6549` — the retry **re-enters the game's own load button**, the same idiom the
 * base game uses for its two-click confirmations. The cache is redrawn every frame, so
 * the handler found here is the live one.
 *
 * If that button cannot be found, the loader is called directly and
 * `KDModsAfterGameStart()` runs explicitly, so the boot sequence completes even on the
 * fallback. The consequence — no map-generation callback — is logged rather than
 * swallowed.
 *
 * @param identity - The approved save identity; matched against what is pending, so a
 *   stale click cannot load something the player was not shown.
 */
const RetryPendingLoad = (identity: string) => {
    const pending = PendingLegacyLoad
    if (pending == null || pending.identity !== identity) {
        return
    }

    const loadButton = KDButtonsCache?.['KDLoadGame']
    if (typeof loadButton?.func === 'function') {
        loadButton.func({ source: 'boids-legacy-retry' })
        return
    }

    console.warn(
        'Boids: the load button was not in the button cache, so the approved legacy save is ' +
        "being loaded without the game's own map-generation callback. If the map does not " +
        'appear, load the save again from the menu.'
    )
    if (GuardedLoadGame(pending.request, true)) {
        KDModsAfterGameStart()
    }
}

//#endregion

//#region Load and save hooks

AddEventHandler({
    eventMap: KDEventMapGeneric,
    trigger: 'afterLoadGame',
    type: 'B8D7875F-EDC2-41AA-B96B-3C91E905C761',
    handler(_e, _data) {
        const migrations = PendingMigrations
        PendingMigrations = []
        for (const migrate of migrations) {
            try {
                migrate(KDGameData)
            }
            catch (error) {
                // A failed migration must not take the load with it: the character is
                // already in memory, and the state below is rebuilt from whatever the
                // migration managed to leave behind.
                console.error('Boids: a save migration failed and was skipped.', error)
            }
        }

        const freshStart = PendingFreshState
        PendingFreshState = false

        if (freshStart) {
            // A confirmed unversioned save: the character stays and the mod's record of it does
            // not. The save's own state key is deliberately *not* read — that record is what the
            // player was asked to give up, and it is unreadable by construction, which is what
            // made this a question in the first place.
            SetState(State())
        }
        else {
            const saved = KDGameData[GameDataStateKey]
            if (null != saved) {
                SetState(State.fromJS(saved))
            }
        }

        // After the state is in hand, so the check sees what the mod now believes it
        // controls rather than what it believed before the load. It reports and never
        // repairs.
        CheckPersistedVariantNames()
    },
})

/**
 * Stamps the release into every save, and writes the coordinator's state into it.
 *
 * The wrapper runs *before* the game serialises, and what it writes is the object the
 * game then deep-copies (`base/KinkyDungeon.ts:7325-7327`), so both the state and the
 * root genuinely ride in the save. The root is re-stamped on every save rather than
 * written once at new game: that is what makes the value in a save always name the
 * release that wrote it, and it means a character created before versioning acquires a
 * root on its first save under this release, with no migration.
 */
const _KinkyDungeonGenerateSaveData = globalThis.KinkyDungeonGenerateSaveData

globalThis.KinkyDungeonGenerateSaveData = function () {
    KDGameData[RootUuidKey] = ReleaseRoot
    KDGameData[GameDataStateKey] = CoordinatorState.toJS()
    return _KinkyDungeonGenerateSaveData()
}

globalThis.KinkyDungeonLoadGame = GuardedLoadGame

//#endregion
