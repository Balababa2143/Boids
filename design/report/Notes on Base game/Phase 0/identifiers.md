# Identifiers and the two shapes of an item

> How a name is minted on each side of the boundary — the game counts, the mod hashes — what a
> generated name is actually used for, and the distinction between a restraint *definition* and a
> worn *item* that decides whether reading `data` off a lookup can work at all.

Game sites are relative to `kd-structured/KinkyDungeon/Game/src/`; dependency sites are relative to
the repository root. The shorthand is in the [phase notes](AGENTS.md).

---

## The game derives nothing; it counts

**[read]** The base game has no hashing step anywhere: a grep for `uuid` across its `Game/src` tree
returns nothing. What it calls a "variant" is a **runtime key built by concatenation**, minted in
`KDMorphToInventoryVariant` (`item/KinkyDungeonInventory.ts:3505` and `:3521-3531`):

```ts
		let newname = prefix + variant.template + KinkyDungeonGetItemID() + (curse ? curse : "");
…
		if (item.type == LooseRestraint) {
			item.name = newname;
			…
		} else {
			item.name = variant.template;
			item.curse = curse;
			…
			item.inventoryVariant = newname;
		}
```

**[read]** `KinkyDungeonGetItemID()` is a **counter**, not a derivation — it hands out a fresh number
per session. The same name formula appears at `item/KinkyDungeonInventory.ts:3660`, `:3694` and
`:3741`.

> **[inferred] So a generated name is not stable across sessions, and was never meant to be.** It
> identifies *this item instance in this save*, and the save carries the table that maps it back to a
> template: `save.inventoryVariants = KinkyDungeonRestraintVariants;`
> (`base/KinkyDungeon.ts:7251`). That is a materially different contract from a derived identifier,
> and the difference is the reason the mod needed a scheme of its own rather than borrowing this one.

**[read] The table is the name's authority.** `let KinkyDungeonRestraintVariants: Record<string, KDRestraintVariant> = {};`
(`item/KinkyDungeonInventory.ts:119`), and every resolution prefers the variant key over the name —
`KDRestraint` (`restraint/KinkyDungeonRestraints.ts:272`):

```ts
function KDRestraint(item: Named): restraint {
	if (KinkyDungeonRestraintVariants[item.inventoryVariant || item.name]) return KinkyDungeonRestraintsCache.get(KinkyDungeonRestraintVariants[item.inventoryVariant || item.name].template);
	return KinkyDungeonRestraintsCache.get(item.name);
}
```

**[read] One sentence, because it is worth having exactly right:** the key of
`KinkyDungeonRestraintVariants` is a generated per-instance string held in `item.name` for a **loose**
item (where `name` *is* the key) but in `item.inventoryVariant` for a **worn** one (where `name`
stays the template name); every lookup resolves through `item.inventoryVariant || item.name` and then
follows the variant's `.template` back to the definition.

---

## The mod's side: `uuidv5(name, namespace)`

**[read]** The derivation used in this repository is
`src/KDExtension/Variant/Common.ts:40`:

```ts
        uuidv5(JSON.stringify(isImmutable(variantKey) ? variantKey.toJS() : variantKey), BaseId)
```

**[read] The argument order is the trap, and the failure is loud rather than quiet.** `uuid`'s
exported signature is `v5(value, namespace, buf?, offset?)`
(`node_modules/uuid/dist-node/v5.js:4`), so the value is first and the namespace second. Only the
namespace is validated — `node_modules/uuid/dist-node/v35.js:15` runs it through `parse()`, and
`node_modules/uuid/dist-node/parse.js:3` throws on anything that is not a well-formed UUID:

```ts
function parse(uuid) {
    if (!validate(uuid)) {
        throw TypeError('Invalid UUID');
```

There is a second guard for a namespace that is UUID-shaped but the wrong length
(`v35.js:19`, `TypeError('Namespace must be array-like (16 iterable integer values, 0-255)')`).

