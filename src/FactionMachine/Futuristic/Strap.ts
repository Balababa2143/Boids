/**
 * The torso strap of the drone set: one harness. A harness has its own rules for
 * how the wearer renders and how enemies grab and slow them, which is why this is a
 * restraint of its own rather than part of the suit.
 * @module FactionMachine/Futuristic/Strap
 */

import { AddRestraintWithTextThenGetName } from '../../KDExtension';
import { ControlledTag } from '../MachinePrime/Coordinator/Membership';
import { SFX } from './Common';
import { RequireLockedEvent } from './Common';

/**
 * The torso harness, shown in game as "Drone Harness" in `ItemTorso`, from level 7
 * and on every floor. It is a harness of moderate strength that always renders,
 * resists cutting, and drops chain debris when it breaks. Its only event is the
 * lock requirement, so unlike the base game harness it carries no remote punishment
 * handler.
 */
export const ControlHarness =
    AddRestraintWithTextThenGetName(
        {
            name: '76C06708-B150-414C-B402-A57A1A78BC53',
            Group: 'ItemTorso',
            inventory: true,
            shrine: ['Metal', 'Harnesses', 'Cyber', ControlledTag],
            LinkableBy: [...KDHarnessLink],
            accessible: true,

            ...SFX.ElectricMechLockSfx,
            alwaysRender: true,
            Model: 'FutureHarness',
            factionFilters: {
                Display: { color: 'Highlight', override: false },
                Straps: { color: 'LightNeutral', override: true },
                Metal: { color: 'DarkNeutral', override: true },
            },
            preview: 'Harnesses',

            // DefaultLock: 'Cyber3',
            tightType: 'Secure',
            escapeChance: {
                'Struggle': -0.4,
                'Cut': -0.2,
                'Remove': 0.4,
                'Pick': 0.1
            },

            harness: true,
            debris: 'Chains',
            strictness: 0.1,
            restriction: 3,
            power: 10,
            weight: 0,
            maxwill: 0.5,
            unlimited: true,
            enemyTags: {
                //  'controlHarness': 20,
                //   'roboPrisoner': 10, 
                //   'cyberdollrestraints': 100 
            },
            playerTags: {},
            minLevel: 7,
            allFloors: true,

            events: [
                RequireLockedEvent,
                // {trigger: 'postApply', type: 'ControlHarness', power: 1, inheritLinked: true},
                // {trigger: 'remotePunish', type: 'RemoteControlHarness', kind: 'RemoteLink', noLeash: false, enemyDialogue: 'KDDialogueRemoteLinkTether', msg: 'KDMsgRemoteLinkCHTether'},
            ]
        },
        {
            DisplayName: 'Drone Harness',
            Source: 'ControlHarness'
        }
    )