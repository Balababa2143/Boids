[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [Futuristic](../../../index.md) / [Cuff](../index.md) / CuffKind

# Variable: CuffKind

> `const` **CuffKind**: `object`

Defined in: src/FactionMachine/Futuristic/Cuff/Common.ts:20

The eight collar and cuff items.

A key is part of a persisted identity: a restraint's and a model's registered name is
`uuidv5(JSON.stringify(key), baseId)`, so renaming a member renames a saved item.

An object rather than a bare type: the parts tables are total over it, and `CuffKinds` iterates
it.

## Type Declaration

### AnkleCuff

> `readonly` **AnkleCuff**: `"AnkleCuff"` = `'AnkleCuff'`

### ArmCuff

> `readonly` **ArmCuff**: `"ArmCuff"` = `'ArmCuff'`

### ElbowCuff

> `readonly` **ElbowCuff**: `"ElbowCuff"` = `'ElbowCuff'`

### HeavyCollar

> `readonly` **HeavyCollar**: `"HeavyCollar"` = `'HeavyCollar'`

### LightCollar

> `readonly` **LightCollar**: `"LightCollar"` = `'LightCollar'`

### ThighCuff

> `readonly` **ThighCuff**: `"ThighCuff"` = `'ThighCuff'`

### WaistCuff

> `readonly` **WaistCuff**: `"WaistCuff"` = `'WaistCuff'`

### WristCuff

> `readonly` **WristCuff**: `"WristCuff"` = `'WristCuff'`
