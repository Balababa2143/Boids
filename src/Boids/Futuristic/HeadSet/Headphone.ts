import { AddModelWithText, AddRestraintWithTextThenGetName } from '../../../KDInterface/KDExtension';
import { FactionFilter } from '../../../KDInterface/TextKey'
import { ItemArchetype, MechanichalLockSfx, ModelSetRootDir } from '../Common'
import { VisorSocket } from './Common'

enum PatchedElfEar {
    Any = 'ElfEar',
    Standard = 'ElfEarsStandard',
    Long = 'ElfEarsLong',
    Floppy = 'ElfEarsFloppy',
}

(() => {
    const PushAddPose = (model: Model, newAddPoses: Iterable<string>) => {
        if (model.AddPose != null) {
            for (const p of newAddPoses) {
                model.AddPose.push(p)
            }
        }
        else {
            model.AddPose = [...newAddPoses]
        }
    }
    PushAddPose(ModelDefs['ElfEars'], [PatchedElfEar.Any, PatchedElfEar.Standard])
    PushAddPose(ModelDefs['ElfEarsLong'], [PatchedElfEar.Any, PatchedElfEar.Long])
    PushAddPose(ModelDefs['ElfEarsFloppy'], [PatchedElfEar.Any, PatchedElfEar.Floppy])
})();

export enum InheritColor {
    Glass = 'Glass',
    BaseMetal = 'BaseMetal',
    Screen = 'Screen',
    Strap = 'Strap',
}

const model: Model = AddModelWithText({
    Name: '{A9A9B0AE-BF70-4125-B89C-60984246DEBF}',
    Folder: `${ModelSetRootDir}/Earphone`,
    Categories: ['Accessories', 'Face'],
    TopLevel: true,
    //Restraint: true,
    RemovePoses: ['HideEars'],
    Layers: ToLayerMap([
        {
            Name: 'EarPlugHuman',
            Layer: 'Head',
            Pri: 0.31,
            Invariant: true,
            InheritColor: InheritColor.BaseMetal,
            HidePoses: ToMap(['AnimalEars', PatchedElfEar.Any]),
            // HideWhenOverridden: true
        },
        {
            Name: 'EarPlugElfLongFront',
            Layer: 'Head',
            Pri: 0.31,
            Invariant: true,
            InheritColor: InheritColor.BaseMetal,
            RequirePoses: ToMap(['Cosplay', PatchedElfEar.Any]),
            HidePoses: ToMap(['AnimalEars', PatchedElfEar.Floppy]),
            // HideWhenOverridden: true
        },
        {
            Name: 'EarPlugElfLongBack',
            Layer: 'Head',
            Pri: -0.09,
            Invariant: true,
            InheritColor: InheritColor.BaseMetal,
            RequirePoses: ToMap(['Cosplay', PatchedElfEar.Any]),
            HidePoses: ToMap(['AnimalEars', PatchedElfEar.Floppy]),
            // HideWhenOverridden: true
        }
    ])
})

export const Earphone = AddRestraintWithTextThenGetName({
    name: '{373643CB-501A-435E-9EDC-0C7F733D3507}',
    Group: 'ItemHead',
    shrine: ['Visors', VisorSocket, ItemArchetype.HeadSet],
    noShrine: true,
    inventory: true,
    special: true,

    Model: model.Name,
    factionFilters: {
        [InheritColor.BaseMetal]: {
            color: FactionFilter.DarkNeutral,
            override: true
        }
    },
    ...MechanichalLockSfx,

    LinkableBy: [
        ...KDVisorLink,
        ItemArchetype.HeadSet
    ],
    renderWhenLinked: [ItemArchetype.HeadSet],
    noDupe: true,

    escapeChance: {
        Remove: 0.3,
        Unlock: 0.25,
        Struggle: -1,
        Pick: 0.05,
        Cut: -0.8
    },

    power: 0,
    weight: 0,
    minLevel: 0,
    allFloors: true,

    playerTags: {},
    enemyTags: {}
}, {
    DisplayName: 'Drone Earphone',
})