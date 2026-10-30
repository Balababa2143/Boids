/**
 * Reads the release version out of the source text, for the suite and the build. Neither
 * side can import the module, because the build config runs without a TypeScript transform.
 */

import * as path from 'node:path'
import { ReadJson, ReadText } from './text'

/** `src/KDExtension/Release.ts`, the one place the release version is declared in code. */
export const releaseSourceFile = path.resolve(process.cwd(), 'src', 'KDExtension', 'Release.ts')

/** The `Version` of the `Release` declaration, or `undefined` when the text does not carry one. */
export const ExtractReleaseVersion = (source: string): string | undefined =>
    /export const Release:\s*RootedReleaseRecord\s*=\s*\{[\s\S]*?Version:\s*'([^']+)'/.exec(source)?.[1]

/** The release version the mod declares in code, or `undefined` if it cannot be read. */
export const ReadDeclaredReleaseVersion = (): string | undefined => {
    try {
        return ExtractReleaseVersion(ReadText(releaseSourceFile))
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
        return ReadJson<{ version?: string }>(rootPackageJsonFile).version
    }
    catch {
        return undefined
    }
}
