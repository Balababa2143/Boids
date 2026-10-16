[boids](../../../../../../../index.md) / [Common/CommonUI](../../../index.md) / [Prompt](../index.md) / IsPromptShowing

# Function: IsPromptShowing()

> **IsPromptShowing**(`promptId`): `boolean`

Defined in: src/Common/CommonUI/Prompt.ts:82

Whether any prompt is currently on screen.

The game keeps running while a prompt is up, so a caller may legitimately ask twice. This
lets a caller tell "your prompt is already showing" from "your prompt could not be
shown", which are different situations: the first means the player is already being
asked, the second means nobody is.

## Parameters

### promptId

`string`

## Returns

`boolean`
