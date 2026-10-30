import type webpack from 'webpack'

/** The TypeScript handling both bundles share; only the tsconfig differs between them. */

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
