[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [SensoryControl](../index.md) / ShowEffectsOnItemMorph

# Function: ShowEffectsOnItemMorph()

> **ShowEffectsOnItemMorph**(`args`): `void`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:127

Reports a limiter change to the player: at most one message and at most one
sound, each chosen by the direction of the change and each skipped when the
caller did not supply it.

The point of passing both directions is that each item supplies its own pair, so
the text a player reads matches the morph they are looking at. Only `delta > 0`
selects the increase half, so a `delta` of exactly zero counts as a decrease. The
sound is skipped entirely when the game has sound disabled, and falls back to the
decrease sound if an increase was wanted but no `sfxIncrease` was given.

## Parameters

### args

#### delta

`number`

The change in strength; positive means more severe.

#### messageDecrease?

`IKinkyDungeonSendTextMessageParameters`

Text message parameters for a decrease.

#### messageIncrease?

`IKinkyDungeonSendTextMessageParameters`

Text message parameters for an increase.

#### sfxDecrease?

`string`

Sound file stem for a decrease.

#### sfxIncrease?

`string`

Sound file stem for an increase, resolved under the
game's audio directory.

## Returns

`void`
