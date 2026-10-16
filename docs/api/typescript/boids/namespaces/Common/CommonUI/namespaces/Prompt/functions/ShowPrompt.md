[boids](../../../../../../../index.md) / [Common/CommonUI](../../../index.md) / [Prompt](../index.md) / ShowPrompt

# Function: ShowPrompt()

> **ShowPrompt**(`spec`): `boolean`

Defined in: src/Common/CommonUI/Prompt.ts:123

Shows the prompt, or reports that it could not be shown.

Reuse rather than stacking matters: the game keeps drawing and keeps processing its own
buttons while a prompt is open, so a player who clicks the same save twice arrives here
twice. Two stacked prompts would present one decision as two, and the second one's
callbacks would be the live ones.

## Parameters

### spec

[`PromptSpec`](../interfaces/PromptSpec.md)

What to display, in already-translated strings.

## Returns

`boolean`

Whether a prompt was created. `false` means one of this kind was already up, or
  there is no document to put it in — in both cases **nothing was asked**, which a caller
  must not mistake for an answer.
