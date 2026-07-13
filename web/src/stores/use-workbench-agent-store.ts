import { create } from "zustand";

// The Agent panel dispatches commands to the image/video workbench via this store: set prompt and optionally auto-click generate.
// Parameters (model/quality/size/count etc.) are written directly to use-config-store by the Agent panel; the workbench reads them from config.
// prompt and run are sent here; pages use nonce to detect new commands and call clear after consuming.

export type WorkbenchCommand = {
    nonce: number;
    prompt?: string;
    run: boolean;
};

type WorkbenchAgentStore = {
    imageCommand: WorkbenchCommand | null;
    videoCommand: WorkbenchCommand | null;
    dispatchImage: (command: Omit<WorkbenchCommand, "nonce">) => void;
    dispatchVideo: (command: Omit<WorkbenchCommand, "nonce">) => void;
    clearImageCommand: () => void;
    clearVideoCommand: () => void;
};

let nonce = 0;
const nextNonce = () => (nonce += 1);

export const useWorkbenchAgentStore = create<WorkbenchAgentStore>((set) => ({
    imageCommand: null,
    videoCommand: null,
    dispatchImage: (command) => set({ imageCommand: { ...command, nonce: nextNonce() } }),
    dispatchVideo: (command) => set({ videoCommand: { ...command, nonce: nextNonce() } }),
    clearImageCommand: () => set({ imageCommand: null }),
    clearVideoCommand: () => set({ videoCommand: null }),
}));
