/**
 * Property tests for the variant infrastructure in `src/KDExtension/Variant`.
 *
 * This is the machinery every variant-based item set rests on, and almost none
 * of it is exercised at load time — so the registration manifest cannot cover it.
 * The properties below pin:
 *
 *   - the deep-merge contract: template preservation, last-writer-wins for
 *     scalars, `Set` union for `Set`-semantics keys, and `List` *concatenation*
 *     for `Tuple`-semantics keys (verified against `mergeDeep`, which
 *     concatenates Immutable Lists rather than merging them positionally);
 *   - variant-key identity, including the field-order sensitivity that makes
 *     variant field order a save-format concern; and
 *   - the display-name contract, currently pinned to its *defective* behaviour
 *     so that the fix is a deliberate, reviewable change.
 */

import fc from 'fast-check'
import assert from 'node:assert/strict'
import { is, isKeyed, isList, isSet, List, Map } from 'immutable'
import { describe, it } from 'node:test'

import { GetVariantIdFromBase, GetVariantNameFromBase, VariantKeyToImmutable, type JSReceiver } from '../src/KDExtension/Variant/Common'
import { ModelVariantMapBuilder, ModelReceiver } from '../src/KDExtension/Variant/ModelVariantMapBuilder'
import { RestraintReceiver } from '../src/KDExtension/Variant/RestraintVariantBuilder'
import { ArraySemantics, RestraintArraySemantics } from '../src/KDExtension/Variant/Semantics'
import { VariantMapBuilder } from '../src/KDExtension/Variant/VariantMapBuilder'

/**
 * `JSReceiver` is `Parameters<typeof fromJS>[1]`, i.e. optional, so invoking a
 * receiver-typed constant needs narrowing even though the constants are defined.
 */
type Receiver = NonNullable<JSReceiver>
type ReceiverValue = Parameters<Receiver>[1]

const Convert = (receiver: JSReceiver, key: string, value: unknown): unknown =>
    (receiver as Receiver)(key, value as ReceiverValue, [])

/** A small stand-in for an item archetype, so the generic builder can be exercised directly. */
interface TestWorking {
    Label: string
    Count: number
    Flags: string[]
    Sizes: string[]
}

/**
 * Mirrors how the real receivers diverge: one key accumulates as an Immutable
 * `Set` (union semantics), another as an Immutable `List` (concatenation).
 */
const TestReceiver: JSReceiver = (key, value) => {
    if (key === 'Flags') {
        return value.toSet()
    }
    if (key === 'Sizes') {
        return value.toList()
    }
    return isKeyed(value) ? value.toMap() : value.toSet()
}

const MakeBuilder = () => new VariantMapBuilder<string, TestWorking>(TestReceiver)

const EmptyTemplate: TestWorking = { Label: '', Count: 0, Flags: [], Sizes: [] }

interface TestPart {
    Count: number
    Flags: string[]
    Sizes: string[]
}

const FlagList = fc.array(fc.string({ minLength: 1, maxLength: 4 }), { maxLength: 4 })
const PartArbitrary: fc.Arbitrary<TestPart> = fc.record({
    Count: fc.integer(),
    Flags: FlagList,
    Sizes: FlagList,
})

const SortedUnique = (values: Iterable<string>): string[] => [...new Set(values)].sort()

/**
 * Registers `only` explicitly, then applies the parts — a variant that no part
 * touches still has to exist, which is how the item modules use the builder.
 */
const Built = (parts: readonly TestPart[], template: TestWorking) => {
    const builder = MakeBuilder().WithVariant('only', variantBuilder => variantBuilder)
    for (const part of parts) {
        builder.AddVariantPart('only', part)
    }
    return builder.BuildVariantMap(template)
}