> **[inferred] Both arguments are `string`, so the compiler cannot help, and the runtime error names
> the wrong thing.** Swapping them produces `TypeError: Invalid UUID` pointing at the *value*, which
> reads as "my name is malformed" rather than "I put the namespace second". The mistake is cheap to
> make and its message actively misleads — which is why the order belongs in a note rather than in
> somebody's memory.

**[read] `JSON` is the canonical form of a variant key, and immutability is not.** The same line
converts an Immutable structure with `.toJS()` before stringifying, because a raw Immutable
structure serialises to its internal shape rather than to the key's fields. Two keys with the same
fields in a different order are different keys, which is the invariants guide's point rather than
this note's — but the reason it is true is here: `JSON.stringify` preserves insertion order, so the
*order of declaration* is the identity.

---

## Definition versus instance, and why it decides what you can read

**[read] There are two distinct types, and they do not have the same fields.**
`item` (`base/KDTypeDefs.ts:25`) carries:

| Field | Line | Note |
| --- | --- | --- |
| `id: number` | `:31` | per instance |
| `curse?: string` | `:35` | per instance |
| `name: string` | `:37` | for a worn item, the **template** name |
| `inventoryVariant?: string` | `:47` | the generated key, for a worn item |
| `lock?: string` | `:57` | per instance |
| `dynamicLink?: item` | `:73` | per instance |
| `data?: Record<string, any>` | `:75` | per instance, and the one mods care about |

`restraint` (`base/KDTypeDefs.ts:628`) is the **definition**: `power`, `weight`, `minLevel`,
`escapeChance`, `Group`, tags. It has none of `id`, `data`, `inventoryVariant` or `lock` — its only
overlapping name is a definition-level `curse?: string` (`base/KDTypeDefs.ts:592`).

**[read] The lookup functions all return definitions.** `KinkyDungeonGetRestraintByName`
(`restraint/KinkyDungeonRestraints.ts:3618`):

```ts
function KinkyDungeonGetRestraintByName(Name: string): restraint {
	if (KinkyDungeonRestraintsCache.size > 0) {
		// Nothing
	} else {
		KinkyDungeonRefreshRestraintsCache();
	}
	if (KinkyDungeonRestraintVariants[Name]) Name = KinkyDungeonRestraintVariants[Name].template;

	return KinkyDungeonRestraintsCache.get(Name);
}
```

and the cache it reads is built from the definition list alone
(`restraint/KinkyDungeonRestraints.ts:3607-3612`, `KinkyDungeonRefreshRestraintsCache`, populating
from `KinkyDungeonRestraints`).

**[read] The accessor that *does* return instances is `KinkyDungeonFullInventory`**
(`item/KinkyDungeonInventory.ts:563`):

```ts
function KinkyDungeonFullInventory() {
	let ret = [];
	for (let m of KinkyDungeonInventory.values()) {
		for (let item of m.values()) {
			ret.push(item);
		}
	}
	return ret;
}
```

It walks every container of `KinkyDungeonInventory` (`Map<string, Map<string, item>>`,
`player/KinkyDungeonStats.ts:241`) and returns the **live objects, not copies** — **including worn
restraints**, which is why its two siblings skip the `"restraint"` container explicitly
(`item/KinkyDungeonInventory.ts:572` and `:583`, each `if (ent[0] == Restraint) continue;`).

> **[inferred] This is the distinction that makes a "recompute and compare" check pass for the wrong
> reason.** Comparing a *definition* against anything derived from a name looks fine, because the
> definition is reachable from the name by construction — the comparison is a tautology wearing a
> check's clothes. The instance is the only object that holds both the generated name and the
> per-instance record, so it is the only one a comparison can be about. Reaching for the convenient
> lookup and getting the definition is the mistake the two accessors make easy to make.

---

## What survives on an instance

