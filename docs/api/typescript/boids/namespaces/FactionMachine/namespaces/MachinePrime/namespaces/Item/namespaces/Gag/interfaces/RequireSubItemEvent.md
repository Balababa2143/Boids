[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Item](../../../index.md) / [Gag](../index.md) / RequireSubItemEvent

# Interface: RequireSubItemEvent

Defined in: src/FactionMachine/MachinePrime/Item/Gag.ts:297

The event behind `RequireMuffler`: a restraint that exposes a socket asks for a sub-item to be
linked under it the moment it is applied.

`Socket` is the tag looked for on the applied item, or already on the player; `ItemTag` is the
player tag that means a sub-item is installed and suppresses a second one; and `SubItem` is the
variant to link under the host. It is the extension point of this module — any machine-prime
restraint can carry one of these, with its own socket and its own sub-item, instead of a muffler.

## Extends

- `KinkyDungeonEvent`

## Properties

### addBind?

> `optional` **addBind?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1877

#### Inherited from

`KinkyDungeonEvent.addBind`

***

### always?

> `optional` **always?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1842

#### Inherited from

`KinkyDungeonEvent.always`

***

### aoe?

> `optional` **aoe?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1871

#### Inherited from

`KinkyDungeonEvent.aoe`

***

### attackerType?

> `optional` **attackerType?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1839

For Dynamic events there is no easy way of getting the 'attacker' of a targeted event,
for example bulletHitEnemy or playerAttack
attackerType specifies the key in the event data that leads to an entity which is responsible for the event

Certain constants apply:
KDPLAYER - the current player entity
KDGUARD - the current jail guard
KDLEASHER - the current leasher
KDNEAREST - the nearest entity to the player
KDNEARESTHOSTILE - the nearest hostile enemy

#### Inherited from

`KinkyDungeonEvent.attackerType`

***

### bgcolor?

> `optional` **bgcolor?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1891

#### Inherited from

`KinkyDungeonEvent.bgcolor`

***

### bind?

> `optional` **bind?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1858

#### Inherited from

`KinkyDungeonEvent.bind`

***

### bindcrit?

> `optional` **bindcrit?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1860

#### Inherited from

`KinkyDungeonEvent.bindcrit`

***

### bindEff?

> `optional` **bindEff?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1843

#### Inherited from

`KinkyDungeonEvent.bindEff`

***

### bindType?

> `optional` **bindType?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1876

#### Inherited from

`KinkyDungeonEvent.bindType`

***

### buff?

> `optional` **buff?**: `any`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1879

#### Inherited from

`KinkyDungeonEvent.buff`

***

### buffSprite?

> `optional` **buffSprite?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1882

#### Inherited from

`KinkyDungeonEvent.buffSprite`

***

### buffType?

> `optional` **buffType?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1872

#### Inherited from

`KinkyDungeonEvent.buffType`

***

### buffTypes?

> `optional` **buffTypes?**: `string`[]

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1868

#### Inherited from

`KinkyDungeonEvent.buffTypes`

***

### bullet?

> `optional` **bullet?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1873

#### Inherited from

`KinkyDungeonEvent.bullet`

***

### chance?

> `optional` **chance?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1878

#### Inherited from

`KinkyDungeonEvent.chance`

***

### cloneTags?

> `optional` **cloneTags?**: `string`[]

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1793

#### Inherited from

`KinkyDungeonEvent.cloneTags`

***

### color?

> `optional` **color?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1889

#### Inherited from

`KinkyDungeonEvent.color`

***

### condition?

> `optional` **condition?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1886

Like a prereq, but always active even if the event doesnt specify

#### Inherited from

`KinkyDungeonEvent.condition`

***

### cooldown?

> `optional` **cooldown?**: `Record`\<`string`, `number`\>

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1895

Vibe

#### Inherited from

`KinkyDungeonEvent.cooldown`

***

### cost?

> `optional` **cost?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1808

#### Inherited from

`KinkyDungeonEvent.cost`

***

### count?

> `optional` **count?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1856

#### Inherited from

`KinkyDungeonEvent.count`

***

### crit?

> `optional` **crit?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1859

#### Inherited from

`KinkyDungeonEvent.crit`

***

### curse?

> `optional` **curse?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1813

This is from a temporary event curse

#### Inherited from

`KinkyDungeonEvent.curse`

***

### cursetype?

> `optional` **cursetype?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1811

#### Inherited from

`KinkyDungeonEvent.cursetype`

***

### damage?

> `optional` **damage?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1866

#### Inherited from

`KinkyDungeonEvent.damage`

***

### damageTrigger?

> `optional` **damageTrigger?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1869

#### Inherited from

`KinkyDungeonEvent.damageTrigger`

***

### delayedOrder?

> `optional` **delayedOrder?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1801

