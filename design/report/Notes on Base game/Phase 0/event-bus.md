# The event bus

> One send function, thirteen maps, four different handler signatures, and two arrival points on
> the load path that are named almost identically and sit on opposite sides of the decode.

Sites are relative to `kd-structured/KinkyDungeon/Game/src/`; the shorthand is in the
[phase notes](AGENTS.md).

---

## One send, and what it actually does

**[read]** `effect/KinkyDungeonEvents.ts:65`:

```ts
function KinkyDungeonSendEvent(Event: string, data: any, forceSpell?: spell, forceWeapon?: item, mapData?: KDMapDataType) {
	KinkyDungeonSendMagicEvent(Event, data, forceSpell);
	KinkyDungeonSendWeaponEvent(Event, data, forceWeapon);
	KinkyDungeonSendInventorySelectedEvent(Event, data);
	KinkyDungeonSendInventoryIconEvent(Event, data);
	KinkyDungeonSendInventoryEvent(Event, data);
	if (data.NPCRestraintEvents) KDSendNPCRestraintEvent(Event, data);
	KinkyDungeonSendBulletEvent(Event, data.bullet, data);
	KinkyDungeonSendBuffEvent(Event, data);
	KinkyDungeonSendOutfitEvent(Event, data);
	KinkyDungeonSendEnemyEvent(Event, data, mapData);
	KinkyDungeonHandleGenericEvent(Event, data);
	KinkyDungeonHandleListenerEvent(Event, data);
	KinkyDungeonSendAltEvent(Event, data);
	KinkyDungeonSendFacilityEvent(Event, data);
}
```

Everything is **synchronous, unconditional and in that fixed order**. There is no unsubscribe, no
error isolation between the maps, and no return value. `data.bullet` is read at line 73, so `data`
is never optional even for an event that has no bullet — **[read]** the call is a plain property
read that would throw on `undefined`.

> **[inferred] The consequence a subscriber has to internalise:** by the time your handler runs, the
> game has already offered this event to a dozen other audiences, and some of them may have run
> first. A handler that expects to be the first or only writer is making an assumption the bus does
> not support.

---

## Two layers with confusingly similar names

The dispatchers and the invokers are different things, and only the invokers decide which registered
handler runs:

| Layer | Named | Job |
| --- | --- | --- |
| **dispatcher** | `KinkyDungeonSend*Event` | walks the live game objects — restraints, spells, buffs, enemies, bullets — and finds every place carrying an event whose `trigger` matches |
| **invoker** | `KinkyDungeonHandle*Event` | looks the handler up in the `KDEventMap*` table and calls it |

**[read]** An invoker is uniform in shape; `effect/KinkyDungeonEvents.ts:9428` is one:

```ts
function KinkyDungeonHandleWeaponEvent(Event: string, e: KinkyDungeonEvent, weapon: weapon, data: any) {
	if (Event === e.trigger && KDEventMapWeapon[e.dynamic ? "dynamic" : Event] && KDEventMapWeapon[e.dynamic ? "dynamic" : Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapWeapon[e.dynamic ? "dynamic" : Event][e.type](e, weapon, data);
	}
}
```

Three things fall out of that line, and all three are easy to miss:

1. **The table is keyed twice**: `[trigger][type]`. The `type` is the string a registrant chose, and
   it is the dispatch key — which is why a duplicate `type` does not overwrite quietly in the way a
   map would; it is *the* identity of the handler.
2. **`e.dynamic` redirects the lookup** to a `"dynamic"` bucket, regardless of the trigger.
3. **Every handler is gated by `KDCheckCondition(e, data)`** before it is called — a shared
   predicate over the event and the payload.

---

## The handler signatures do not agree

**[read]** This is the trap that costs an afternoon: a handler written for one map will *silently*
misread its arguments on another.

| Map | Signature the handler receives | Site of the invoker |
| --- | --- | --- |
| Generic | `(e, data)` where `e` is the **registration key** | `effect/KinkyDungeonEvents.ts:13878` |
| Inventory | `(e, item, data, slot?)` | `item/KinkyDungeonInventory.ts:2356` |
| InventorySelected | `(e, item, data)` | `item/KinkyDungeonInventory.ts:2451` |
| InventoryIcon | `(e, item, data)` | `item/KinkyDungeonInventory.ts:2463` |
| Magic | `(e, spell, data)` | `magic/KinkyDungeonMagic.ts:2477` |
| Weapon | `(e, weapon, data)` | `fight/KinkyDungeonFight.ts:3614` |
| Buff | `(e, buff, entity, data)` — four | `effect/KinkyDungeonBuffs.ts:58` |
| Outfit | `(e, outfit, data)` | `player/KinkyDungeonDress.ts:1165` |
| Enemy | `(e, enemy, data)` | `enemy/KinkyDungeonEnemies.ts:8595` |
| Bullet | `(e, b, data)` | `fight/KinkyDungeonFight.ts:3657` |
| Alt | `(e, alt, data)` | `effect/KinkyDungeonEvents.ts:14171` |
| Facility | `(e, fac, data)` | `effect/KinkyDungeonEvents.ts:14214` |
| Listener | `(listener, data, index)` and a truthy return **retires it** | `effect/KinkyDungeonEvents.ts:13889` |

