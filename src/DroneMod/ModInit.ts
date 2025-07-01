
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

import { Earphone } from './Futuristic/HeadSet/Headphone';
import * as HeadSet from './Futuristic/HeadSet'
import * as HolographicHeadSet from './Futuristic/HeadSet/Holographic'
import * as GagMetal from './Futuristic/Gag/GagMetal'


(() => {
    const AddWeaker = (r: string | restraint) =>
        KinkyDungeonAddRestraintIfWeaker(
            r,
            undefined,
            true,
            'Cyber3',
            undefined,
            undefined,
            undefined,
            'Dollsmith',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined, undefined,
            undefined,
            {
                hexes: [],
                enchants: [],
                level: 0,
                minfloor: 0,
                powerBonus: 0,
            }
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
                HolographicHeadSet.GetGoggleVariant(new HeadSet.Variant(HeadSet.GlassType.Color, 1))
            ]
            .forEach(AddWeaker)
        },
        {
            ...PerkBase,
            cost: -1
        }
    )
})();

const gag: GagMetal.Variant = {
    Ball:GagMetal.BallKind.None,
    Muzzle: GagMetal.MuzzleKind.OTN,
    Strap: {
        __Type: GagMetal.StrapKindTags.Harness,
        Detail: GagMetal.StrapDetail.Segmented
    },
    Component:
        GagMetal.Component.CheekDisplay |
        GagMetal.Component.PerioralClip
}

console.log('Gag is defined:', GagMetal.Variant.Verify(gag))