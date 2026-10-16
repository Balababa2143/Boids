[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / RegisterItemOnApply

# Variable: RegisterItemOnApply

> `const` **RegisterItemOnApply**: (`builderArgs`) => `object` & `Omit`\<[`EventWithItemArchetype`](../interfaces/EventWithItemArchetype.md), `"trim"` \| `"filter"` \| `"sprite"` \| `"cloneTags"` \| `"frequencyMax"` \| `"frequencyMin"` \| `"frequencyStep"` \| `"frequencyTag"` \| `"delayedOrder"` \| `"dynamic"` \| `"cost"` \| `"offhand"` \| `"offhandonly"` \| `"cursetype"` \| `"curse"` \| `"targetType"` \| `"attackerType"` \| `"tags"` \| `"duration"` \| `"always"` \| `"bindEff"` \| `"type"` \| `"requireFlag"` \| `"trigger"` \| `"threshold"` \| `"removeOnUncurse"` \| `"restraint"` \| `"sfx"` \| `"vol"` \| `"power"` \| `"keepLock"` \| `"distractEff"` \| `"desireMult"` \| `"count"` \| `"player"` \| `"bind"` \| `"crit"` \| `"bindcrit"` \| `"distract"` \| `"mult"` \| `"kind"` \| `"original"` \| `"variance"` \| `"damage"` \| `"element"` \| `"buffTypes"` \| `"damageTrigger"` \| `"dist"` \| `"aoe"` \| `"buffType"` \| `"bullet"` \| `"melee"` \| `"time"` \| `"bindType"` \| `"addBind"` \| `"chance"` \| `"buff"` \| `"lock"` \| `"desc"` \| `"buffSprite"` \| `"msg"` \| `"source"` \| `"condition"` \| `"prereq"` \| `"color"` \| `"bgcolor"` \| `"edgeOnly"` \| `"cooldown"` \| `"requiredTag"` \| `"requireTags"` \| `"filterTags"` \| `"StruggleType"` \| `"requireEnergy"` \| `"limit"` \| `"energyCost"` \| `"inheritLinked"` \| `"spell"` \| `"subMult"` \| `"noLeash"` \| `"stun"` \| `"warningchance"` \| `"punishComponent"` \| `"list"` \| `"humanOnly"` \| `"distStealth"` \| `"enemyDialogue"` \| `"escapeMethod"` \| `"enemy"` \| `"prevSlowLevel"`\> & `Partial`\<`object` & `object`\>

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Event.ts:42

Builds the event an item uses to register itself with the coordinator when the
game applies it.

The handler runs only when the item it is handed is the source of the event, or is
reached from the source through `dynamicLink`, so a dynamically linked restraint
is not mistaken for the one being applied. It then adds the item's name to the
`RegisteredItems` set of the slot the archetype names, which makes a repeat
registration a no-op.

## Parameters

### builderArgs

`ItemArchetype`

## Returns

`object` & `Omit`\<[`EventWithItemArchetype`](../interfaces/EventWithItemArchetype.md), `"trim"` \| `"filter"` \| `"sprite"` \| `"cloneTags"` \| `"frequencyMax"` \| `"frequencyMin"` \| `"frequencyStep"` \| `"frequencyTag"` \| `"delayedOrder"` \| `"dynamic"` \| `"cost"` \| `"offhand"` \| `"offhandonly"` \| `"cursetype"` \| `"curse"` \| `"targetType"` \| `"attackerType"` \| `"tags"` \| `"duration"` \| `"always"` \| `"bindEff"` \| `"type"` \| `"requireFlag"` \| `"trigger"` \| `"threshold"` \| `"removeOnUncurse"` \| `"restraint"` \| `"sfx"` \| `"vol"` \| `"power"` \| `"keepLock"` \| `"distractEff"` \| `"desireMult"` \| `"count"` \| `"player"` \| `"bind"` \| `"crit"` \| `"bindcrit"` \| `"distract"` \| `"mult"` \| `"kind"` \| `"original"` \| `"variance"` \| `"damage"` \| `"element"` \| `"buffTypes"` \| `"damageTrigger"` \| `"dist"` \| `"aoe"` \| `"buffType"` \| `"bullet"` \| `"melee"` \| `"time"` \| `"bindType"` \| `"addBind"` \| `"chance"` \| `"buff"` \| `"lock"` \| `"desc"` \| `"buffSprite"` \| `"msg"` \| `"source"` \| `"condition"` \| `"prereq"` \| `"color"` \| `"bgcolor"` \| `"edgeOnly"` \| `"cooldown"` \| `"requiredTag"` \| `"requireTags"` \| `"filterTags"` \| `"StruggleType"` \| `"requireEnergy"` \| `"limit"` \| `"energyCost"` \| `"inheritLinked"` \| `"spell"` \| `"subMult"` \| `"noLeash"` \| `"stun"` \| `"warningchance"` \| `"punishComponent"` \| `"list"` \| `"humanOnly"` \| `"distStealth"` \| `"enemyDialogue"` \| `"escapeMethod"` \| `"enemy"` \| `"prevSlowLevel"`\> & `Partial`\<`object` & `object`\>

An event to spread into the restraint's `events` list.
