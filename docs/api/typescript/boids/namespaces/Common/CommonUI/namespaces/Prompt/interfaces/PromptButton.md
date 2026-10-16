[boids](../../../../../../../index.md) / [Common/CommonUI](../../../index.md) / [Prompt](../index.md) / PromptButton

# Interface: PromptButton

Defined in: src/Common/CommonUI/Prompt.ts:36

How much weight a button carries, which is all the renderer needs to know about intent.

## Properties

### Emphasised?

> `readonly` `optional` **Emphasised?**: `boolean`

Defined in: src/Common/CommonUI/Prompt.ts:43

Whether this is the affirmative choice. Affirmative buttons are drawn in the game's
button colour and placed last, so the layout reads left-to-right as *cancel, act*.

***

### Label

> `readonly` **Label**: `string`

Defined in: src/Common/CommonUI/Prompt.ts:38

The label the player reads. Already translated by the caller.

***

### OnPress

> `readonly` **OnPress**: () => `void`

Defined in: src/Common/CommonUI/Prompt.ts:48

Called when the button is pressed, **after** the prompt has removed itself — so an
action that moves the game elsewhere is not left with an overlay in front of it.

#### Returns

`void`
