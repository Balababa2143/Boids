export const InheritColor = {
    BaseMetal: 'BaseMetal',
    DecorationMetal: 'DecorationMetal',
    Ball: 'Ball',
    Light: 'Light',
}

export const LayerName = {
    Muzzle: 'Muzzle',
    Strap: 'Strap',
    Harness: 'Harness',
    BallMaterial: 'BallMaterial',
}

const HideLightPose = {
    PerioralClip: '{7FC08ACF-B177-4103-AD07-157AF174647F}',
    CheekDisplay: '{A533FA99-24B9-429D-B603-1BAE2237AD9F}',
    GlabellaDisplay: '{7A5E12DE-49E1-4681-9067-EC6D977475DB}',
}

enum PriRef {
    Ball = 0.0,
    Panel = 50.0,
    Decoration = 100.0
}

export enum Category {
    Gag = 'Gag',
    GagFlat = 'GagFlat',
    GagMuzzle = 'GagMuzzle'
}

export enum LayerIndex {
    Id = '',
    Under = 'Under',
    Strap = 'Straps',

}

export const MapLayerIndex = (category: Category, layer: string | LayerIndex) => {
    switch (layer) {
        case LayerIndex.Id:
        case LayerIndex.Under:
        case LayerIndex.Strap:
            return category + layer
        default:
            return layer
    }
}


namespace Layer {
    const layerBase: ModelLayer = {
        Name: '',
        Layer: '',
        Folder: 'GagMetal',
        OffsetX: 942,
        OffsetY: 200,
        Invariant: true
    }
    export const MetalMuzzle: ModelLayer = {
        ...layerBase,
        Name: LayerName.Muzzle,
        Layer: LayerIndex.Id,
        Sprite: 'SciFiMuzzle',
        InheritColor: InheritColor.BaseMetal,
        Pri: PriRef.Panel + 2.0,
    }

