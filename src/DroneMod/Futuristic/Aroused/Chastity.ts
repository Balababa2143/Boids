import { AddRestraintWithTextThenGetName, RestraintText } from "../../../KDInterface/KDExtension";

export const SlimBelt =
    AddRestraintWithTextThenGetName(
        {
            inventory: true,
            name: "{BD8079B8-DCE0-48C4-AA6C-A520E5C00D21}",
            Group: "ItemPelvis",
            shrine: [
                "Chastity",
                "Metal",
                "ChastityBelts"
            ],
            LinkableBy: [
                "Wrapping"
            ],

            Asset: "FuturisticChastityBelt",
            Modules: [3, 1, 1, 1, 1],
            OverridePriority: 26,
            sfx: "FutureLock",
            sfxRemove: "SciFiConfigure",
            Color: ['#222222', '#499ed6', '#555555', '#000000', '#555555', '#b927a8', '#3868E8', '#555555', '#222222'],
            // Body, Display, Panel, Lock, band, trim, band, underplug, plug, strap
            factionColor: [[0], [5], [1]],
            Model: "CyberBelt",
            factionFilters: {
                Lining: { color: "LightNeutral", override: true },
                Metal: { color: "DarkNeutral", override: true },
                Display: { color: "Highlight", override: false },
                Plug: { color: "Highlight", override: true },
            },


            // DefaultLock: "Cyber3",
            tightType: "Secure",
            Security: {
                level_tech: 2,
            },
            escapeChance: {
                "Struggle": -1.3,
                "Cut": -0.8,
                "Remove": 1.0,
                "Pick": -0.35
            },

            arousalMode: false, // Can be worn in non arousal mode without vibe activation etc.
            chastity: true,
            power: 20,
            weight: 0,
            maxwill: 0.4,
            enemyTags: {
                // "cyberdollchastity": 1000
            },
            playerTags: {
                "ItemVulvaEmpty": -5,
                "ItemVulvaPiercingsEmpty": -5
            },
            minLevel: 7,
            allFloors: true,
            events: [
                { trigger: "postUnlock", type: "RequireLocked", inheritLinked: true },
            ],
        },
        {
            DisplayName: 'Drone Belt',
            FlavorText: 'Slim',
            FunctionText: TextProvider.instance.getText(`Restraint${'CyberBelt'}Desc2`)
        }
    )

export const SlimBra =
    AddRestraintWithTextThenGetName(
        {
            inventory: true,
            name: "{E0261BA0-1396-491B-8901-2A649E01E499}",
            Group: "ItemBreast",
            shrine: ["ChastityBras", "Chastity", "Metal", "Cyber", "CyberChastityU"],

            Asset: "FuturisticBra2",
            OverridePriority: 26,
            sfx: "FutureLock",
            sfxRemove: "SciFiConfigure",
            Color: ['#499ed6', '#555555', '#222222', '#ffffff', '#555555', '#000000', KDBaseBlack],
            factionColor: [[2, 5], [2], [0]],
            Model: "BraCyber",
            factionFilters: {
                Display: { color: "Highlight", override: false },
                Lining: { color: "LightNeutral", override: true },
                Metal: { color: "DarkNeutral", override: true },
            },

            // DefaultLock: "Cyber3",
            tightType: "Secure",
            Security: {
                level_tech: 2,
            },
            escapeChance: {
                "Struggle": -1.1,
                "Cut": -0.8,
                "Remove": 1.0,
                "Pick": -0.35
            },

            arousalMode: false, // Can be worn in non arousal mode without vibe activation etc.
            trappable: true,
            chastitybra: true,
            power: 15,
            weight: 0,
            maxwill: 0.6,
            enemyTags: {
                "cyberdollchastity": 1000
            },
            playerTags: {
                "FreeBoob": -1000
            },
            minLevel: 4,
            allFloors: true,

            events: [
                { trigger: "postUnlock", type: "RequireLocked", inheritLinked: true },
            ],
        },
        {
            DisplayName: 'Drone Bra',
            FlavorText: 'Slim',
            FunctionText: TextProvider.instance.getText(`Restraint${'CyberBra'}Desc2`)
        }
    )