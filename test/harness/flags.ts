/**
 * The suite's command-line switches.
 *
 * Read from `process.argv` rather than from the environment, for one reason: the documented spells
 * were `UPDATE_REGISTRATION_MANIFEST=1 npm test`, which is a bash-ism. This project is developed on
 * Windows, where `cmd` and PowerShell need a different form entirely — and a switch nobody can
 * paste is a switch that stops being used, so the artifacts it regenerates quietly go stale.
 *
 * `--audit` enables the checks that compare a **generated artifact against a committed copy**. They
 * are off by default because they force a regeneration on every content change, which is a tax on
 * ordinary work; they are on in the delivery gate (`npm run verify:full`), which is the gate every
 * phase in `design/dev-plan.md` already claims. A skipped check is reported as skipped by the runner,
 * never as a pass.
 *
 * @module test/harness/flags
 */

/** Whether the runner was started with a switch. */
export const HasFlag = (flag: string): boolean => process.argv.includes(flag)

/** Compare every generated artifact against its committed copy. */
export const Audit = () => HasFlag('--audit')

/** Regenerate the tracked registration summary. */
export const UpdateManifest = () => HasFlag('--update-manifest')

/** Regenerate the tracked published-surface baseline. */
export const UpdateApi = () => HasFlag('--update-api')

/** Regenerate the tracked text reference document. */
export const UpdateText = () => HasFlag('--update-text')

/**
 * The `skip` reason for a check that only runs in the delivery gate, or `undefined` when it runs.
 *
 * The runner reports a skipped test as skipped, so a demoted check stays visible as *not run*
 * rather than reading as a pass. That visibility is the whole reason the demotion is safe.
 *
 * @param what - What is not being compared, named for the reader.
 */
export const AuditSkipReason = (what: string): string | undefined =>
    Audit() ? undefined : `${what} is compared in the delivery gate: npm run verify:full`
