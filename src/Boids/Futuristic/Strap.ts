import { AddRestraintWithTextThenGetName } from "../../KDInterface/KDExtension";
import { ElectricMechLockSfx } from "./Common";

export const ControlHarness =
    AddRestraintWithTextThenGetName(
        {
            name: "{76C06708-B150-414C-B402-A57A1A78BC53}",
            Group: "ItemTorso",
            inventory: true,
            shrine: ["Metal", "Harnesses", "Cyber"],
            LinkableBy: [...KDHarnessLink],
            accessible: true,

            ...ElectricMechLockSfx,
            alwaysRender: true,
            Asset: "FuturisticHarness",
            Color: ['#499ed6', '#555555', '#555555', '#000000'],
            factionColor: [[], [], [0]],
            Model: "FutureHarness",
            factionFilters: {
                Display: { color: "Highlight", override: false },
                Straps: { color: "LightNeutral", override: true },
                Metal: { color: "DarkNeutral", override: true },
            },
            preview: 'Harnesses',

            // DefaultLock: "Cyber3",
            tightType: "Secure",
            escapeChance: {
                "Struggle": -0.4,
                "Cut": -0.2,
                "Remove": 0.4,
                "Pick": 0.1
            },

            harness: true,
            debris: "Chains",
            strictness: 0.1,
            restriction: 3,
            power: 10,
            weight: 0,
            maxwill: 0.5,
            unlimited: true,
            enemyTags: {
                //  "controlHarness": 20,
                //   "roboPrisoner": 10, 
                //   "cyberdollrestraints": 100 
            },
            playerTags: {},
            minLevel: 7,
            allFloors: true,

            events: [
                { trigger: "postUnlock", type: "RequireLocked", inheritLinked: true },
                // {trigger: "postApply", type: "ControlHarness", power: 1, inheritLinked: true},
                // {trigger: "remotePunish", type: "RemoteControlHarness", kind: "RemoteLink", noLeash: false, enemyDialogue: "KDDialogueRemoteLinkTether", msg: "KDMsgRemoteLinkCHTether"},
            ]
        },
        {
            DisplayName: 'Drone Harness',
            FlavorText: TextProvider.instance.getText(`Restraint${'ControlHarness'}Desc`),
            FunctionText: TextProvider.instance.getText(`Restraint${'ControlHarness'}Desc2`)
        }
    )