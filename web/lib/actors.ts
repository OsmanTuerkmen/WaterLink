import type { Actor, Role } from "./domain.ts";

// These are invented people, shared by the demo. This is role simulation (behind a sign-in on the server,
// on the device in the sandbox), not production staff management.
export const DEMO_ACTORS: Record<Role, Actor> = {
  operator: { id: "demo-operator", name: "Amina · operator (demo)", role: "operator" },
  technician: { id: "demo-technician", name: "Daniel · technician (demo)", role: "technician" },
  coordinator: { id: "demo-coordinator", name: "WaterLink coordination (demo)", role: "coordinator" },
};
