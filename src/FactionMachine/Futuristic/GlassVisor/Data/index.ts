/**
 * The glass visor family's shared text.
 *
 * Registered variants wear one of two names, chosen by which glass they are made of, so the names
 * are authored at the two paths a variant's glass selects and every variant inherits one of them.
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