This is an integer. if an event has this the game skips it and comes back after executing everything else.
Best to keep it low for performance reasons, if in a draw loop.

#### Inherited from

`KinkyDungeonEvent.delayedOrder`

***

### desc?

> `optional` **desc?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1881

#### Inherited from

`KinkyDungeonEvent.desc`

***

### desireMult?

> `optional` **desireMult?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1855

#### Inherited from

`KinkyDungeonEvent.desireMult`

***

### dist?

> `optional` **dist?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1870

#### Inherited from

`KinkyDungeonEvent.dist`

***

### distract?

> `optional` **distract?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1861

#### Inherited from

`KinkyDungeonEvent.distract`

***

### distractEff?

> `optional` **distractEff?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1854

#### Inherited from

`KinkyDungeonEvent.distractEff`

***

### distStealth?

> `optional` **distStealth?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1927

Distance having to do with stealth

#### Inherited from

`KinkyDungeonEvent.distStealth`

***

### duration?

> `optional` **duration?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1841

#### Inherited from

`KinkyDungeonEvent.duration`

***

### dynamic?

> `optional` **dynamic?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1806

A dynamic event is specified as 'dynamic' and is specified under ItemMap.dynamic
(replace ItemMap with the event map you need)
This lets you use the same code for multiple events, which is risky but convenient

#### Inherited from

`KinkyDungeonEvent.dynamic`

***

### edgeOnly?

> `optional` **edgeOnly?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1893

Vibe

#### Inherited from

`KinkyDungeonEvent.edgeOnly`

***

### element?

> `optional` **element?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1867

#### Inherited from

`KinkyDungeonEvent.element`

***

### enemy?

> `optional` **enemy?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1931

#### Inherited from

`KinkyDungeonEvent.enemy`

***

### enemyDialogue?

> `optional` **enemyDialogue?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1929

Dialogue key an enemy should send

#### Inherited from

`KinkyDungeonEvent.enemyDialogue`

***

### energyCost?

> `optional` **energyCost?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1907

#### Inherited from

`KinkyDungeonEvent.energyCost`

***

### escapeMethod?

> `optional` **escapeMethod?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1930

#### Inherited from

`KinkyDungeonEvent.escapeMethod`

***

### filter?

> `optional` **filter?**: `LayerFilter`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1890

#### Inherited from

`KinkyDungeonEvent.filter`

***

### filterTags?

> `optional` **filterTags?**: `string`[]

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1901

Generic filtered tags

#### Inherited from

`KinkyDungeonEvent.filterTags`

***

### frequencyMax?

> `optional` **frequencyMax?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1794

#### Inherited from

`KinkyDungeonEvent.frequencyMax`

***

### frequencyMin?

> `optional` **frequencyMin?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1795

#### Inherited from

`KinkyDungeonEvent.frequencyMin`

***

### frequencyStep?

> `optional` **frequencyStep?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1796

#### Inherited from

`KinkyDungeonEvent.frequencyStep`

***

### frequencyTag?

> `optional` **frequencyTag?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1797

#### Inherited from

`KinkyDungeonEvent.frequencyTag`

***

### humanOnly?

> `optional` **humanOnly?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1925

Whether or not the event only triggers on human targets

#### Inherited from

`KinkyDungeonEvent.humanOnly`

***

### inheritLinked?

> `optional` **inheritLinked?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1909

The event gets copied to any restraint if the item is linked

#### Inherited from

`KinkyDungeonEvent.inheritLinked`

***

### ItemTag

> **ItemTag**: `string`

Defined in: src/FactionMachine/MachinePrime/Item/Gag.ts:299

***

### keepLock?

> `optional` **keepLock?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1853

#### Inherited from

`KinkyDungeonEvent.keepLock`

***

### kind?

> `optional` **kind?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1863

#### Inherited from

`KinkyDungeonEvent.kind`

***

### limit?

> `optional` **limit?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1906

Limit of whatever thius event modifies

#### Inherited from

`KinkyDungeonEvent.limit`

***

### list?

> `optional` **list?**: `string`[]

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1923

List of restraints or other string params

#### Inherited from

`KinkyDungeonEvent.list`

***

### lock?

> `optional` **lock?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1880

#### Inherited from

`KinkyDungeonEvent.lock`

***

### melee?

> `optional` **melee?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1874

#### Inherited from

`KinkyDungeonEvent.melee`

***

### msg?

> `optional` **msg?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1883

#### Inherited from

`KinkyDungeonEvent.msg`

***

### mult?

> `optional` **mult?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1862

#### Inherited from

`KinkyDungeonEvent.mult`

***

### noLeash?

> `optional` **noLeash?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1915

Won't trigger while being leashed

#### Inherited from

`KinkyDungeonEvent.noLeash`

***

### offhand?

> `optional` **offhand?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1809

#### Inherited from

