import { LinkFolder } from '../../Common';
import { AddGlow } from '../Common';

export const BetweenElbowCuff: ModelLayer[] =
    [
        {
            Name: '',
            Poses: ToMap(['Free', 'Yoked', 'Up']),
            Layer: 'BindChainLinksUnder'
        }
    ]
        .map(layer => ({
            ...layer,
            Folder: `${LinkFolder}/BetweenElbowCuff`,
        }))
        .flatMap(AddGlow)