describe('VariantMapBuilder merge contract', () => {
    it('preserves template fields no part touches', () => {
        fc.assert(
            fc.property(fc.string(), fc.array(PartArbitrary, { maxLength: 5 }), (label, parts) => {
                const result = Built(parts, { ...EmptyTemplate, Label: label })
                assert.equal(result.get('only')?.Label, label)
            })
        )
    })

    it('lets the last part win for scalars', () => {
        fc.assert(
            fc.property(fc.array(PartArbitrary, { minLength: 1, maxLength: 6 }), parts => {
                const result = Built(parts, EmptyTemplate)
                assert.equal(result.get('only')?.Count, parts[parts.length - 1].Count)
            })
        )
    })

    it('unions Set-semantics keys regardless of part order', () => {
        fc.assert(
            fc.property(fc.array(PartArbitrary, { minLength: 1, maxLength: 5 }), parts => {
                const expected = SortedUnique(parts.flatMap(part => part.Flags))
                const forwards = Built(parts, EmptyTemplate).get('only')?.Flags ?? []
                const backwards = Built([...parts].reverse(), EmptyTemplate).get('only')?.Flags ?? []

                assert.deepEqual(SortedUnique(forwards), expected)
                // Union is order-insensitive; only membership matters.
                assert.deepEqual(SortedUnique(backwards), expected)
            })
        )
    })

    it('concatenates Tuple-semantics keys in part order', () => {
        fc.assert(
            fc.property(fc.array(PartArbitrary, { minLength: 1, maxLength: 5 }), parts => {
                const expected = parts.flatMap(part => part.Sizes)
                const result = Built(parts, EmptyTemplate).get('only')?.Sizes ?? []
                assert.deepEqual([...result], expected)
            })
        )
    })

    it('is deterministic and keeps variants isolated from each other', () => {
        fc.assert(
            fc.property(
                fc.array(PartArbitrary, { minLength: 1, maxLength: 3 }),
                fc.array(PartArbitrary, { minLength: 1, maxLength: 3 }),
                (alphaParts, betaParts) => {
                    const build = (withBeta: boolean) => {
                        const builder = MakeBuilder()
                            .WithVariant('alpha', variantBuilder => variantBuilder)
                            .WithVariant('beta', variantBuilder => variantBuilder)
                        for (const part of alphaParts) {
                            builder.AddVariantPart('alpha', part)
                        }
                        if (withBeta) {
                            for (const part of betaParts) {
                                builder.AddVariantPart('beta', part)
                            }
                        }
                        return builder.BuildVariantMap(EmptyTemplate)
                    }

                    const withoutBeta = build(false)
                    const withBeta = build(true)

                    // `BuildVariantMap` returns plain objects (via `toJS()`), so deep
                    // comparison rather than Immutable `is()`, which would fall back to
                    // reference equality for nested plain objects.
                    assert.deepEqual(
                        withoutBeta.get('alpha'),
                        withBeta.get('alpha'),
                        'adding parts to beta perturbed alpha'
                    )
                    assert.notDeepEqual(
                        withoutBeta.get('beta'),
                        withBeta.get('beta'),
                        'beta ignoring its own parts would make this property vacuous'
                    )

                    // Same inputs, same output.
                    assert.deepEqual(build(false).toJS(), withoutBeta.toJS())
                }
            )
        )
    })
})

describe('RestraintReceiver honours RestraintArraySemantics', () => {
    it('maps Set-semantics keys to Immutable Sets and Tuple-semantics keys to Immutable Lists', () => {
        const keyArbitrary = fc.constantFrom(...Object.keys(RestraintArraySemantics))
        fc.assert(
            fc.property(keyArbitrary, fc.array(fc.string(), { maxLength: 3 }), (key, values) => {
                const converted = Convert(RestraintReceiver, key, List(values))
                const semantics = RestraintArraySemantics[key as keyof typeof RestraintArraySemantics]

                if (semantics === ArraySemantics.Set) {
                    assert.ok(isSet(converted), `${key} should convert to a Set`)
                }
                else {
                    assert.ok(isList(converted), `${key} should convert to a List`)
                }
            })
        )
    })

    it('falls back to a List for keys outside the semantics table', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }).filter(key => !(key in RestraintArraySemantics)),
                fc.array(fc.string(), { maxLength: 3 }),
                (key, values) => {
                    assert.ok(isList(Convert(RestraintReceiver, key, List(values))))
                }
            )
        )
    })

    it('keeps keyed values keyed', () => {
        assert.ok(isKeyed(Convert(RestraintReceiver, 'playerTags', Map({ a: 1 }))))
    })
})

