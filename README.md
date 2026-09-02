# effect-starter

An opinionated [Effect](https://effect.website) 4 starter: one program, one
entrypoint, and one test, wired to TypeScript 7, oxlint with the anti-slop
rules, oxfmt, and vitest. The program prints hello world. Replace it; keep the
toolchain.

## Quick start

```bash
pnpm install
pnpm start               # Hello world
pnpm dev                 # restarts on every change
```

## Layout

```
src/program.ts           the program, an exported Effect.fn
src/main.ts              the entrypoint: NodeRuntime.runMain(program())
test/program.test.ts     runs the program under it.effect and reads TestConsole
tools/oxlint/anti-slop   vendored lint rules, including the Effect ones
```

## Commands

```bash
pnpm check           # typecheck + lint + format:check + test
pnpm typecheck
pnpm lint
pnpm format
pnpm test
```

## Conventions

See [AGENTS.md](./AGENTS.md). It points at `node_modules/effect/AGENTS.md` and
`node_modules/effect/ai-docs/`, which the `effect` package ships itself — those
are version-pinned to this repo's install and beat any external documentation.