**[read]** `item.data` is written through two helpers (`restraint/KinkyDungeonRestraints.ts:7181`
and `:7197`, `KDItemDataQuery` / `KDItemDataSet`), and it is populated on the instance literal at
`restraint/KinkyDungeonRestraints.ts:5868-5880` (`KDAddRestraintForce`, `data: data`) and at
`:5163-5167` for the linked-under case.

**[read] It is carried in the save.** `KinkyDungeonGenerateSaveData` builds the inventory by shallow
copying every instance from `KinkyDungeonFullInventory()`
(`base/KinkyDungeon.ts:7279-7291`, `Object.assign({}, inv)`), so the `data` property goes with it,
and on load the saved item object itself is re-inserted (`base/KinkyDungeon.ts:7550`,
`KinkyDungeonInventoryAdd(item);`).

**[read] It survives the operations that re-add an item, and is dropped by the one that converts.**
The asymmetry is worth stating because it is not guessable:

| Operation | `data` kept? | Site |
| --- | --- | --- |
| unlink an item linked underneath | **yes** — forwarded as an argument | `restraint/KinkyDungeonRestraints.ts:6385` |
| dynamic removal, returned copy | **yes** — the returned value is a deep copy of the instance | `restraint/KinkyDungeonRestraints.ts:6240-6244` |
| morph that removes and re-adds | **yes** — passed to the equip call | `item/KinkyDungeonInventory.ts:3555-3571` |
| link a new item under | **yes** — accepted and forwarded | `restraint/KinkyDungeonRestraints.ts:6325`, `:6331` |
| removal that becomes a **loose inventory** item | **no** — a fixed field set is rebuilt, and `data` is not in it | `restraint/KinkyDungeonRestraints.ts:6209` and `:6084` |

> **[inferred] The loose-item case is where an instance's private record quietly disappears.** The
> rebuilt literal carries `name`, `id`, `type`, `events` and `quantity` — and, conditionally,
> `inventoryVariant`. Anything a mod stored in `data` is gone when the item leaves the body that way,
> with no error and no log. A design that puts control state in `data` is therefore putting it
> somewhere that has a defined way to evaporate.

---

## How to re-derive this

Read-only.

- **That the game hashes nothing** — search its source for the library name and for the call:
  `Select-String -Path (Get-ChildItem -Recurse -File -Filter *.ts kd-structured/KinkyDungeon/Game/src).FullName -Pattern 'uuid'`
  Expect no matches inside `Game/src`, and the mod's own calls under `src/`.
- **The name formula** — read `item/KinkyDungeonInventory.ts:3500-3532`. The concatenation and the
  loose-versus-worn branch are both in that block.
- **The two types** — read `base/KDTypeDefs.ts:25-75` (`item`) and `:628-660` (`restraint`), then
  diff the field lists. The absence of `data` and `inventoryVariant` from `restraint` is the point.
- **Which accessor returns what** — read `restraint/KinkyDungeonRestraints.ts:3607-3627` for the
  definition path and `item/KinkyDungeonInventory.ts:563-594` for the instance path, in one sitting.
- **The `uuid` failure** — read `node_modules/uuid/dist-node/v35.js:14-19` and
  `node_modules/uuid/dist-node/parse.js:2-5`. Two lines each, and they settle the argument order and
  the error text.
- **The `data` asymmetry** — compare the four "kept" sites in the table above with the two rebuilt
  literals at `restraint/KinkyDungeonRestraints.ts:6209` and `:6084`.

## What this note does not cover

- **The mod's own identifier scheme** — the root UUID, the release table, and why a name may not be
  renamed. That is [`docs/guide/saves.md`](../../../../docs/guide/saves.md), and it is normative.
- **The GUID-uniqueness requirement and its gate.** Mod-facing, and in the guide.
- **`KDRestraintVariant`'s own fields** — what a variant record holds beyond `template`. Phase 0
  needed only the mapping, not the record.
