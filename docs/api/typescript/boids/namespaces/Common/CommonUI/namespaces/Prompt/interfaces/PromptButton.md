[boids](../../../../../../../index.md) / [Common/CommonUI](../../../index.md) / [Prompt](../index.md) / PromptButton

# Interface: PromptButton

Defined in: src/Common/CommonUI/Prompt.ts:8

How much weight a button carries, which is all the renderer needs to know about intent.

## Properties

### Emphasised?

> `readonly` `optional` **Emphasised?**: `boolean`

Defined in: src/Common/CommonUI/Prompt.ts:12

Whether this is the affirmative choice; affirmative buttons are drawn last.

***

### Label

> `readonly` **Label**: `string`

Defined in: src/Common/CommonUI/Prompt.ts:10

The label the player reads, already translated by the caller.

***

### OnPress

> `readonly` **OnPress**: () => `void`

Defined in: src/Common/CommonUI/Prompt.ts:17

Called after the prompt has removed itself, so an action that moves the game elsewhere is not
left with an overlay in front of it.

#### Returns

`void`
