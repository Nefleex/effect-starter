# Working in this repo

## Standards

Two vendored skills govern how code here is written. Read them before designing
anything new; they outrank the conventions listed further down when the two
disagree.

- `.claude/skills/coding-standards/SKILL.md` — typed failures, parse-don't-
  validate, branded domain types, Domain / Application Service / Adapter roles,
  testing through real seams, JSDoc on exported symbols.
- `.claude/skills/effect-service-design/SKILL.md` — when a capability earns an
  Effect service at all, where the authority seam goes, and the
  `make` / `layerWithoutDependencies` / `layer` / `layerTest` module shape.

Both are vendored from [dmmulroy/skills](https://github.com/dmmulroy/skills)
(MIT). Re-copy to update; do not edit in place.

## Read the pinned Effect docs first

The `effect` package ships its own agent documentation. It is version-pinned to
whatever this repo has installed, so it is always correct for _this_ codebase.
Prefer it over any external or remembered Effect knowledge, which is likely to
describe v3.

- `node_modules/effect/AGENTS.md` — the house style guide
- `node_modules/effect/ai-docs/src/**` — ~25 fully worked, commented examples
- `node_modules/effect/src/**` — the source; read it when the docs are silent

**Do not trust v3-era knowledge.** Effect 4 moved a lot:

| v3                                          | v4                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------- |
| `@effect/schema`                            | `effect/Schema` (core)                                              |
| `@effect/platform` FileSystem/Path/Terminal | `effect/FileSystem`, `effect/Path`, `effect/Terminal`               |
| `@effect/cli`                               | `effect/unstable/cli`                                               |
| `@effect/sql`, `/rpc`, `/experimental`      | `effect/unstable/{sql,rpc,http,httpapi,ai,process,observability,…}` |
| `Either`                                    | `Result`                                                            |
| `STM`                                       | `Tx*` (`TxRef`, `TxQueue`, `TxHashMap`, …)                          |
| `TestClock` from `@effect/vitest`           | `effect/testing`                                                    |

## Conventions

`src/program.ts` exports one `Effect.fn`; `src/main.ts` only runs it with
`NodeRuntime.runMain`. Keep that split: the program stays importable by tests,
and the entry file stays free of logic. Grow along these lines, in this order,
and keep each convention demonstrated exactly once.

- **Pure first**: rules that need no I/O live in `src/domain/` as plain
  functions, with no Effect beyond parsing.
- **Services**: `Context.Service<Self, Interface>()("pkg/path/Name")` with a
  static `layer`, returning `Service.of({...})`. Dependencies are acquired once
  when the layer is built, not per call.
- **Methods**: every public service method is `Effect.fn("Service.method")`.
  Do not use `.pipe` on an `Effect.fn` — pass combinators as extra arguments.
- **Errors**: `Schema.TaggedError<Self>()("Tag", fields)`. Recover with
  `Effect.catchTag`. Never hand-roll `_tag` classes. Raise in generators with
  `return yield* new SomeError(...)`.
- **Models**: schemas are boundary parsers, not type declarations. A value that
  crosses a boundary gets a branded schema and a parser. Never cast, never
  hand-parse.
- **States**: tagged unions, not a status field beside optional data.
- **Configuration** goes through `Config`, read once at layer build.
  `process.env` must not appear in application logic.
- **Layers**: compose with explicit `Layer.provide`. `Layer.mergeAll` and
  `provideMerge` are not make-it-compile tools.
- **Guards**: use the `Predicate` module. Never write your own `isString`.
- **No barrel**: import the module you need.
- **Entrypoint**: `NodeRuntime.runMain` installs SIGINT/SIGTERM handlers and
  reports failures with an exit code. A long-running process passes
  `Layer.launch(AppLayer)` to it instead of an effect.

## Tests

Test at the cheapest level that can catch the change:

- Rules: plain `it` over pure functions, no layers.
- Effects: `@effect/vitest` `it.effect`, which provides `TestClock` and
  `TestConsole` from `effect/testing`. See `test/program.test.ts`.
- Services: build the production layer with configuration pinned through a
  `ConfigProvider` rather than `process.env`.
- Reach for `fast-check` (`it.effect.prop`) whenever a rule claims something
  for _all_ inputs.

## Commands

```
pnpm check       # typecheck + lint + format:check + test — run before finishing
pnpm typecheck   # tsc --noEmit
pnpm lint        # oxlint, including the anti-slop plugin
pnpm format      # oxfmt, writes in place
pnpm test        # vitest run
pnpm start       # node src/main.ts — Node runs the TypeScript directly
pnpm dev         # the same under node --watch, restarting on every change
```

## Linting and formatting

`oxlint` runs the [anti-slop](https://github.com/dmmulroy/anti-slop) plugin
vendored at `tools/oxlint/anti-slop`, including its Effect rules. Its findings
are architectural, not stylistic — a widened type or an unnamed contract is a
design signal, so fix the design rather than the rule. Do not weaken severity,
suppress a rule, or cast to silence one; a genuine exception needs a `SAFETY:`
comment explaining why.

`oxfmt` owns formatting (200 columns, semicolons) via `.oxfmtrc.json`, so never
hand-format. Vendored trees — `.claude/`, `.agents/`, `tools/oxlint/anti-slop` —
are excluded from both.

## Toolchain note

This repo pins **TypeScript 7** (the native compiler). It type-checks the whole
project in well under a second, but it ships no `tsserver` and therefore cannot
load TypeScript language-service plugins — so `@effect/language-service`
(floating-effect diagnostics, missing-layer hints, Effect refactors) is _not_
available here. To get those in an editor, add `typescript@5.9` as a devDep and
point the editor at it; keep TS 7 for `pnpm typecheck`.
