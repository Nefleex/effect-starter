import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { TestConsole } from "effect/testing";
import { program } from "../src/program.ts";

describe("program", () => {
  it.effect("says hello", () =>
    Effect.gen(function* () {
      yield* program();

      assert.deepStrictEqual(yield* TestConsole.logLines, ["Hello world"]);
    }),
  );
});