`KinkyDungeonEvent.offhand`

***

### offhandonly?

> `optional` **offhandonly?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1810

#### Inherited from

`KinkyDungeonEvent.offhandonly`

***

### original?

> `optional` **original?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1864

#### Inherited from

`KinkyDungeonEvent.original`

***

### player?

> `optional` **player?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1857

#### Inherited from

`KinkyDungeonEvent.player`

***

### power?

> `optional` **power?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1852

#### Inherited from

`KinkyDungeonEvent.power`

***

### prereq?

> `optional` **prereq?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1888

Specifies a prereq that the event itself can use

#### Inherited from

`KinkyDungeonEvent.prereq`

***

### prevSlowLevel?

> `optional` **prevSlowLevel?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1932

#### Inherited from

`KinkyDungeonEvent.prevSlowLevel`

***

### punishComponent?

> `optional` **punishComponent?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1921

triggers from this component

#### Inherited from

`KinkyDungeonEvent.punishComponent`

***

### removeOnUncurse?

> `optional` **removeOnUncurse?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1848

#### Inherited from

`KinkyDungeonEvent.removeOnUncurse`

***

### requiredTag?

> `optional` **requiredTag?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1897

A required enemy tag

#### Inherited from

`KinkyDungeonEvent.requiredTag`

***

### requireEnergy?

> `optional` **requireEnergy?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1904

#### Inherited from

`KinkyDungeonEvent.requireEnergy`

***

### requireFlag?

> `optional` **requireFlag?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1845

#### Inherited from

`KinkyDungeonEvent.requireFlag`

***

### requireTags?

> `optional` **requireTags?**: `string`[]

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1899

Generic required tags

#### Inherited from

`KinkyDungeonEvent.requireTags`

***

### restraint?

> `optional` **restraint?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1849

#### Inherited from

`KinkyDungeonEvent.restraint`

***

### sfx?

> `optional` **sfx?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1850

#### Inherited from

`KinkyDungeonEvent.sfx`

***

### Socket

> **Socket**: `string`

Defined in: src/FactionMachine/MachinePrime/Item/Gag.ts:298

***

### source?

> `optional` **source?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1884

#### Inherited from

`KinkyDungeonEvent.source`

***

### spell?

> `optional` **spell?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1911

Spell to cast at the target

#### Inherited from

`KinkyDungeonEvent.spell`

***

### sprite?

> `optional` **sprite?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1792

#### Inherited from

`KinkyDungeonEvent.sprite`

***

### StruggleType?

> `optional` **StruggleType?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1903

Type of struggle that this event triggers on

#### Inherited from

`KinkyDungeonEvent.StruggleType`

***

### stun?

> `optional` **stun?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1917

Stun duration

#### Inherited from

`KinkyDungeonEvent.stun`

***

### SubItem

> **SubItem**: `KDRestraintVariant`

Defined in: src/FactionMachine/MachinePrime/Item/Gag.ts:300

***

### subMult?

> `optional` **subMult?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1913

Chance to trigger is 1+(submissive % * subMult)

#### Inherited from

`KinkyDungeonEvent.subMult`

***

### tags?

> `optional` **tags?**: `string`[]

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1840

#### Inherited from

`KinkyDungeonEvent.tags`

***

### targetType?

> `optional` **targetType?**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1826

For Dynamic events there is no easy way of getting the 'target' of a targeted event,
for example bulletHitEnemy or playerAttack
targetType specifies the key in the event data that leads to an entity target

Certain constants apply:
KDPLAYER - the current player entity
KDGUARD - the current jail guard
KDLEASHER - the current leasher
KDNEAREST - the nearest entity to the player
KDNEARESTHOSTILE - the nearest hostile enemy

#### Inherited from

`KinkyDungeonEvent.targetType`

***

### threshold?

> `optional` **threshold?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1847

#### Inherited from

`KinkyDungeonEvent.threshold`

***

### time?

> `optional` **time?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1875

#### Inherited from

`KinkyDungeonEvent.time`

***

### trigger

> **trigger**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1846

#### Inherited from

`KinkyDungeonEvent.trigger`

***

### trim?

> `optional` **trim?**: `boolean`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1807

#### Inherited from

`KinkyDungeonEvent.trim`

***

### type

> **type**: `string`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1844

#### Inherited from

`KinkyDungeonEvent.type`

***

### variance?

> `optional` **variance?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1865

#### Inherited from

`KinkyDungeonEvent.variance`

***

### vol?

> `optional` **vol?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1851

#### Inherited from

`KinkyDungeonEvent.vol`

***

### warningchance?

> `optional` **warningchance?**: `number`

Defined in: kd-structured/KinkyDungeon/out/main.d.ts:1919

Chance the player will get warned instead of punshed

#### Inherited from

`KinkyDungeonEvent.warningchance`
