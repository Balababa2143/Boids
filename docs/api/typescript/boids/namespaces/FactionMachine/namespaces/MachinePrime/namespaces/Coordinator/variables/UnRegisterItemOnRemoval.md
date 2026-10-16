[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / UnRegisterItemOnRemoval

# Variable: UnRegisterItemOnRemoval

> `const` **UnRegisterItemOnRemoval**: (`builderArgs`) => `object` & `Omit`\<[`EventWithItemArchetype`](../interfaces/EventWithItemArchetype.md), `"trim"` \| `"filter"` \| `"sprite"` \| `"cloneTags"` \| `"frequencyMax"` \| `"frequencyMin"` \| `"frequencyStep"` \| `"frequencyTag"` \| `"delayedOrder"` \| `"dynamic"` \| `"cost"` \| `"offhand"` \| `"offhandonly"` \| `"cursetype"` \| `"curse"` \| `"targetType"` \| `"attackerType"` \| `"tags"` \| `"duration"` \| `"always"` \| `"bindEff"` \| `"type"` \| `"requireFlag"` \| `"trigger"` \| `"threshold"` \| `"removeOnUncurse"` \| `"restraint"` \| `"sfx"` \| `"vol"` \| `"power"` \| `"keepLock"` \| `"distractEff"` \| `"desireMult"` \| `"count"` \| `"player"` \| `"bind"` \| `"crit"` \| `"bindcrit"` \| `"distract"` \| `"mult"` \| `"kind"` \| `"original"` \| `"variance"` \| `"damage"` \| `"element"` \| `"buffTypes"` \| `"damageTrigger"` \| `"dist"` \| `"aoe"` \| `"buffType"` \| `"bullet"` \| `"melee"` \| `"time"` \| `"bindType"` \| `"addBind"` \| `"chance"` \| `"buff"` \| `"lock"` \| `"desc"` \| `"buffSprite"` \| `"msg"` \| `"source"` \| `"condition"` \| `"prereq"` \| `"color"` \| `"bgcolor"` \| `"edgeOnly"` \| `"cooldown"` \| `"requiredTag"` \| `"requireTags"` \| `"filterTags"` \| `"StruggleType"` \| `"requireEnergy"` \| `"limit"` \| `"energyCost"` \| `"inheritLinked"` \| `"spell"` \| `"subMult"` \| `"noLeash"` \| `"stun"` \| `"warningchance"` \| `"punishComponent"` \| `"list"` \| `"humanOnly"` \| `"distStealth"` \| `"enemyDialogue"` \| `"escapeMethod"` \| `"enemy"` \| `"prevSlowLevel"`\> & `Partial`\<`object` & `object`\>

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Event.ts:75

Builds the event an item uses to release its slot when the game removes it.

Unlike the apply half this handler does not check the event's source: it
unregisters whichever item the game hands it when the removal fires, matched by
name. Removing a name that was never registered is harmless.

## Parameters

### builderArgs

`ItemArchetype`

## Returns

`object` & `Omit`\<[`EventWithItemArchetype`](../interfaces/EventWithItemArchetype.md), `"trim"` \| `"filter"` \| `"sprite"` \| `"cloneTags"` \| `"frequencyMax"` \| `"frequencyMin"` \| `"frequencyStep"` \| `"frequencyTag"` \| `"delayedOrder"` \| `"dynamic"` \| `"cost"` \| `"offhand"` \| `"offhandonly"` \| `"cursetype"` \| `"curse"` \| `"targetType"` \| `"attackerType"` \| `"tags"` \| `"duration"` \| `"always"` \| `"bindEff"` \| `"type"` \| `"requireFlag"` \| `"trigger"` \| `"threshold"` \| `"removeOnUncurse"` \| `"restraint"` \| `"sfx"` \| `"vol"` \| `"power"` \| `"keepLock"` \| `"distractEff"` \| `"desireMult"` \| `"count"` \| `"player"` \| `"bind"` \| `"crit"` \| `"bindcrit"` \| `"distract"` \| `"mult"` \| `"kind"` \| `"original"` \| `"variance"` \| `"damage"` \| `"element"` \| `"buffTypes"` \| `"damageTrigger"` \| `"dist"` \| `"aoe"` \| `"buffType"` \| `"bullet"` \| `"melee"` \| `"time"` \| `"bindType"` \| `"addBind"` \| `"chance"` \| `"buff"` \| `"lock"` \| `"desc"` \| `"buffSprite"` \| `"msg"` \| `"source"` \| `"condition"` \| `"prereq"` \| `"color"` \| `"bgcolor"` \| `"edgeOnly"` \| `"cooldown"` \| `"requiredTag"` \| `"requireTags"` \| `"filterTags"` \| `"StruggleType"` \| `"requireEnergy"` \| `"limit"` \| `"energyCost"` \| `"inheritLinked"` \| `"spell"` \| `"subMult"` \| `"noLeash"` \| `"stun"` \| `"warningchance"` \| `"punishComponent"` \| `"list"` \| `"humanOnly"` \| `"distStealth"` \| `"enemyDialogue"` \| `"escapeMethod"` \| `"enemy"` \| `"prevSlowLevel"`\> & `Partial`\<`object` & `object`\>

An event to spread into the restraint's `events` list.
