
(() => {
    PIXI.Assets.load({
        src: "TextureAtlas/DroneModAsset-0.json",
        loadParser: "modAtlasLoader"
    })
    PIXI.Assets.load({
        src: "TextureAtlas/DroneModAsset-1.json",
        loadParser: "modAtlasLoader"
    })
})();

import { Earphone } from './Futuristic/HeadSet/Headphone'
import * as HeadSet from './Futuristic/HeadSet'
import * as HolographicHeadSet from './Futuristic/HeadSet/Holographic'
import * as OralDevice from './Futuristic/Gag/Muffler'
import * as FaceCover from './Futuristic/Gag/FaceCover';


(() => {
    const AddWeaker = (r: string | restraint) =>
        KinkyDungeonAddRestraintIfWeaker(
            r,
            10,
            true,
            'Cyber3',
            undefined,
            undefined,
            undefined,
            'Dollsmith',
            true
        )
    const AddStart = (name: string, func: (_: void) => void, perk: KDPerk) => {
        if (KDPerkStart[name] != null) {
            throw new Error('Duplicated start perk')
        }
        else {
            KDPerkStart[name] = func
            KinkyDungeonStatsPresets[name] = {
                ...perk,
                id: name
            }
        }
    }
    const PerkBase: KDPerk = {
        startPriority: 10,
        category: "Start",
        id: 0,
        cost: 0,
        tags: ["start"]
    }
    AddStart(
        "Drone Sensory Set 1",
        () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 1)),
                FaceCover.SimpleHarness,
                OralDevice.NonMuffler
            ]
            .forEach(AddWeaker)
        },
        {
            ...PerkBase,
            cost: -0.5
        }
    )
    AddStart(
        "Drone Sensory Set 2",
        () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 2)),
                FaceCover.AdvanceHarness,
                OralDevice.Ball
            ]
            .forEach(AddWeaker)
        },
        {
            ...PerkBase,
            cost: -1
        }
    )
    AddStart(
        "Drone Sensory Set 3",
        () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 3)),
                FaceCover.PanelHarness,
                OralDevice.BigBall
            ]
            .forEach(AddWeaker)
        },
        {
            ...PerkBase,
            cost: -1
        }
    )
    AddStart(
        "Drone Sensory Set 4",
        () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 4)),
                FaceCover.PanelHarnessWithPort,
                OralDevice.Plug
            ]
            .forEach(AddWeaker)
        },
        {
            ...PerkBase,
            cost: -1
        }
    )
    AddStart(
        "Drone Sensory Set 5",
        () => {
            [
                Earphone,
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Black, 1)),
                FaceCover.PanelHarnessWithPort,
                OralDevice.NonMuffler
            ]
            .forEach(AddWeaker)
        },
        {
            ...PerkBase,
            cost: -1
        }
    )
})();