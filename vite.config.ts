import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const emptyEnvDir = path.resolve(__dirname, ".vite-empty-env");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // The preview environment rewrites the project-root .env while it is running.
  // Vite watches envDir files outside `server.watch.ignored`, so point envDir at
  // an inert folder and inject the public runtime values explicitly below.
  // loadEnv() here is a one-time read at config-eval time, not a watched dir,
  // so it also covers local dev via a plain root .env without reintroducing
  // the reload churn.
  const localEnv = loadEnv(mode, __dirname, "");

  return {
    envDir: emptyEnvDir,
    server: {
      host: "::",
      port: 8080,
      watch: {
        ignored: (file: string) => /(^|[/\\])\.env(\..*)?$/.test(file),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL ?? localEnv.VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? localEnv.VITE_SUPABASE_PUBLISHABLE_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(process.env.VITE_SUPABASE_PROJECT_ID ?? localEnv.VITE_SUPABASE_PROJECT_ID),
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
