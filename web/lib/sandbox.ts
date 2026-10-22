import { DomainError, applyCommand, resetState, type Command, type RegionData, type Role, type State } from "./domain.ts";
import { DEMO_ACTORS } from "./actors.ts";

export type Mutation = Command | { type: "reset" };

/**
 * One action of the practice mode: the same rules the server applies (applyCommand), run on the device
 * for one of the three demo people. Nothing is sent anywhere. Throws the same DomainError the server would answer with.
 */
export function applyLocal(state: State, role: Role, mutation: Mutation, now: Date, region: RegionData | null): State {
  const actor = DEMO_ACTORS[role];
  if (mutation.type === "reset") {
    if (actor.role !== "coordinator") throw new DomainError("Only demo coordination can reset the demo.", 403);
    return resetState(state, actor, now, region);
  }
  return applyCommand(state, mutation, actor, now);
}
