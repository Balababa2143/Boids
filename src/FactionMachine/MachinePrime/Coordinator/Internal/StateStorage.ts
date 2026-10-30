/**
 * The coordinator's state as the module owns it: one live value, the accessors, the save hooks, and
 * the load gate. Both halves of the round trip name `KDGameData`, which is what the game serialises
 * and what the load path replaces; `KDGameDataBase` is only the defaults literal.
 * `KinkyDungeonLoadGame` is wrapped once, at module evaluation: it is the single funnel every load
 * goes through and it returns a synchronous boolean, which is what makes a refusal possible without
 * hanging the game.
 * @module FactionMachine/MachinePrime/Coordinator/Internal/StateStorage
 */

import { AddEventHandler, GetModText, RegisterModString } from '../../../../KDExtension'
import { State } from './State'
import { KeyPath, PropAtPath } from '../../../../Utilities'
import { ShowPrompt } from '../../../../Common/CommonUI/Prompt'
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
 * The key the coordinator's state lives under on `KDGameData`; a UUID, because the namespace is
 * shared with the game and every other mod.
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
 * The coordinator's live state, seeded at module evaluation so a call before any save is loaded
 * answers.
 */
export const GetState = () => CoordinatorState

/**
 * Replaces the whole stored state in one step, and returns the state that was passed in. A state
 * that `.equals` the current one is dropped rather than installed. For one value inside the tree,
 * prefer {@link SetStateIn} or {@link UpdateStateIn}.
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
 * Writes one value into the state, at the place a `KeyPath` names, replacing whatever was stored
 * there. The path is an array of keys rather than a dotted string because it is typed:
 * `KeyPath<State>` spells out which chains of fields exist and `PropAtPath` derives what the last
 * one holds, so an unknown field or a wrong-typed value is a compile error instead of a lost write.
 * @param path - The field to write, as the chain of keys leading to it.
 * @param newProp - The value to store there.
 * @returns The state now in effect.
 */
export const SetStateIn = <Path extends KeyPath<State>>(path: Path, newProp: PropAtPath<State, Path>) =>
    SetState(GetState().setIn(path, newProp))

/**
 * A write whose value is derived from what is already stored; the path is spelled once, so the read
 * and the write cannot drift apart. The cast is Immutable's: `getIn` is typed as returning
 * `unknown` however the path is typed, while `setIn` keeps the path's type.
 * @param path - The field to update, as the chain of keys leading to it.
 * @param update - Called with the value stored there now; its result replaces it.
 * @returns The state now in effect.
 */
export const UpdateStateIn = <Path extends KeyPath<State>>(path: Path, update: (current: PropAtPath<State, Path>) => PropAtPath<State, Path>) =>
    SetStateIn(path, update(GetState().getIn(path) as PropAtPath<State, Path>))

//#region Messages

/**
 * The status-line messages this module reports, and where their words live: the one-line
 * acknowledgement of a decision already taken, the fallback for a refusal that could not be put in
 * front of the player, and the reason a refusal is about. They are registered in the mod's own text
 * group rather than the shared one: the engine draws these strings but never looks them up, so they
 * are addressed by a path and read back with {@link GetModText}.
 */
const MessagePaths = {
    /** The save predates versioned identifiers and the player declined to load it. */
    LegacySaveDeclined: ['Common', 'Session', 'Declined'],
    /** The save predates versioned identifiers and the player chose to load it anyway. */
    LegacySaveAccepted: ['Common', 'Session', 'Accepted'],
    /** A refusal that reached the status line instead of a prompt. */
    RefusalReported: ['Common', 'Session', 'RefusalReported'],
    /** Why the gate refuses a save whose root this build has never heard of. */
    UnknownRootReason: ['Common', 'Session', 'UnknownRootReason'],
} as const satisfies Record<string, readonly string[]>

