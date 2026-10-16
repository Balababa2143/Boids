/**
 * Reading text, once, with one line ending.
 *
 * ## Why this exists
 *
 * Git normalises line endings in the index and materialises them per platform: this repository
 * stores LF and checks it out as CRLF on Windows. Anything in the suite that compares file text
 * against text it produced itself is therefore comparing content to content-plus-a-carriage-return,
 * and that failure only appears on a machine other than the one which wrote the file. The generated
 * text reference shipped broken exactly that way, and it passed every run in the session that
 * created it.
 *
 * So the policy lives in one place: **every file the suite reads comes through here, and every
 * comparison runs on the result.** `test/self-check.test.ts` fails when a test reads a file another
 * way, because a rule that depends on remembering is the rule that already broke once.
 *
 * A hash is a comparison too. `CanonicalJson` in `manifest.ts` normalises what it serialises, which
 * covers the registration manifest's comparison and every digest in it in one function.
 *
 * @module test/harness/text
 */

import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

/**
 * One line ending: CRLF and a lone CR both become LF.
 *
 * A lone CR is included because it is what a classic Mac line ending looks like, and what a
 * careless `replace('\r\n', '\n')` leaves behind in a file that mixes the two. Nothing in the suite
 * wants to tell them apart.
 */
export const NormalizeEol = (text: string): string => text.replace(/\r\n?/g, '\n')

/** A text file's contents, with one line ending. */
export const ReadText = (file: string): string => NormalizeEol(readFileSync(file, 'utf8'))

/** {@link ReadText}, for the suites that read asynchronously. */
export const ReadTextAsync = async (file: string): Promise<string> =>
    NormalizeEol(await readFile(file, 'utf8'))

/**
 * A JSON file, read as text and parsed.
 *
 * Line endings cannot survive `JSON.parse`, so this is not about the endings: it is about there
 * being one place that reads, which is what the gate can check.
 */
export const ReadJson = <T>(file: string): T => JSON.parse(ReadText(file)) as T

/** {@link ReadJson}, for the suites that read asynchronously. */
export const ReadJsonAsync = async <T>(file: string): Promise<T> =>
    JSON.parse(await ReadTextAsync(file)) as T
