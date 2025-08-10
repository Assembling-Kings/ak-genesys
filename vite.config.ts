import { defineConfig } from "vite";
import path from "path";
import pluginVue from "@vitejs/plugin-vue";
import { constructJsonFromYml } from "./dev/vite-construct-json-from-yaml";

const SYSTEM_NAME = "ak-genesys"; // The system name/id.
const STATIC_DIR = "static"; // Folder that will contain files that are copied into the final bundle.
const SOURCE_DIR = "src"; // Folder were the system's logic is defined.

const PROXY_HOST = process.env.VITE_PROXY_HOST ?? "localhost";
const PROXY_PORT = process.env.VITE_PROXY_PORT ?? 30000;

const IS_PROD = process.env.NODE_ENV === "production";

export default defineConfig({
   publicDir: STATIC_DIR,
   build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: !IS_PROD,
      minify: false,
      lib: {
         name: "Genesys",
         entry: `${SOURCE_DIR}/Genesys.ts`,
         formats: ["es"],
         fileName: "genesys",
      },
   },

   plugins: [
      constructJsonFromYml(STATIC_DIR, ["raw", "raw/lang"]),
      pluginVue({
         template: {
            compilerOptions: {
               isCustomElement: (tag) => ["prose-mirror"].includes(tag),
            },
         },
      }),
   ],

   resolve: {
      alias: {
         "@": path.resolve(__dirname, SOURCE_DIR),
         "@styles": path.resolve(__dirname, `${SOURCE_DIR}/styles`),
         ...(IS_PROD
            ? { vue: path.resolve(__dirname, "node_modules/vue/dist/vue.esm-browser.prod.js") }
            : { }
         ),
      },
   },

   base: `/systems/${SYSTEM_NAME}`,
   server: {
      port: 30001,
      open: false,
      proxy: {
         [`^(?!/systems/${SYSTEM_NAME})`]: `http://${PROXY_HOST}:${PROXY_PORT}/`,
         "/socket.io": {
            target: `ws://${PROXY_HOST}:${PROXY_PORT}`,
            ws: true,
         },
      },
   },
});