RegisterModString({
    Path: MessagePaths.LegacySaveDeclined,
    Local: 'This save was written before the mod recorded which release made it. It has been left ' +
        'unloaded; confirm the warning to load it anyway.',
    Slot: 'StatusLine',
})
RegisterModString({
    Path: MessagePaths.LegacySaveAccepted,
    Local: "This save predates the mod's release record. It is being loaded as though it had never " +
        "carried any of the mod's equipment or control state.",
    Slot: 'StatusLine',
})
RegisterModString({
    Path: MessagePaths.RefusalReported,
    Local: 'This save cannot be loaded by this release of the mod:',
    Slot: 'StatusLine',
})
RegisterModString({
    Path: MessagePaths.UnknownRootReason,
    Local: 'This save was written by a newer release than the one installed.',
    Slot: 'Message',
})

/**
 * Reports a save decision to the player, at the priority of the game's own urgent messages and
 * without a sound: nothing has happened to the character.
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
 * The one legacy load the player has approved, if any. A single pending approval rather than a flag
 * and rather than a set: a flag leaks across saves, since approving one character and then clicking
 * another would load the second without asking, and a set accumulates every cancelled decision.
 */
let ApprovedLegacyLoad: string | null = null

/**
 * The migrations a load already accepted, but which need the live `KDGameData` to run. The
 * `afterLoadGame` handler consumes and clears this list, so a superseded or refused load cannot
 * leave work behind for the next character.
 */
let PendingMigrations: ((_: unknown) => void)[] = []

/**
 * Whether the load now in flight is an unversioned save the player confirmed. The reset has to
 * happen in the `afterLoadGame` handler rather than in the gate: the game adopts the save after the
 * gate decides, and the save's own stale state would win over a reset installed there. This flag is
 * what tells the handler that the load is a deliberate fresh start.
 */
let PendingFreshState = false

/** The current release's root, which every save written by this build is stamped with. */
const ReleaseRoot = Release.Root

/**
 * Resolves the save text a load call refers to: an explicit string wins, and otherwise the local
 * save is used, with the legacy `loadedsaveslots` entry as the fallback.
 */
const ResolveSaveText = (request: string) =>
    request.trim()
        ? request
        : (localStorage.getItem('KinkyDungeonSave') || loadedsaveslots[KDSaveSlot - 1] || '')

/** The base game's loader, captured before this module replaces it. */
const OriginalLoadGame = globalThis.KinkyDungeonLoadGame

/**
 * The part of a save the gate needs, or a report that there is nothing readable there. The save
 * arrives compressed, so the gate decompresses it itself to look at the header; on every path that
 * proceeds the caller's original request is forwarded unchanged rather than this function's own
 * copy being re-encoded.
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
 * Marks the next completed load as a deliberate fresh start; called instead of installing the fresh
 * state, for the reason recorded on {@link PendingFreshState}.
 */
const RequestFreshState = () => {
    PendingFreshState = true
}

/**
 * Walks a save's migration chain once and reports what it decided. The walk stops at a refusal: no
 * later slot edits a save the walk has already refused.
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
 * The canonical refusal for a save whose root this build does not know: the table carries the whole
 * history, so an unknown root can only be a newer release's save, and updating the mod is the way
 * to read it.
 */
const UnknownRootRefusal: RefusedOutcome = {
    kind: 'refuse',
    reason: GetModText(MessagePaths.UnknownRootReason),
    ReturnToMenu: true,
}

/**
 * Puts a refusal in front of the player, and reports it on the status line when no prompt can be
 * shown. Both answers leave the save alone: neither writes anything, so the file is exactly as it
 * was and still loadable by a release that understands it.
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
            // Staying is the whole of the stay answer: nothing was touched, so nothing is undone.
        }
    ))

    if (!asked) {
        // No prompt could be shown, and a refusal the player never hears about is worse than a
        // rough
        // one.
        TellPlayer(`${GetModText(MessagePaths.RefusalReported)} ${outcome.reason}`)
    }
    return false
}

/**
 * The load gate: decides whether a save may be read, and leaves the state side of the decision to
 * the `afterLoadGame` handler. Every branch returning `false` does so before the game has adopted
 * anything, so a refused save cannot half-load a character. It throws nowhere: a refusal is a
 * value.
 * @param String - A save string to load, or empty for the local slot. Forwarded untouched to the
 *   original loader on every path that proceeds.
 * @param kdloadconsent - The consent override the caller was given.
 * @returns Whatever the original loader returned, or `false` for a refusal.
 */
