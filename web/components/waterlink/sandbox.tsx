"use client";
import { FlaskConical } from "lucide-react";
import { useWaterLink } from "./store";

/** Opens the practice mode. Shown to everybody who is not in it yet. */
export function TryItButton() {
  const { sandbox, enterSandbox } = useWaterLink();
  if (sandbox) return null;
  return <button type="button" className="btn btn-primary btn-sm try-btn" onClick={enterSandbox}><FlaskConical size={16} aria-hidden="true" />Try it yourself</button>;
}

/** Says, on every screen, that practice data on this device is being used, and how to start over or leave. */
export function SandboxBar() {
  const { sandbox, resetSandbox, leaveSandbox } = useWaterLink();
  if (!sandbox) return null;
  return (
    <div className="sandbox-bar" role="status">
      <FlaskConical size={20} aria-hidden="true" />
      <p><b>Sandbox.</b> You are trying WaterLink with practice data on this device only. Nothing is saved on the server and nobody else sees your changes; other tabs, such as the public board, keep showing the shared demo.</p>
      <div>
        <button type="button" className="btn btn-quiet btn-sm" onClick={resetSandbox}>Reset practice data</button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={leaveSandbox}>Leave sandbox</button>
      </div>
    </div>
  );
}
