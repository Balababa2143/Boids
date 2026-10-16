/**
 * The link families' shared text.
 *
 * A link family is exactly the shape a tree is for: five (or four) registered restraints that
 * share one display name and differ only in the discriminator that tells them apart. The name
 * is authored **once, here**, and the variants inherit it — the per-variant discriminators stay
 * beside their variants in `Arm.ts` and `Leg.ts`, where they are being used as placeholders.
 *
 * The path segments are the variant keys, which are already the identity a variant's name is
 * derived from, so a translator can address one variant at
 * `FactionMachine.Futuristic.Link.Arm.BetweenWristCuff` without anything new being invented.
 * @module FactionMachine/Futuristic/Link/Data
 */

import { AsTextTree, RegisterTextTreeSource, TextScopeRank } from '../../../../KDExtension'
import en from './en.json'

RegisterTextTreeSource({
    Scope: 'FactionMachine.Futuristic.Link',
    Rank: TextScopeRank.Family,
    Languages: {
        en: AsTextTree(en),
    },
})
