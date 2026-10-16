[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Item](../../../index.md) / [Gag](../index.md) / MorphOnSpeechRateUpdate

# Variable: MorphOnSpeechRateUpdate

> `const` **MorphOnSpeechRateUpdate**: `object`

Defined in: src/FactionMachine/MachinePrime/Item/Gag.ts:147

The morph handler every muffler carries: on a `Speech` rate update it re-models the item, and
reports the change with text and sound.

The model it moves to is the item's **own declared appearance**, which does not change when the
rate does — so what this handler actually tracks is *whether the declared look is the one being
drawn*, and the two can drift apart when the item is mutated by something else.

Appearance is banded rather than continuous — below 0.33 the muffler carries no ball, above 0.66
the big one, and in between the small one — so the model changes only at those two crossings.
**The declaration is still continuous**: the bands are a property of this family's three models
rather than of the model, and a family with more models would band them differently.

The handler is registered here at module evaluation, so its GUID has to stay unique across the game
and every other mod, and `inheritLinked` puts the event on items linked under the host as well.

## Type Declaration

### addBind?

> `optional` **addBind?**: `boolean`

### always?

> `optional` **always?**: `boolean`

### aoe?

> `optional` **aoe?**: `number`

### attackerType?

> `optional` **attackerType?**: `string`

For Dynamic events there is no easy way of getting the 'attacker' of a targeted event,
for example bulletHitEnemy or playerAttack
attackerType specifies the key in the event data that leads to an entity which is responsible for the event

Certain constants apply:
KDPLAYER - the current player entity
KDGUARD - the current jail guard
KDLEASHER - the current leasher
KDNEAREST - the nearest entity to the player
KDNEARESTHOSTILE - the nearest hostile enemy

### bgcolor?

> `optional` **bgcolor?**: `string`

### bind?

> `optional` **bind?**: `number`

### bindcrit?

> `optional` **bindcrit?**: `number`

### bindEff?

> `optional` **bindEff?**: `number`

### bindType?

> `optional` **bindType?**: `string`

### buff?

> `optional` **buff?**: `any`

### buffSprite?

> `optional` **buffSprite?**: `string`

### buffType?

> `optional` **buffType?**: `string`

### buffTypes?

> `optional` **buffTypes?**: `string`[]

### bullet?

> `optional` **bullet?**: `boolean`

### chance?

> `optional` **chance?**: `number`

### cloneTags?

> `optional` **cloneTags?**: `string`[]

### color?

> `optional` **color?**: `string`

### condition?

> `optional` **condition?**: `string`

Like a prereq, but always active even if the event doesnt specify

### cooldown?

> `optional` **cooldown?**: `Record`\<`string`, `number`\>

Vibe

### cost?

> `optional` **cost?**: `number`

### count?

> `optional` **count?**: `number`

### crit?

> `optional` **crit?**: `number`

### curse?

> `optional` **curse?**: `boolean`

This is from a temporary event curse

### cursetype?

> `optional` **cursetype?**: `string`

### damage?

> `optional` **damage?**: `string`

### damageTrigger?

> `optional` **damageTrigger?**: `string`

### delayedOrder?

> `optional` **delayedOrder?**: `number`

This is an integer. if an event has this the game skips it and comes back after executing everything else.
Best to keep it low for performance reasons, if in a draw loop.

### desc?

> `optional` **desc?**: `string`

### desireMult?

> `optional` **desireMult?**: `number`

### dist?

> `optional` **dist?**: `number`

### distract?

> `optional` **distract?**: `number`

### distractEff?

> `optional` **distractEff?**: `number`

### distStealth?

> `optional` **distStealth?**: `number`

Distance having to do with stealth

### duration?

> `optional` **duration?**: `number`

### dynamic?

> `optional` **dynamic?**: `boolean`

A dynamic event is specified as 'dynamic' and is specified under ItemMap.dynamic
(replace ItemMap with the event map you need)
This lets you use the same code for multiple events, which is risky but convenient

### edgeOnly?

> `optional` **edgeOnly?**: `boolean`

Vibe

### element?

