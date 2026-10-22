import { getDatabase } from "@/lib/database";
import { createSeedState } from "@/lib/domain";
import { parseLang } from "@/lib/i18n";
import { REGION } from "@/lib/region";
import { getState } from "@/lib/store";
import { Home, type View } from "./home";

export const dynamic = "force-dynamic";

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Renders the first screen on the server with the current state, so it shows before any script has loaded. */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const view: View = first(query.view) === "display" ? "display" : first(query.view) === "stage" ? "stage" : "app";
  const sandbox = first(query.sandbox) === "1";
  let initial = null;
  try {
    const now = new Date();
    // The practice mode never touches the shared state: its first screen is made from the start data.
    initial = { state: sandbox ? createSeedState(now, REGION) : await getState(getDatabase(), now), serverNow: now.toISOString() };
  } catch (error) {
    // The page still opens; the browser then loads the state itself and shows "Loading".
    console.error("WaterLink could not read the state for the first screen:", error instanceof Error ? error.message : "unknown error");
  }
  return <Home initial={initial} view={view} lang={parseLang(first(query.lang))} sandbox={sandbox} />;
}
