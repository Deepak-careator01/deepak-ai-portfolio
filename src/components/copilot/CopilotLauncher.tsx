"use client";

import { useState } from "react";

import { CopilotButton } from "@/components/copilot/CopilotButton";
import { CopilotPlaceholder } from "@/components/copilot/CopilotPlaceholder";

export function CopilotLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CopilotButton onClick={() => setOpen(true)} />
      <CopilotPlaceholder open={open} onClose={() => setOpen(false)} />
    </>
  );
}
