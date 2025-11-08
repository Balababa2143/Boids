import { LinkFolder } from '../../Common'
import { AddGlow } from '../Common'

export const BetweenAnkleCuff: ModelLayer[] =
    [
        {
            Name: '',
            Poses: ToMap(['Spread']),
            Layer: 'BindChainLinksUnder'
        },
    ]
        .map(layer => ({
            ...layer,
            Folder: `${LinkFolder}/BetweenAnkleCuff`,
        }))
        .flatMap(AddGlow)