/**
 * Reading the release version out of the source, for the suite and for the build.
 *
 * `webpack/verify.ts` checks the declaration against `package.json` when the mod is built,
 * and `test/release.test.ts` checks the same thing when the suite runs, so that a version
 * bump cannot land in one place and not the other. Neither side can import the module to
 * find out — the build config runs without a TypeScript transform, and a test that read the
 * value from the module would be asserting that the module equals itself.
 *
 * So both read the **source text** by pattern. That is the point rather than a shortcut:
 * the check has to observe what is written, and the one fragility it introduces — the
 * pattern following the declaration — is covered by a test of its own rather than left to
 * be discovered.
 */

import { readFileSync } from 'node:fs'
import * as path from 'node:path'

/** `src/KDExtension/Release.ts`, the one place the release version is declared in code. */
export const releaseSourceFile = path.resolve(process.cwd(), 'src', 'KDExtension', 'Release.ts')

/**
 * The `Version` of the `Release` declaration, or `undefined` when the text does not carry
 * one in the shape this looks for.
 *
 * Pattern-matched rather than parsed: `Release` is a typed literal in a module with
 * imports, and a regex over one declaration is smaller and more predictable than a
 * TypeScript parse of a file whose only interesting line is this one.
 *
 * @param source - The file's text, so this can also be exercised against a literal.
 */
export const ExtractReleaseVersion = (source: string): string | undefined =>
    /export const Release:\s*RootedReleaseRecord\s*=\s*\{[\s\S]*?Version:\s*'([^']+)'/.exec(source)?.[1]

/** The release version the mod declares in code, or `undefined` if it cannot be read. */
export const ReadDeclaredReleaseVersion = (): string | undefined => {
    try {
        return ExtractReleaseVersion(readFileSync(releaseSourceFile, 'utf8'))
    }
    catch {
        return undefined
    }
}

/** `package.json`, the authority the build stamps `modbuild` and the types version from. */
export const rootPackageJsonFile = path.resolve(process.cwd(), 'package.json')

/** The version `package.json` declares, or `undefined` if it cannot be read. */
export const ReadRootPackageVersion = (): string | undefined => {
    try {
        const pkg = JSON.parse(readFileSync(rootPackageJsonFile, 'utf8')) as { version?: string }
        return pkg.version
    }
    catch {
        return undefined
    }
}
