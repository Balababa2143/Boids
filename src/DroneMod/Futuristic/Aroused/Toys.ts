import * as KDEx from '../../../KDInterface/KDExtension'


const NippleClamps = <restraint>KinkyDungeonRestraints.find(r => r.name === 'NippleClamps')
const TrapVibe = <restraint>KinkyDungeonRestraints.find(r => r.name === 'TrapVibeProto')


export const LockVibe =
    KDEx.AddRestraintWithTextThenGetName(
        {
            ...TrapVibe,
            name: 'LockVibe',
            escapeChance: {
                ...NippleClamps!.escapeChance,
                Struggle: TrapVibe!.escapeChance.Struggle
            }
        },
        {
            DisplayName: 'Lockable Vibe',
            FlavorText: TextProvider.instance.getText(`Restraint${TrapVibe.name}Desc`),
            FunctionText: TextProvider.instance.getText(`Restraint${TrapVibe.name}Desc2`)
        }
    )

export const DenialPlugF =
    KDEx.AddRestraintWithTextThenGetName(
        {
            inventory: true,
            arousalMode: true,
            name: "DenialPlugF",
            Asset: "VibratingDildo",
            Color: "Default",
            Group: "ItemVulva",
            plugSize: 1.5,
            power: 3,
            weight: 2,
            failSuffix: { "Struggle": "Plug" },
            limited: true,
            escapeChance: { ...NippleClamps.escapeChance, "Struggle": 0.25, Remove: 0.5 },
            enemyTags: { "trap": 10, "maidRestraintsLight": 2, "genericToys": 2, 'machinePlug': 5, "toyPleasure": 2 },
            playerTags: { "NoVibes": -1000 },
            minLevel: 0,
            allFloors: true,
            shrine: ["Plugs", "Vibes", "Toys"],
            // linkedVibeTags: ["plugs"],
            allowRemote: true,
            events: [
                { trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true },
                { trigger: "remoteVibe", type: "RemoteActivatedVibe", power: 4, time: 5, edgeOnly: true },
                { trigger: "tick", type: "PeriodicDenial", power: 1, time: 13, edgeOnly: true, cooldown: { "normal": 15, "tease": 10 }, chance: 0.02 },
                { trigger: "tick", type: "PeriodicDenial", power: 2, time: 10, edgeOnly: true, cooldown: { "normal": 15, "tease": 10 }, chance: 0.025 },
                { trigger: "tick", type: "PeriodicDenial", power: 3, time: 7, edgeOnly: true, cooldown: { "normal": 15, "tease": 10 }, chance: 0.03 },
                { trigger: "tick", type: "PeriodicDenial", power: 4, time: 4, edgeOnly: true, cooldown: { "normal": 15, "tease": 10 }, chance: 0.015 },
                { trigger: "tick", type: "PeriodicDenial", power: 5, time: 6, edgeOnly: true, cooldown: { "normal": 15, "tease": 10 }, chance: 0.075 },
                { trigger: "tick", type: "PeriodicTeasing", power: 5, time: 3, edgeOnly: false, cooldown: { "normal": 15, "tease": 10 }, chance: 0.0025 },
            ]
        },
        {

            DisplayName: 'Lockable Plug',
            FlavorText: TextProvider.instance.getText(`Restraint${'TrapPlug3'}Desc`),
            FunctionText: TextProvider.instance.getText(`Restraint${'TrapPlug3'}Desc2`),
        }
    )

export const DenialPlugR =
    KDEx.AddRestraintWithTextThenGetName(
        {
            inventory: true,
            arousalMode: true,
            name: "DenialPlugR",
            Asset: "VibratingDildoPlug",
            Color: "Default",
            Group: "ItemButt",
            plugSize: 2.0,
            power: 5,
            weight: 1,
            escapeChance: { ...NippleClamps.escapeChance, "Struggle": 0.25, Remove: 0.5 },
            enemyTags: { "genericToys": 1, "rearToys": 10, "toyEdgeMid": 2 },
            limited: true,
            playerTags: { "NoVibes": -1000 },
            minLevel: 0,
            allFloors: true,
            shrine: ["Plugs", "Vibes", "Toys"],
            failSuffix: { "Struggle": "Plug" },
            // linkedVibeTags: ["plugs"],
            allowRemote: true,
            events: [
                { trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true },
                { trigger: "remoteVibe", type: "RemoteActivatedVibe", power: 2, time: 30, edgeOnly: true },
                { trigger: "tick", type: "PeriodicDenial", power: 1, time: 24, edgeOnly: true, cooldown: { "normal": 50, "tease": 20 }, chance: 0.03 },
                { trigger: "tick", type: "PeriodicDenial", power: 2, time: 16, edgeOnly: true, cooldown: { "normal": 50, "tease": 20 }, chance: 0.02 },
            ]
        },
        {
            DisplayName: 'Lockable Rear Plug',
            FlavorText: TextProvider.instance.getText(`Restraint${'RearVibe1'}Desc`),
            FunctionText: TextProvider.instance.getText(`Restraint${'RearVibe1'}Desc2`),
        }
    )