import { Console, Effect } from "effect";

export const program = Effect.fn("program")(function* () {
  yield* Console.log("Hello world");
});
