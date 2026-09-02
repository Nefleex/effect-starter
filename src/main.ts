import { NodeRuntime } from "@effect/platform-node";
import { program } from "./program.ts";

NodeRuntime.runMain(program());
