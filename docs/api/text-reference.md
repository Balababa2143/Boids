# Boids — text reference

> **Generated.** `npm run test:update-text` writes this file, and
> `test/text-reference.test.ts` compares it in the delivery gate (`npm run verify:full`).
> Do not edit it by hand.

Every string the mod can put in front of a player, with the address a translation overrides
it at. **Two groups**, because the engine resolves one half of the surface and the mod
resolves the other (`spec` §4.6):

- **engine** — the engine composes the key from an identity the mod holds, so *Address* is
  the tree path when the slot has one and `—` when the value is registered beside the item.
  These are item names, tooltip lines, perk and category labels, and the variant prefix.
- **mod** — the mod resolves the value and the engine only displays it. *Address* is the
  dotted path, which is also the key.

**Where a line came from** is the *From* column: `tree` (authored in a JSON tree), `local`
(registered beside the item), `engine` (read from the base game's own text for the item
this one is derived from), or `blank` (a slot nothing supplies yet).

## Addressability

**292 of 436** slots carry a path, so a translator can override them
without touching code. The other **144** cannot be reached from a language tree
at all: they belong to the hand-written item families, whose lines are registered beside the
item and have no path yet. Giving each family its paths is an authoring task rather than a
mechanism change, and it is the first thing Phase 6 should do.

To override a line, add its path to the language tree beside the scope that owns it —
`…/Data/cn.json` — with the same shape the English tree uses. A value at a **shorter** path
covers everything beneath it, so one entry can translate a whole family.

