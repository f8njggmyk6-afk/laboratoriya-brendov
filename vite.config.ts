import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({ resolve: { tsconfigPaths: true }, plugins: [tanstackStart(), nitro({ preset: "vercel" }), react()] });
