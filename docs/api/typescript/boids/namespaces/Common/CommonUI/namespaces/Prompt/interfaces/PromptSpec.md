[boids](../../../../../../../index.md) / [Common/CommonUI](../../../index.md) / [Prompt](../index.md) / PromptSpec

# Interface: PromptSpec

Defined in: src/Common/CommonUI/Prompt.ts:21

Everything a prompt displays.

## Properties

### Body

> `readonly` **Body**: readonly `string`[]

Defined in: src/Common/CommonUI/Prompt.ts:30

The body, one entry per paragraph.

***

### Buttons

> `readonly` **Buttons**: readonly [`PromptButton`](PromptButton.md)[]

Defined in: src/Common/CommonUI/Prompt.ts:32

The choices, in the order they are drawn.

***

### Id

> `readonly` **Id**: `string`

Defined in: src/Common/CommonUI/Prompt.ts:26

A stable id, unique per prompt kind: a request for a prompt whose kind is already on screen
is refused rather than stacked.

***

### Title

> `readonly` **Title**: `string`

Defined in: src/Common/CommonUI/Prompt.ts:28

The heading.
