import { LinkFolder } from '../../Common'
import { AddGlow } from '../Common'

export const BetweenThighCuff: ModelLayer[] =
    [
        {
            Name: '',
            Poses: ToMap(['Spread', 'Closed']),
            Layer: 'BindChainLinksUnder'
        },
    ]
        .map(layer => ({
            ...layer,
            Folder: `${LinkFolder}/BetweenThighCuff`,
        }))
        .flatMap(AddGlow)