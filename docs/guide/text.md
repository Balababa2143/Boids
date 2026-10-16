# Text and localization

> Where every string comes from, who resolves it, and how a translation overrides it.


Every string the mod shows is registered through one place, `src/KDExtension/Text/`, and the rule
that decides where it lives is **who resolves the key**:

- if the **engine** resolves it, the engine composes it from an identity the mod already holds —
  `Restraint<name>` and its `Desc`/`Desc2` suffixes, `m_<model>`, `KDVarPref<p>`,
  `KinkyDungeonStat<id>`, `KDCategory<name>` — and it is registered in the group the engine reads;
- if the **mod** resolves it, it is addressed by a dotted path and registered in the mod's own
  group. A string the engine merely *displays* from a value the mod has already resolved is on this
  side too, which is all of the dialog and status-line wording.

`Text/Slot.ts` holds every composed key shape, so no call site spells one, and
`test/text-registry.test.ts` fails if a key matches neither kind, if a restraint the mod names is
missing one of the three lines the engine draws, or if a registered value is a placeholder rather
than text.

**Where the English lives.** Text data sits in JSON trees at the closest common root of the entities
that use it — `…/<Family>/Data/en.json` for a line a family's variants share, and a faction or
common folder once something is shared more widely. Each slot resolves through a precedence list,
first hit winning:

1. the active language's merged tree, the fullest path first and then each shorter prefix;
2. the English tree, the same walk;
3. the value the registration declares;
4. the engine's own text for a declared source item;
5. blank.

So a family authors a shared line **once** and each variant overrides only what differs, and a
translator may override any path — including a shorter one, which then covers everything beneath it.
A tree is imported by the module that **reads** it, never by the entry: a bundler may reach the
content tree by more than one path, and the first attempt at this failed for exactly that reason.

**Two limits, stated rather than discovered.** A string is translatable once it has a path, and the
hand-written item families do not have one yet — `docs/api/text-reference.md` marks them.
And English on the mod's own side is still authored beside the code that renders it, because a
string only one module uses belongs to that module; the wider `Data/` folders appear when there is
prose for them to hold.
