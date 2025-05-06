import { type Plugin, type ResolvedConfig } from "vite";
import path from "path";
import crawler from "fast-glob";
import { readFile, mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";

export function constructJsonFromYml(dstFir: string, targets: string[]): Plugin {
   let savedConfig: ResolvedConfig;
   let isRunning = false;

   return {
      name: "vite-plugin-construct-json-from-yaml",
      apply: "build",
      enforce: "pre",
      configResolved(config) {
         savedConfig = config;
      },
      async buildStart() {
         if (isRunning) { return; }
         isRunning = true;

         for (const target of targets) {
            const files = await crawler.glob(`${target}/*`);
            for (const filePath of files) {
               const nestedFilePath = filePath.split("/");
               // The `target` is used to point to the direct descendants that we want to process, but it should not be
               // part of the output structure.
               nestedFilePath.shift();

               // Change the file name gracefully.
               const fileNameParts = nestedFilePath[nestedFilePath.length - 1].split(".");
               if (fileNameParts.length > 1) {
                  fileNameParts[fileNameParts.length - 1] = "json";
               } else {
                  fileNameParts.push("json");
               }
               nestedFilePath[nestedFilePath.length - 1] = fileNameParts.join(".");

               // Transform the original file contents to an object.
               const content = await readFile(path.resolve(savedConfig.root, filePath), "utf8");
               const contentAsObj = yaml.load(content, { filename: filePath });

               const finalPath = path.resolve(savedConfig.root, dstFir, ...nestedFilePath);
               console.log(`Constructed JSON file and saved it at "${finalPath}"`);

               await mkdir(path.dirname(finalPath), { recursive: true });
               await writeFile(finalPath, JSON.stringify(contentAsObj, null, 3), "utf8");
            }
         }
      },
      buildEnd() {
         isRunning = false;
      },
   };
}