describe('variant key derivation', () => {
    const BaseId = '019f8d0d-ec30-7e64-9d06-2614712bd9bc'
    const OtherBaseId = '019f8d0d-ec30-7e64-9d06-2614712bd9bd'

    /**
     * Keys are restricted to lowercase letters: JavaScript enumerates
     * integer-like property names first regardless of insertion order, so a key
     * such as `"0"` would normalise both orderings to the same JSON and make the
     * field-order property vacuously true.
     */
    const KeyArbitrary = fc
        .uniqueArray(fc.stringMatching(/^[a-z]{1,6}$/), { minLength: 2, maxLength: 4 })
        .map(keys => keys.map((key, index) => [key, `value-${index}`] as const))

    it('is pure and depends on both the key JSON and the base id', () => {
        fc.assert(
            fc.property(KeyArbitrary, entries => {
                const key = Object.fromEntries(entries)
                const id = GetVariantIdFromBase(BaseId)

                assert.equal(id(key), id(key))
                assert.notEqual(id(key), GetVariantIdFromBase(OtherBaseId)(key))
            })
        )
    })

    it('separates keys that differ only by field order', () => {
        // This is why variant literals must not be reordered: the id is a uuidv5 over
        // `JSON.stringify`, and the id becomes the model / restraint name.
        fc.assert(
            fc.property(KeyArbitrary, entries => {
                const forwards = Object.fromEntries(entries)
                const backwards = Object.fromEntries([...entries].reverse())
                assert.notEqual(JSON.stringify(forwards), JSON.stringify(backwards))

                const id = GetVariantIdFromBase(BaseId)
                assert.notEqual(id(forwards), id(backwards))
            })
        )
    })

    it('round-trips keys through the default receiver deterministically', () => {
        fc.assert(
            fc.property(KeyArbitrary, entries => {
                const key = Object.fromEntries(entries)
                const immutableKey = VariantKeyToImmutable(key)
                assert.ok(is(immutableKey, VariantKeyToImmutable(key)))

                const id = GetVariantIdFromBase(BaseId)
                assert.equal(id(immutableKey), id(key))
            })
        )
    })

    it('derives display names from the base name, never from the base id', () => {
        fc.assert(
            fc.property(KeyArbitrary, fc.string({ minLength: 1 }), (entries, baseName) => {
                const key = Object.fromEntries(entries)
                assert.equal(
                    GetVariantNameFromBase(baseName)(key),
                    `${baseName}: ${JSON.stringify(key)}`
                )
            })
        )
    })
})

describe('ModelVariantMapBuilder finalisation', () => {
    const BaseId = 'e5050056-23ad-4935-bbc9-68b49f27fb9a'

    const LayerArbitrary = fc
        .uniqueArray(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 1, maxLength: 4 })
        .map(names => names.map(name => ({ Name: name, Layer: name, Pri: 0 })))

    const Template = { Name: '', Folder: 'Test/Folder', Categories: ['Test'], Layers: [] as ModelLayer[] }

    const Build = (key: string, layers: ModelLayer[], baseName?: string) => {
        const builder = new ModelVariantMapBuilder<string>({ baseId: BaseId, baseName })
        builder.AddVariantParts(key, [{ Layers: layers }])
        return builder.BuildVariantMap(Template)
    }

    it('names models after the variant id and keys layers by layer name', () => {
        fc.assert(
            fc.property(fc.string({ minLength: 1 }), LayerArbitrary, (key, layers) => {
                const variant = Build(key, layers).get(key)
                assert.equal(variant?.Model.Name, GetVariantIdFromBase(BaseId)(key))

                // `Layers` travels through an Immutable `Set`, which is hash-ordered,
                // so only membership and naming are guaranteed — not input order.
                assert.deepEqual(
                    Object.keys(variant?.Model.Layers ?? {}).sort(),
                    layers.map(layer => layer.Name).sort()
                )
            })
        )
    })

    it('converts Layers and other indexed values to Immutable Sets during deserialization', () => {
        const layers = List([Map({ Name: 'a' }), Map({ Name: 'b' })])
        assert.ok(isSet(Convert(ModelReceiver, 'Layers', layers)))
        assert.ok(isSet(Convert(ModelReceiver, 'AnythingElse', layers)))
        assert.ok(isKeyed(Convert(ModelReceiver, 'SomeMap', Map({ a: 1 }))))
    })

    it('pins the current display-name behaviour: baseName is ignored and the id is used', () => {
        // KNOWN DEFECT. `NamedVariantMapBuilder._GetVariantName` returns the id function,
        // so a supplied `baseName` never reaches `DisplayName`. Pinning it here means the
        // fix shows up as a deliberate change to this test rather than a silent drift.
        fc.assert(
            fc.property(fc.string({ minLength: 1 }), LayerArbitrary, (key, layers) => {
                const variant = Build(key, layers, 'Test | Base Name').get(key)
                assert.equal(variant?.TextInfo.DisplayName, GetVariantIdFromBase(BaseId)(key))
            })
        )
    })

    it('emits no text info when neither baseName nor explicit text is given', () => {
        fc.assert(
            fc.property(fc.string({ minLength: 1 }), LayerArbitrary, (key, layers) => {
                const variant = Build(key, layers).get(key) as { TextInfo?: { DisplayName?: string } } | undefined
                assert.ok(variant != null)
                assert.equal(variant.TextInfo?.DisplayName, undefined)
            })
        )
    })
})

describe('infrastructure surface', () => {
    it('still exposes the semantics table', () => {
        assert.ok(Object.keys(RestraintArraySemantics).length > 20)
    })

    it('builds an empty map when no variant was registered', () => {
        assert.equal(MakeBuilder().BuildVariantMap(EmptyTemplate).size, 0)
    })
})
