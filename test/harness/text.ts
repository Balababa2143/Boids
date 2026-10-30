/**
 * File text, read with one line ending. Every file the suite reads goes through
 * here, because raw bytes compare equal only on the machine that wrote the file.
 *
 * @module test/harness/text
 */

import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

/** CRLF and a lone CR both become LF. */
export const NormalizeEol = (text: string): string => text.replace(/\r\n?/g, '\n')

/** A text file's contents, with one line ending. */
export const ReadText = (file: string): string => NormalizeEol(readFileSync(file, 'utf8'))

/** {@link ReadText}, for the suites that read asynchronously. */
export const ReadTextAsync = async (file: string): Promise<string> =>
    NormalizeEol(await readFile(file, 'utf8'))

/** A JSON file, read through {@link ReadText} and parsed. */
export const ReadJson = <T>(file: string): T => JSON.parse(ReadText(file)) as T

/** {@link ReadJson}, for the suites that read asynchronously. */
export const ReadJsonAsync = async <T>(file: string): Promise<T> =>
    JSON.parse(await ReadTextAsync(file)) as T
