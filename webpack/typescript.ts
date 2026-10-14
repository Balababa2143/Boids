import type webpack from 'webpack'

/**
 * The TypeScript handling both bundles share. Only the tsconfig differs between
 * them, so that is the only thing this takes.
 */

/** Extensions both bundles resolve, kept here so they cannot drift apart. */
export const resolveExtensions = ['.tsx', '.ts', '.js']

export const typescriptRule = (configFile?: string): webpack.RuleSetRule => ({
    test: /\.ts?$/,
    use: {
        loader: 'ts-loader',
        ... configFile && { options: { configFile } },
    },
    exclude: /node_modules/,
})
