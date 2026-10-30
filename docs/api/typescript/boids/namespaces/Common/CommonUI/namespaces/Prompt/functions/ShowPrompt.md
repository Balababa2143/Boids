[boids](../../../../../../../index.md) / [Common/CommonUI](../../../index.md) / [Prompt](../index.md) / ShowPrompt

# Function: ShowPrompt()

> **ShowPrompt**(`spec`): `boolean`

Defined in: src/Common/CommonUI/Prompt.ts:71

Shows the prompt, or reports that it could not be shown. At most one prompt of a kind is on
screen: the game keeps running and keeps taking its own clicks while a prompt is up, so a player
who asks the same question twice arrives here twice.

## Parameters

### spec

[`PromptSpec`](../interfaces/PromptSpec.md)

What to display, in already-translated strings.

## Returns

`boolean`

Whether a prompt was created. `false` means one of this kind was already up, or there is
  no document to put it in — in both cases nothing was asked, which a caller must not read as an
  answer.
