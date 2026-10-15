/**
 * The heavy latex catsuit: one model and the restraint that wears it. The model
 * stacks the base game's catsuit layers over the cyber link collar's, with the
 * collar's layers pushed down in priority, hidden while overridden and marked as the
 * lock layers, so the suit shows a lock the way the rest of the set does.
 * @module Boids/Futuristic/Suit/LatexSuit
 */

import { GetModelLayers } from 'kd-structured'
import { AddModelWithTextThenGetName, AddRestraintWithTextThenGetName } from '../../../KDExtension'
import { FactionFilter } from '../../../KDInterface/TextKey'

/**
 * The catsuit model, a top-level model in the `Catsuit` folder and group. Its name
 * is a generated GUID rather than a readable name, and it is the model
 * {@link HeavyLockableSuit} renders with.
 */
export const LockableSuitModel =
    AddModelWithTextThenGetName(
        {
            Name: '0CA9A21B-5222-48B2-B5B5-2C8AAAA210B9',
            TopLevel: true,
            // Restraint: true,
            Categories: ['Suits'],
            Folder: 'Catsuit',
            Group: 'Catsuit',
            AddPose: ['HideNipples'],
            Layers: ToLayerMap([
                ...GetModelLayers({ ModelName: 'CatsuitRestraint' }),
                ...GetModelLayers({
                    ModelName: 'CyberLinkCollar',
                    Folder: ModelDefs['CyberLinkCollar'].Folder,
                    PriBonus: -20
                })
                    .map(layer => ({ ...layer, HideWhenOverridden: true }))
                    .map(layer => (layer.Name.includes('Display') ? { ...layer, LockLayer: true } : layer))
            ])
        }
    )

/**
 * The catsuit item, in `ItemTorso` from level 7 and on every floor. It cannot be
 * duplicated, always renders, draws its linked corsets, harnesses, ropes and other
 * bindings over itself while hiding any other catsuit, and is inaccessible once
 * worn. Its one event debuffs the escape calculation as latex does, and it carries
 * no lock requirement.
 */
export const HeavyLockableSuit =
    AddRestraintWithTextThenGetName(
        {
            name: 'F10BAD9F-53F1-439B-9A00-BA5DB504A646',
            Group: 'ItemTorso',
            inventory: true,
            inaccessible: true,
            noDupe: true,

            shrine: ['Catsuits', 'Latex', 'Suits'],
            LinkAll: true,
            linkCategory: 'Catsuits',
            linkSize: 0.75,
            renderWhenLinked: ['Corsets', 'Harnesses', ...KDBindable, 'Latex', 'Leather', 'Metal', 'Rope'],
            alwaysRender: true,
            renderExcept: ['Catsuits'],
            alwaysAccessible: true,

            sfxGroup: 'Rubber',
            Model: LockableSuitModel,

            factionFilters: {
                TorsoLower: { color: FactionFilter.Catsuit, override: true },
                TorsoUpper: { color: FactionFilter.Catsuit, override: true },
                Display: { color: FactionFilter.Highlight, override: false },
                Base: { color: FactionFilter.DarkNeutral, override: true },
                Rim: { color: FactionFilter.LightNeutral, override: true },
                Band: { color: FactionFilter.LightNeutral, override: true },
            },

            restriction: 3,
            power: 8.5,
            weight: 0,
            minLevel: 7,
            allFloors: true,

            escapeChance: {
                Struggle: -1.4,
                Cut: 0.2,
                Pick: 0.01,
                Unlock: 0.8,
                Remove: 0.38
            },

            enemyTags: {
                // 'latexRestraintsHeavy': 1.4,
                // 'latexRestraints': 2,
                // 'latexCatsuits': 3,
                // 'latexUniform': 3,
                // 'latexStart': 10,
                // 'shopCatsuit': 5,
                // 'latexcatsuitSpell': 5
            },
            playerTags: {
                // 'posLatex': 1,
                // 'latexAnger': 2,
                // 'latexRage': 2
            },

            events: [
                { trigger: 'beforeStruggleCalc', type: 'latexDebuff', power: 0.25, inheritLinked: true }
            ]
        }
    )