[boids](../../../../../../../index.md) / [Common/CommonUI](../../../index.md) / [Prompt](../index.md) / PromptSpec

# Interface: PromptSpec

Defined in: src/Common/CommonUI/Prompt.ts:52

Everything a prompt displays.

## Properties

### Body

> `readonly` **Body**: readonly `string`[]

Defined in: src/Common/CommonUI/Prompt.ts:61

The body, one entry per paragraph.

***

### Buttons

> `readonly` **Buttons**: readonly [`PromptButton`](PromptButton.md)[]

Defined in: src/Common/CommonUI/Prompt.ts:63

The choices, in the order they are drawn.

***

### Id

> `readonly` **Id**: `string`

Defined in: src/Common/CommonUI/Prompt.ts:57

A stable id, unique per prompt kind. It is what makes the reuse guard work: a request
for a prompt whose kind is already on screen is refused rather than stacked.

***

### Title

> `readonly` **Title**: `string`

Defined in: src/Common/CommonUI/Prompt.ts:59

The heading.