const GuardedLoadGame = function (String: string = '', kdloadconsent = false): boolean {
    const header = ReadSaveHeader(String)

    if (header.kind === 'unreadable') {
        // Nothing to inspect: the base game reports an unloadable save itself, and its message is
        // better than a second one.
        ForgetPendingLoad()
        return OriginalLoadGame(String, kdloadconsent)
    }

    const { root, gameData } = header
    const hasRoot = Object.prototype.hasOwnProperty.call(gameData, RootUuidKey)

    if (hasRoot) {
        const savedIndex = GetReleaseIndexOf(root)
        if (savedIndex == null || savedIndex > GetCurrentReleaseIndex()) {
            // The table carries the whole history, so a value it does not know can only come from a
            // newer release.
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

    // No root recorded: written before this release, or by a build that never stamped one. It loads
    // only once the player has been warned and has said yes.
    const identity = String
    if (ApprovedLegacyLoad === identity) {
        // Marked, not installed: the game has not adopted the save yet, so a read would still find
        // the old state.
        RequestFreshState()
        PendingMigrations = []
        ApprovedLegacyLoad = null
        PendingLegacyLoad = null
        TellPlayer(GetModText(MessagePaths.LegacySaveAccepted))
        return OriginalLoadGame(String, kdloadconsent)
    }

    // A new question supersedes the previous one and the approval with it: an approval is a
    // decision
    // about this save and must not survive a different one.
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
            TellPlayer(GetModText(MessagePaths.LegacySaveDeclined))
        }
    ))

    if (!asked) {
        // Nothing was asked, so no approval can arrive for this load now.
        ForgetPendingLoad()
        TellPlayer(GetModText(MessagePaths.LegacySaveDeclined))
    }
    return false
}

/**
 * Discards the question the player was being asked, and the approval that belonged to it: the two
 * are one decision.
 */
const ForgetPendingLoad = () => {
    PendingLegacyLoad = null
    ApprovedLegacyLoad = null
}

/**
 * Carries an approved legacy load into the game by re-entering the game's own load button, so that
 * its post-load work — the map callback, the state transition, the keybinding commit and
 * `KDModsAfterGameStart` — runs as it does for a normal load. If that button is not in the cache,
 * the loader is called directly and `KDModsAfterGameStart()` runs explicitly, so the boot sequence
 * completes even without the map-generation callback.
 * @param identity - The approved save identity; matched against what is pending, so a stale click
 *   cannot load something the player was not shown.
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
                // A failed migration must not take the load with it: the state below is rebuilt
                // from whatever the migration managed to leave behind.
                console.error('Boids: a save migration failed and was skipped.', error)
            }
        }

        const freshStart = PendingFreshState
        PendingFreshState = false

        if (freshStart) {
            // The save's own state key is deliberately not read: that record is what the player was
            // asked to give up.
            SetState(State())
        }
        else {
            const saved = KDGameData[GameDataStateKey]
            if (null != saved) {
                SetState(State.fromJS(saved))
            }
        }

        // After the state is in hand, so the check sees what the mod now believes it controls. It
        // reports and never repairs.
        CheckPersistedVariantNames()
    },
})

/**
 * Stamps the release into every save, and writes the coordinator's state into it. The root is
 * re-stamped on every save rather than written once at new game, so the value in a save always
 * names the release that wrote it, and a character created before versioning acquires one on its
 * first save under this release.
 */
const _KinkyDungeonGenerateSaveData = globalThis.KinkyDungeonGenerateSaveData

globalThis.KinkyDungeonGenerateSaveData = function () {
    KDGameData[RootUuidKey] = ReleaseRoot
    KDGameData[GameDataStateKey] = CoordinatorState.toJS()
    return _KinkyDungeonGenerateSaveData()
}

globalThis.KinkyDungeonLoadGame = GuardedLoadGame

//#endregion
