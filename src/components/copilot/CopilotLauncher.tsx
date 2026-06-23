"use client";

import { useCallback, useState } from "react";

import { ChatPanel } from "@/components/copilot/ChatPanel";
import { CopilotButton } from "@/components/copilot/CopilotButton";

export function CopilotLauncher() {
  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <CopilotButton onClick={() => setOpen(true)} />
      <ChatPanel open={open} onClose={handleClose} />
    </>
  );
}
