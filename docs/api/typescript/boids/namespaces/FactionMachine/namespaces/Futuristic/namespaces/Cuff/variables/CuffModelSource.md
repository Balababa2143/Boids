[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [Futuristic](../../../index.md) / [Cuff](../index.md) / CuffModelSource

# Variable: CuffModelSource

> `const` **CuffModelSource**: `object`

Defined in: src/FactionMachine/Futuristic/Cuff/Common.ts:49

Which base-game model each kind is a copy of.

The cuff models differ from the collars in that they mark their own lock layers; the copying
transformation itself lives in `Model.ts` and is applied once per kind, which is the whole reason
this is a table rather than eight function calls.

The waist cuff is deliberately sourced from a **belt** rather than a cuff model, because it sits in
`ItemTorso` rather than on a limb.

## Type Declaration

### AnkleCuff

> `readonly` **AnkleCuff**: `object`

#### AnkleCuff.Source

> `readonly` **Source**: `"CyberCuffsAnkles"` = `'CyberCuffsAnkles'`

### ArmCuff

> `readonly` **ArmCuff**: `object`

#### ArmCuff.Source

> `readonly` **Source**: `"CyberCuffsArms"` = `'CyberCuffsArms'`

### ElbowCuff

> `readonly` **ElbowCuff**: `object`

#### ElbowCuff.Source

> `readonly` **Source**: `"CyberCuffsElbows"` = `'CyberCuffsElbows'`

### HeavyCollar

> `readonly` **HeavyCollar**: `object`

#### HeavyCollar.Source

> `readonly` **Source**: `"FutureCollar"` = `'FutureCollar'`

### LightCollar

> `readonly` **LightCollar**: `object`

#### LightCollar.Source

> `readonly` **Source**: `"NeoCyberCollar"` = `'NeoCyberCollar'`

### ThighCuff

> `readonly` **ThighCuff**: `object`

#### ThighCuff.Source

> `readonly` **Source**: `"CyberCuffsThigh"` = `'CyberCuffsThigh'`

### WaistCuff

> `readonly` **WaistCuff**: `object`

#### WaistCuff.Source

> `readonly` **Source**: `"NeoCyberBelt"` = `'NeoCyberBelt'`

### WristCuff

> `readonly` **WristCuff**: `object`

#### WristCuff.Source

> `readonly` **Source**: `"CyberCuffsWrists"` = `'CyberCuffsWrists'`
