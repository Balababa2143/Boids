[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Debug](../index.md) / SetPostureArms

# Function: SetPostureArms()

> **SetPostureArms**(`poses?`, `gate?`): `void`

Defined in: src/FactionMachine/MachinePrime/Debug.ts:177

Names the poses the Host forbids the arms, or permits them again, and announces the resulting set.

## Parameters

### poses?

readonly `PoseKey`[]

The poses to name. Omitted means every pose on the dimension's ladder, so a bare
  `SetPostureArms()` is *"she may take none of them"*.

### gate?

`GateIntent`

`OverrideAllowed` restores the named poses instead of removing them.

## Returns

`void`