    export const TransparentMetalMuzzle: ModelLayer = {
        ...layerBase,
        Name: LayerName.Muzzle,
        Layer: LayerIndex.Id,
        Sprite: 'SciFiMuzzle2',
        InheritColor: InheritColor.DecorationMetal,
        Pri: PriRef.Panel + 2.0,
    }
    export const PerioralClip: ModelLayer = {
        ...layerBase,
        Name: 'PerioralClip',
        Layer: LayerIndex.Strap,
        Sprite: 'HarnessMask',
        InheritColor: InheritColor.DecorationMetal,
        Pri: (PriRef.Decoration - 1.0),

    }
    export const PerioralClipLight: ModelLayer = {
        ...layerBase,
        Name: 'PerioralClipLight',
        Layer: LayerIndex.Strap,
        Sprite: 'HarnessMaskDisplay',
        InheritColor: InheritColor.Light,
        Pri: (PriRef.Decoration - 0.5),
        TieToLayer: PerioralClip.Name,
        HidePoses: ToMap([HideLightPose.PerioralClip]),
    }
    export const CheekDisplay: ModelLayer = {
        ...layerBase,
        Name: 'CheekDisplay',
        Layer: LayerIndex.Strap,
        Sprite: 'HarnessRim',
        InheritColor: InheritColor.DecorationMetal,
        Pri: (PriRef.Decoration + 10.0),
    }
    export const CheekDisplayLight: ModelLayer = {
        ...layerBase,
        Name: 'CheekDisplayLight',
        Layer: LayerIndex.Strap,
        Sprite: 'HarnessDisplay',
        InheritColor: InheritColor.Light,
        Pri: (PriRef.Decoration + 10.0),
        TieToLayer: CheekDisplay.Name,
        HidePoses: ToMap([HideLightPose.CheekDisplay]),
    }
    export const GlabellaDisplay: ModelLayer = {
        ...layerBase,
        Name: 'GlabellaDisplay',
        Layer: LayerIndex.Strap,
        Sprite: 'Rim',
        InheritColor: InheritColor.DecorationMetal,
        Pri: (PriRef.Decoration + 15.0),
    }
    export const GlabellaDisplayLight: ModelLayer = {
        ...layerBase,
        Name: 'GlabellaDisplayLight',
        Layer: LayerIndex.Strap,
        Sprite: 'Display',
        InheritColor: InheritColor.Light,
        Pri: (PriRef.Decoration + 15.0),
        TieToLayer: GlabellaDisplay.Name,
        HidePoses: ToMap([HideLightPose.GlabellaDisplay]),
    }
    export const OTN: ModelLayer = {
        ...layerBase,
        Name: LayerName.Muzzle,
        Layer: LayerIndex.Id,
        Sprite: 'OTN',
        InheritColor: InheritColor.BaseMetal,
        Pri: PriRef.Panel + 3.0,
    }
    export const OTNRivets: ModelLayer = {
        ...layerBase,
        Name: 'OTNRivets',
        Layer: LayerIndex.Id,
        Sprite: 'OTNRivets',
        Pri: PriRef.Panel + 3.5,
        TieToLayer: LayerName.Muzzle,
    }
    export const OTNStrap: ModelLayer = {
        ...layerBase,
        Name: 'OTNStrap',
        Layer: LayerIndex.Id,
        Sprite: 'OTNStrap',
        Pri: (PriRef.Decoration + 12.0),
        InheritColor: InheritColor.DecorationMetal,
        TieToLayer: LayerName.Muzzle,
    }
    export const OTNStrapRivits: ModelLayer = {
        ...layerBase,
        Name: 'OTNStrapRivits',
        Layer: LayerIndex.Id,
        Sprite: 'OTNStrapRivits',
        Pri: (PriRef.Decoration + 12.5),
        TieToLayer: OTNStrap.Name,
    }
    export const BallStrap: ModelLayer = {
        ...layerBase,
        Name: LayerName.Strap,
        Layer: LayerIndex.Strap,
        Sprite: 'BallStrap',
        Pri: (PriRef.Ball + 15.0),
    }
    export const BigBallStrap: ModelLayer = {
        ...layerBase,
        Name: LayerName.Strap,
        Layer: LayerIndex.Strap,
        Sprite: 'BigBallStrap',
        Pri: (PriRef.Ball + 15.0),
    }
    export const BigBallStrapSegmented: ModelLayer = {
        ...layerBase,
        Name: LayerName.Strap,
        Layer: LayerIndex.Strap,
        Sprite: 'BigBallStrapSegmented',
        Pri: (PriRef.Ball + 15.0),
    }
    export const SideStrap: ModelLayer = {
        ...layerBase,
        Name: 'SideStrap',
        Layer: LayerIndex.Strap,
        Sprite: 'BallSideStrap',
        Pri: (PriRef.Ball + 20.0),
    }
    export const BallHarness: ModelLayer = {
        ...layerBase,
        Name: LayerName.Harness,
        Layer: LayerIndex.Strap,
        Sprite: 'BallHarness',
        Pri: (PriRef.Ball + 10.0),
        AppendPose: {
            'FaceBigGag': 'Large'
        },
    }
    export const BallHarnessSegmented: ModelLayer = {
        ...layerBase,
        Name: LayerName.Harness,
        Layer: LayerIndex.Strap,
        Sprite: 'BallHarnessSegmented',
        Pri: (PriRef.Ball + 10.0),
        AppendPose: {
            'FaceBigGag': 'Large'
        },
    }
    export const Ball: ModelLayer = {
        ...layerBase,
        Name: LayerName.BallMaterial,
        Layer: LayerIndex.Id,
        Sprite: 'Ball',
        InheritColor: InheritColor.Ball,
        Pri: PriRef.Ball,
        AppendPose: {
            '2Fang': '2Fang',
            'Fang': 'Fang'
        },
        MorphPoses: {
            'MouthNeutral': '_TeethDeep',
            'MouthSurprised': '_Teeth',
            'MouthPout': '_TeethDeep',
            'MouthDistracted': '_Teeth',
        }
    }
    export const BallTeeth: ModelLayer = {
        ...layerBase,
        Name: 'BallTeeth',
        Layer: LayerIndex.Id,
        Sprite: 'Ball',
        Pri: (PriRef.Ball + 0.1),
        InheritColor: InheritColor.Ball,
        TieToLayer: Ball.Name,
        AppendPose: {
            '2Fang': '2Fang',
            'Fang': 'Fang'
        },
        Poses: ToMap(['MouthNeutral', 'MouthSurprised', 'MouthPout', 'MouthDistracted']),
        MorphPoses: {
            'MouthNeutral': '_TeethDeep',
            'MouthSurprised': '_Teeth',
            'MouthPout': '_TeethDeep',
            'MouthDistracted': '_Teeth',
        }
    }
    export const BigBall: ModelLayer = {
        ...layerBase,
        Name: LayerName.BallMaterial,
        Layer: LayerIndex.Id,
        Sprite: 'BigBall',
        InheritColor: InheritColor.Ball,
        Pri: PriRef.Ball,
    }
    const panelBase: ModelLayer = {
        ...layerBase,
        Sprite: 'SciFiPanel',
        InheritColor: InheritColor.BaseMetal,
        Layer: LayerIndex.Strap,
        Pri: (PriRef.Panel),
    }
    export const Panel: ModelLayer = {
        ...panelBase,
        Name: 'Panel',
    }
    export const PanelUpper: ModelLayer = {
        ...panelBase,
        Name: 'PanelUpper',
        SwapLayerPose: {
            'XrayFace': 'MaskOver'
        }
    }
    const plugBase: ModelLayer = {
        ...layerBase,
        Sprite: 'SciFiPlug',
        InheritColor: InheritColor.BaseMetal,
        Layer: LayerIndex.Strap,
        Pri: (PriRef.Decoration + 40.0),
    }
    export const Plug: ModelLayer = {
        ...plugBase,
        Name: 'Plug',
        Sprite: 'SciFiPlug',
    }
    export const MuzzlePlug: ModelLayer = {
        ...plugBase,
        Name: 'MuzzlePlug',
        Layer: MapLayerIndex(Category.GagMuzzle, LayerIndex.Id),
    }
}