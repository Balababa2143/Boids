[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [PoseRoute](../index.md) / PoseAvailabilityFunction

# Variable: PoseAvailabilityFunction

> `const` **PoseAvailabilityFunction**: `object`

Defined in: src/FactionMachine/MachinePrime/Coordinator/PoseRoute.ts:54

The two globals the route wraps, by their engine names.

A `Replace` seam has no trigger bucket to hang on, so its `Trigger` is **the name of the function
being wrapped** — see `Control/Descriptor.ts`. Naming them here rather than in the descriptor
alone is what lets the phase that binds the wrap import the name it is wrapping instead of
retyping it.

## Type Declaration

### Arms

> `readonly` **Arms**: `"KDGetAvailablePosesArms"` = `'KDGetAvailablePosesArms'`

Answers which poses the arms may take.

### Legs

> `readonly` **Legs**: `"KDGetAvailablePosesLegs"` = `'KDGetAvailablePosesLegs'`

Answers which poses the legs may take.
