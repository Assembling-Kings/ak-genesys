import { defineConfig } from "vite";
import path from "path";
import yaml from "js-yaml";
import crawler from "fast-glob";
import { constructJsonFromYml } from "./dev/vite-construct-json-from-yaml";
import { hotModuleReloadFvtt } from "./dev/vite-fvtt-hot-module-reload";
import { copyFiles } from "./dev/vite-copy-files";
import { emptyFolders } from "./dev/vite-empty-folders";
import { replacePattern } from "./dev/vite-replace-pattern-in-files";

const SYSTEM_NAME = "ak-genesys"; // The system name/id.
const STATIC_DIR = "static"; // Path to folder that contains files that are copied into the output folder.
const OUT_DIR = "dist"; // Path to folder were the build output is stored.
const SOURCE_DIR = "src"; // Path to folder were the system's logic is defined.
const RAW_DIR = "raw"; // Path to folder with files that need to be transformed before copied.
const TEMPLATE_DIR = "tplt"; // Name for folder that holds template (.hbs) files. It exists in different places.

const PROXY_HOST = process.env.VITE_PROXY_HOST ?? "localhost";
const PROXY_PORT = process.env.VITE_PROXY_PORT ?? 30000;

const IS_PROD = process.env.NODE_ENV === "production";

export default defineConfig({
   publicDir: STATIC_DIR,
   build: {
      outDir: OUT_DIR,
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
      emptyFolders(["static"]),
      replacePattern([
         {
            glob: "src/sheets/**/*.ts",
            pattern:
               /get\s+(templates?)\s*\(\s*\)\s*{\s*return\s+\$ak_tplts?\s*\(\s*((["'][\w./]+["']\s*,?\s*)+)\);?\s*}/g,
            replace: (patternMatch: string[], filePath: string) => {
               const objKey = patternMatch[1];
               const tpltsList = patternMatch[2]
                  .trim().split(",").map((tplt) => tplt.trim())
                  .filter((tplt) => !!tplt).map((tplt) => {
                     const strippedPath = path.join(
                        "systems", SYSTEM_NAME, TEMPLATE_DIR,
                        path.relative(SOURCE_DIR, path.dirname(filePath)),
                        tplt.substring(1, tplt.length - 1) + ".hbs",
                     );
                     return crawler.convertPathToPattern(strippedPath);
                  });
               const wrapperStrings = objKey.endsWith("s") ? ['["', '"]'] : ['"', '"'];
               return `${objKey}: ${wrapperStrings[0]}${tpltsList.join('",\n"')}${wrapperStrings[1]}`;
            },
         },
      ]),
      constructJsonFromYml([RAW_DIR, `${RAW_DIR}/lang`], STATIC_DIR),
      copyFiles([
         {
            fileExt: "hbs",
            inDir: SOURCE_DIR,
            outDir: `${STATIC_DIR}/${TEMPLATE_DIR}`,
         },
      ]),
      hotModuleReloadFvtt(SYSTEM_NAME, [
         {
            fileExt: "hbs",
            inDir: SOURCE_DIR,
            outDir: STATIC_DIR,
            modDir: TEMPLATE_DIR,
         },
         {
            fileExt: "yml",
            inDir: RAW_DIR,
            outDir: STATIC_DIR,
            transform: async (content, filePath) => {
               const contentAsObj = yaml.load(await content(), { filename: filePath });
               return [JSON.stringify(contentAsObj, null, 3), `${path.basename(filePath, ".yml")}.json`];
            },
         },
      ]),
   ],

   resolve: {
      alias: {
         "@": path.resolve(__dirname, SOURCE_DIR),
         "@styles": path.resolve(__dirname, `${SOURCE_DIR}/styles`),
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