> `optional` **element?**: `string`

### enemy?

> `optional` **enemy?**: `string`

### enemyDialogue?

> `optional` **enemyDialogue?**: `string`

Dialogue key an enemy should send

### energyCost?

> `optional` **energyCost?**: `number`

### escapeMethod?

> `optional` **escapeMethod?**: `string`

### filter?

> `optional` **filter?**: `LayerFilter`

### filterTags?

> `optional` **filterTags?**: `string`[]

Generic filtered tags

### frequencyMax?

> `optional` **frequencyMax?**: `number`

### frequencyMin?

> `optional` **frequencyMin?**: `number`

### frequencyStep?

> `optional` **frequencyStep?**: `number`

### frequencyTag?

> `optional` **frequencyTag?**: `string`

### humanOnly?

> `optional` **humanOnly?**: `boolean`

Whether or not the event only triggers on human targets

### inheritLinked

> **inheritLinked**: `true` = `true`

### keepLock?

> `optional` **keepLock?**: `boolean`

### kind?

> `optional` **kind?**: `string`

### limit?

> `optional` **limit?**: `number`

Limit of whatever thius event modifies

### list?

> `optional` **list?**: `string`[]

List of restraints or other string params

### lock?

> `optional` **lock?**: `string`

### melee?

> `optional` **melee?**: `boolean`

### msg?

> `optional` **msg?**: `string`

### mult?

> `optional` **mult?**: `number`

### noLeash?

> `optional` **noLeash?**: `boolean`

Won't trigger while being leashed

### offhand?

> `optional` **offhand?**: `boolean`

### offhandonly?

> `optional` **offhandonly?**: `boolean`

### original?

> `optional` **original?**: `string`

### player?

> `optional` **player?**: `boolean`

### power?

> `optional` **power?**: `number`

### prereq?

> `optional` **prereq?**: `string`

Specifies a prereq that the event itself can use

### prevSlowLevel?

> `optional` **prevSlowLevel?**: `number`

### punishComponent?

> `optional` **punishComponent?**: `string`

triggers from this component

### removeOnUncurse?

> `optional` **removeOnUncurse?**: `boolean`

### requiredTag?

> `optional` **requiredTag?**: `string`

A required enemy tag

### requireEnergy?

> `optional` **requireEnergy?**: `boolean`

### requireFlag?

> `optional` **requireFlag?**: `string`

### requireTags?

> `optional` **requireTags?**: `string`[]

Generic required tags

### restraint?

> `optional` **restraint?**: `string`

### sfx?

> `optional` **sfx?**: `string`

### source?

> `optional` **source?**: `number`

### spell?

> `optional` **spell?**: `string`

Spell to cast at the target

### sprite?

> `optional` **sprite?**: `string`

### StruggleType?

> `optional` **StruggleType?**: `string`

Type of struggle that this event triggers on

### stun?

> `optional` **stun?**: `number`

Stun duration

### subMult?

> `optional` **subMult?**: `number`

Chance to trigger is 1+(submissive % * subMult)

### tags?

> `optional` **tags?**: `string`[]

### targetType?

> `optional` **targetType?**: `string`

For Dynamic events there is no easy way of getting the 'target' of a targeted event,
for example bulletHitEnemy or playerAttack
targetType specifies the key in the event data that leads to an entity target

Certain constants apply:
KDPLAYER - the current player entity
KDGUARD - the current jail guard
KDLEASHER - the current leasher
KDNEAREST - the nearest entity to the player
KDNEARESTHOSTILE - the nearest hostile enemy

### threshold?

> `optional` **threshold?**: `number`

### time?

> `optional` **time?**: `number`

### trigger

> **trigger**: [`DimensionRateUpdate`](../../../../Coordinator/namespaces/SensoryControl/enumerations/EventKeys.md#dimensionrateupdate)

### trim?

> `optional` **trim?**: `boolean`

### type

> **type**: `string`

### variance?

> `optional` **variance?**: `number`

### vol?

> `optional` **vol?**: `number`

### warningchance?

> `optional` **warningchance?**: `number`

Chance the player will get warned instead of punshed
