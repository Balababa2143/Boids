/**
 * The suite's command-line switches, read from `process.argv`.
 *
 * `--audit` turns on the artifact comparisons; a check that does not run is reported as skipped.
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
 * A skipped test stays visible as not run, so the demotion is safe.
 */
export const AuditSkipReason = (what: string): string | undefined =>
    Audit() ? undefined : `${what} is compared in the delivery gate: npm run verify:full`
