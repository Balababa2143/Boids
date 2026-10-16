/**
 * The glass visor family's shared text.
 *
 * Forty registered variants wear one of **two** names, chosen by which glass they are made of,
 * so the names are authored here at the two paths a variant's glass selects and every variant
 * inherits one of them. What stays in `Item.ts` is the part that is genuinely computed: the
 * four-line function block built from a variant's own fields.
 * @module FactionMachine/Futuristic/GlassVisor/Data
 */

import { AsTextTree, RegisterTextTreeSource, TextScopeRank } from '../../../../KDExtension'
import en from './en.json'

RegisterTextTreeSource({
    Scope: 'FactionMachine.Futuristic.GlassVisor',
    Rank: TextScopeRank.Family,
    Languages: {
        en: AsTextTree(en),
    },
})