**[read] The generic map is the outlier in two ways.** Its dispatch passes the handler's own
registration key as the first argument and never the event name — the outer `Event` is used only for
the lookup (`effect/KinkyDungeonEvents.ts:13878-13884`):

```ts
function KinkyDungeonHandleGenericEvent(Event: string, data: any) {
	if (!KDMapHasEvent(KDEventMapGeneric, Event)) return;
	if (KDEventMapGeneric[Event] && KDEventMapGeneric[Event]) {
		for (let e of Object.keys(KDEventMapGeneric[Event]))
			KDEventMapGeneric[Event][e](e, data);
	}
}
```

**[read] And a truthy return is *ignored* there — but means "remove me" in the listener map.** The
listener dispatch tests it (`effect/KinkyDungeonEvents.ts:13899`), and the map carries the comment
`/** Return true to end the listener */` at `:12266`. So the same `return true` in a handler is a
no-op on one map and a self-unsubscribe on another.

`KDMapHasEvent` is a one-liner at `effect/KinkyDungeonEvents.ts:61`:
`return map[event] != undefined;`.

---

## The maps are a mod-writable global registry

**[read]** All thirteen are plain object literals at module scope, typed
`Record<string, Record<string, fn>>`, declared with `let` (only `KDEventMapBuff` at
`effect/KinkyDungeonEvents.ts:3805` is `const`). The generic one is
`effect/KinkyDungeonEvents.ts:12286`:

```ts
let KDEventMapGeneric: Record<string, Record<string, (e: string, data: any) => void>> = {
```

**[read] The game ships an entry point for exactly one purpose, and never uses it itself.**
`effect/KinkyDungeonEvents.ts:14264`:

```ts
function KDAddEvent(map: any, trigger: any, type: any, code: any) {
	if (!map) {
		console.log("Error adding " + trigger + ", " + type);
	}
	if (!map[trigger]) {
		map[trigger] = {};
	}
	map[trigger][type] = code;
}
```

`KDAddEvent` has **no call site inside `Game/src`**. The only writers of these tables are the
game's own module-scope literals and mods. That is the whole extension idiom on this seam: the table
is a mutable global, and registration is a property assignment.

> **[inferred] Which makes the `type` string a global namespace, not a local one.** Two mods that
> both register `"tick"` under `KDEventMapGeneric` do not merge — the second assignment replaces the
> first, silently, with no throw and no log. A globally unique key (a GUID, say) is not fastidiousness
> here; it is the only thing standing between two mods and a lost handler.

---

## The two arrival points on the load path

**[read]** They are named almost identically and they sit on opposite sides of the decode
(`base/KinkyDungeon.ts`), which is the single most consequential fact about either of them:

| Event | Site | What is already true |
| --- | --- | --- |
| `beforeLoadGame` | `base/KinkyDungeon.ts:7368` | the save string is **still compressed** — the decode is the very next statement (`:7369-7371`) |
| `afterLoadGame` | `base/KinkyDungeon.ts:7725` | the save has been parsed, `KDGameData` replaced (`:7434-7436`), and the stats recalculated (`:7724`) |

**[read]** Both names are declared in the same place as the event map's own documentation
(`effect/KinkyDungeonEvents.ts:13803` and `:13806`), and both entries are empty — they are arrival
points with no built-in behaviour.

> **[inferred] A version gate cannot live on `beforeLoadGame`.** The label suggests "before the load,
> when I can still refuse it", and it does fire before the load. But the save has not been decoded at
> that point, so there is nothing to inspect: the handler would have to decode the string itself,
> which means duplicating a step the very next line is about to take. `afterLoadGame` has the
> contents but is past every decision. That leaves wrapping the loader function — and the fact that
> both reasonable-sounding event names are wrong for the job is not visible from either name.

---

## How to re-derive this

Read-only.

- **The bus and its fan-out** — read `effect/KinkyDungeonEvents.ts:65-81`, then follow each
  `Send*Event` name to its own file and read the invoker beside it. The signature table above is the
  result of doing that for all thirteen.
- **The handler maps** —
  `Select-String -Path kd-structured/KinkyDungeon/Game/src/effect/KinkyDungeonEvents.ts -Pattern 'KDEventMap\w+:'`
  gives the declarations; the one that matters for a cross-cutting handler is `KDEventMapGeneric`.
- **That nothing in the game calls `KDAddEvent`** —
  `Select-String -Path kd-structured/KinkyDungeon/Game/src -Include *.ts -Recurse -Pattern 'KDAddEvent'`
  Expect the definition and no callers.
- **The load-path pair** — read `base/KinkyDungeon.ts:7366-7372` and `:7724-7726`, one after the
  other, and the ordering is plain.

## What this note does not cover

- **The `calc*` family.** These are the events whose `data` object a handler mutates in place, and
  they behave differently from the dispatch tables above — they are a distinct seam family with its
  own algebra. A later phase traced them; this note records only that they are not this mechanism.
- **`KDEventMapListener`**, beyond the truthy-return difference and the fact that
  `KDGameData.ListenerIndex` is a persisted index of listeners
  (`effect/KinkyDungeonEvents.ts:13889`).
- **The item event bubbling problem** — that an item's events are spread onto linked items, so a
  handler must check whether the item it was handed is the event's *source*. That is a property of
  the inventory dispatch (`item/KinkyDungeonInventory.ts:2337`) and it is named here only so the
  next reader knows it exists.