| Group | Slot | Address | English | From |
| --- | --- | --- | --- | --- |
| engine | Name | — | Drone Belt | local |
| engine | Flavor | — | Slim | local |
| engine | Function | — | Base game: a cyber belt. | engine |
| engine | Name | — | Drone Bra | local |
| engine | Flavor | — | Slim | local |
| engine | Function | — | Base game: a cyber bra. | engine |
| engine | Name | — | Drone Belt | local |
| engine | Flavor | — | Bulky | local |
| engine | Function | — | Base game: a cyber belt. | engine |
| engine | Name | — | Drone Bra | local |
| engine | Flavor | — | Bulky | local |
| engine | Function | — | Base game: a cyber bra. | engine |
| engine | Name | — | Lockable Vibe | local |
| engine | Flavor | — | Base game: the prototype egg. | engine |
| engine | Function | — | Base game: lockable. | engine |
| engine | Name | — | Drone Plug | local |
| engine | Flavor | — | Base game: a smooth plug. | engine |
| engine | Function | — | Lockable, Front | local |
| engine | Name | — | Drone Plug | local |
| engine | Flavor | — | Base game: a rear plug. | engine |
| engine | Function | — | Lockable, Back | local |
| engine | Name | FactionMachine.Futuristic.Link.Arm.BetweenWristCuff | Drone Arm Link | tree |
| engine | Flavor | FactionMachine.Futuristic.Link.Arm.BetweenWristCuff | Variant: BetweenWristCuff | local |
| engine | Function | FactionMachine.Futuristic.Link.Arm.BetweenWristCuff | *(blank)* | blank |
| engine | Name | FactionMachine.Futuristic.Link.Arm.BetweenElbowCuff | Drone Arm Link | tree |
| engine | Flavor | FactionMachine.Futuristic.Link.Arm.BetweenElbowCuff | Variant: BetweenElbowCuff | local |
| engine | Function | FactionMachine.Futuristic.Link.Arm.BetweenElbowCuff | *(blank)* | blank |
| engine | Name | FactionMachine.Futuristic.Link.Arm.WristToCollar | Drone Arm Link | tree |
| engine | Flavor | FactionMachine.Futuristic.Link.Arm.WristToCollar | Variant: WristToCollar | local |
| engine | Function | FactionMachine.Futuristic.Link.Arm.WristToCollar | *(blank)* | blank |
| engine | Name | FactionMachine.Futuristic.Link.Arm.BoxTie | Drone Arm Link | tree |
| engine | Flavor | FactionMachine.Futuristic.Link.Arm.BoxTie | Variant: BoxTie | local |
| engine | Function | FactionMachine.Futuristic.Link.Arm.BoxTie | *(blank)* | blank |
| engine | Name | FactionMachine.Futuristic.Link.Arm.ElbowTie | Drone Arm Link | tree |
| engine | Flavor | FactionMachine.Futuristic.Link.Arm.ElbowTie | Variant: Elbow Tie | local |
| engine | Function | FactionMachine.Futuristic.Link.Arm.ElbowTie | *(blank)* | blank |
| engine | Name | FactionMachine.Futuristic.Link.Leg.BetweenAnkleCuff | Drone Leg Link | tree |
| engine | Flavor | FactionMachine.Futuristic.Link.Leg.BetweenAnkleCuff | Variant: BetweenAnkleCuff | local |
| engine | Function | FactionMachine.Futuristic.Link.Leg.BetweenAnkleCuff | *(blank)* | blank |
| engine | Name | FactionMachine.Futuristic.Link.Leg.TiedAnkle | Drone Leg Link | tree |
| engine | Flavor | FactionMachine.Futuristic.Link.Leg.TiedAnkle | Variant: Tied Ankle | local |
| engine | Function | FactionMachine.Futuristic.Link.Leg.TiedAnkle | *(blank)* | blank |
| engine | Name | FactionMachine.Futuristic.Link.Leg.BetweenThighCuff | Drone Leg Link | tree |
| engine | Flavor | FactionMachine.Futuristic.Link.Leg.BetweenThighCuff | Variant: BetweenThighCuff | local |
| engine | Function | FactionMachine.Futuristic.Link.Leg.BetweenThighCuff | *(blank)* | blank |
| engine | Name | FactionMachine.Futuristic.Link.Leg.TiedThigh | Drone Leg Link | tree |
| engine | Flavor | FactionMachine.Futuristic.Link.Leg.TiedThigh | Variant: TiedThigh | local |
| engine | Function | FactionMachine.Futuristic.Link.Leg.TiedThigh | *(blank)* | blank |
| engine | Name | — | Drone Collar | local |
| engine | Flavor | — | Light | local |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Collar | local |
| engine | Flavor | — | Heavy | local |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Arm Cuff | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Elbow Cuff | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Wrist Cuff | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Waist Cuff | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Thigh Cuff | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Ankle Cuff | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Harness | local |
| engine | Flavor | — | Base game: a control harness. | engine |
| engine | Function | — | Base game: controlled. | engine |
| engine | Name | — | *(blank)* | blank |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Full Color\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Full Color\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Dark\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Dark\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Full Color\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Dark\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Full Color\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Full Color\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Dark\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Dark\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Dark\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Full Color\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Full Color\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Full Color\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Dark\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Full Color\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Full Color\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Full Color\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Dark\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Dark\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Full Color\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Dark\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Dark\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Full Color\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Full Color\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Full Color\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Dark\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Dark\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Full Color\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Dark\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Dark\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Full Color\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Dark\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Full Color\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Dark\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Full Color\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Full Color\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Dark\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Dark\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Dark\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Full Color\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Dark\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Full Color\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Full Color\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Dark\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Dark\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Full Color\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Full Color\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Dark\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Dark\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Full Color\nLevel: 4 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Full Color\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Dark\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Dark\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Full Color\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Full Color\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Mask\nMode: Full Color\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle\nMode: Full Color\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Goggle | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Dark\nLevel: 3 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Dark\nLevel: 2 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Goggle | Drone Visor | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Goggle | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Goggle | Visor Type: Goggle\nVersion: Blindfold\nMode: Full Color\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Dark\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Dark\nLevel: 1 | local |
| engine | Name | FactionMachine.Futuristic.GlassVisor.Mask | Drone Mask | tree |
| engine | Flavor | FactionMachine.Futuristic.GlassVisor.Mask | *(blank)* | blank |
| engine | Function | FactionMachine.Futuristic.GlassVisor.Mask | Visor Type: Mask\nVersion: Over Mask\nMode: Dark\nLevel: 4 | local |
| engine | Name | — | Mask Mount | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | A mount for attaching visors and masks. Can be used as a base for more powerful variants. | local |
| engine | Name | — | Drone Muffler | local |
| engine | Flavor | — | NonMuffler | local |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Muffler | local |
| engine | Flavor | — | Ball | local |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Muffler | local |
| engine | Flavor | — | BigBall | local |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Plug | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Harness | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | Simple Harness | local |
| engine | Name | — | Drone Harness | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | Advance Harness | local |
| engine | Name | — | Drone Harness | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | Panel Harness | local |
| engine | Name | — | Drone Harness | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | Panel Harness With Port | local |
| engine | Name | — | Drone Muzzle | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | Metal Muzzle 1 | local |
| engine | Name | — | Drone Muzzle | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | Metal Muzzle 2 | local |
| engine | Name | — | Drone Muzzle | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | OTN Muzzle 1 | local |
| engine | Name | — | Drone Muzzle | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | OTN Muzzle 2 | local |
| engine | Name | — | Drone Muzzle | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | Transparent Muzzle 1 | local |
| engine | Name | — | Drone Muzzle | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | Transparent Muzzle 2 | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":0,"OpaqueLevel":2,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":0,"OpaqueLevel":2,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":0,"OpaqueLevel":1,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":2,"OpaqueLevel":2,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":2,"OpaqueLevel":3,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":0,"OpaqueLevel":3,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":2,"OpaqueLevel":4,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":2,"OpaqueLevel":4,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":2,"OpaqueLevel":1,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":2,"OpaqueLevel":1,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":2,"OpaqueLevel":1,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":0,"OpaqueLevel":1,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":0,"OpaqueLevel":1,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":0,"OpaqueLevel":1,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":0,"OpaqueLevel":4,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":2,"OpaqueLevel":1,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":0,"OpaqueLevel":2,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":2,"OpaqueLevel":2,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":2,"OpaqueLevel":2,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":2,"OpaqueLevel":3,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":2,"OpaqueLevel":3,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":2,"OpaqueLevel":4,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":0,"OpaqueLevel":4,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":0,"OpaqueLevel":4,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":0,"OpaqueLevel":3,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":2,"OpaqueLevel":2,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":0,"OpaqueLevel":2,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":2,"OpaqueLevel":3,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":0,"OpaqueLevel":3,"Dimmed":true} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":0,"OpaqueLevel":3,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":false,"Layer":2,"OpaqueLevel":4,"Dimmed":false} | local |
| engine | ModelName | — | Boids \| Futuristic Visor HUD: {"UseFactionColor":true,"Layer":0,"OpaqueLevel":4,"Dimmed":true} | local |
| engine | Name | — | Drone Earphone | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Heel | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Sleeve | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Wire Cuff | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| engine | Name | — | Drone Long Mitten | local |
| engine | Flavor | — | *(blank)* | blank |
| engine | Function | — | *(blank)* | blank |
| mod | Dialog | Common.Session.Unversioned.Title | Boids \| Compatibility Warning | local |
| mod | Dialog | Common.Session.Unversioned.Body | Boids cannot determine mod version in this save. | local |
| mod | Dialog | Common.Session.Unversioned.Cause | This save might have been created either without Boidsor with an old version of it. | local |
| mod | Dialog | Common.Session.Unversioned.Consequence | If you choose to load anyway, this mod would attempt initialization as if no version of it has been installed. | local |
| mod | Dialog | Common.Session.Unversioned.Corruption | Loading a save with incompatible mod version may break the game and permanently corrupt your save. | local |
| mod | Dialog | Common.Session.Unversioned.LoadAnyway | Load anyway | local |
| mod | Dialog | Common.Session.Unversioned.Cancel | Cancel | local |
| mod | Dialog | Common.Session.Refused.Title | Boids \| Compatibility Warning | local |
| mod | Dialog | Common.Session.Refused.Body | This save was written by a release of Boids that this build cannot carry forward. | local |
| mod | Dialog | Common.Session.Refused.Change | The change it needs is a breaking one, so loading it would leave the game reading a shape it no longer understands. | local |
| mod | Dialog | Common.Session.Refused.Consequence | The save has not been loaded and has not been modified: nothing above this message has been written to it. Returning to the menu is the safe way out, and reinstalling the release that wrote the save is the way to continue it. | local |
| mod | Dialog | Common.Session.Refused.ReturnToMenu | Return to main menu | local |
| mod | Dialog | Common.Session.Refused.Stay | Stay here | local |
| mod | StatusLine | Common.Session.Declined | This save was written before the mod recorded which release made it. It has been left unloaded; confirm the warning to load it anyway. | local |
| mod | StatusLine | Common.Session.Accepted | This save predates the mod's release record. It is being loaded as though it had never carried any of the mod's equipment or control state. | local |
| mod | StatusLine | Common.Session.RefusalReported | This save cannot be loaded by this release of the mod: | local |
| mod | Message | Common.Session.UnknownRootReason | This save was written by a newer release than the one installed. | local |
| engine | VariantPrefix | — | Machine Prime | local |
| mod | Message | FactionMachine.MachinePrime.Gag.Inflates | The muffler in your mouth inflates. | local |
| mod | Message | FactionMachine.MachinePrime.Gag.Deflates | The muffler in your mouth deflates. | local |
| mod | Message | FactionMachine.MachinePrime.Visor.Dims | Your hard light visor dims, and your vision becomes more restricted. | local |
| mod | Message | FactionMachine.MachinePrime.Visor.Clears | Your hard light visor clears up, and your vision becomes less restricted. | local |
| engine | Category | FactionMachine.Start.SensorySet1 | Drone Sensory Set1 | local |
| engine | Category | FactionMachine.Start.SensorySet2 | Drone Sensory Set2 | local |
| engine | StartPerkName | FactionMachine.Start.DroneToys | Drone Toys | local |
| engine | StartPerkDescription | FactionMachine.Start.DroneToys.Description | *(blank)* | blank |
