import { GetModelLayers } from 'kd-structured'
import { AddModelWithTextThenGetName, AddRestraintWithTextThenGetName } from '../../../KDInterface/KDExtension'
import { FactionFilter } from '../../../KDInterface/TextKey'

export const LockableSuitModel =
    AddModelWithTextThenGetName(
        {
            Name: '{0CA9A21B-5222-48B2-B5B5-2C8AAAA210B9}',
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

export const HeavyLockableSuit =
    AddRestraintWithTextThenGetName(
        {
            name: '{F10BAD9F-53F1-439B-9A00-BA5DB504A646}',
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
            AssetGroup: 'Suit',
            Asset: 'SeamlessCatsuit',
            Color: ['#3873C3'],
            factionColor: [[0]],
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