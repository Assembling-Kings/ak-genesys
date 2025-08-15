import { type Plugin } from "vite";
import path from "path";
import crawler from "fast-glob";
import { mkdir, copyFile } from "fs/promises";

type FileTarget = {
   fileExt: string;
   inDir: string;
   outDir: string;
};

export function copyFiles(targets: FileTarget[]): Plugin {
   let isRunning = false;

   return {
      name: "vite-copy-files",
      apply: "build",
      enforce: "pre",
      async buildStart() {
         if (isRunning) { return; }
         isRunning = true;

         for (const target of targets) {
            const files = await crawler.glob(`${target.inDir}/**/*.${target.fileExt}`);
            for (const filePath of files) {
               const nestedFilePath = filePath.split("/");
               // The `inDir` is used to point to the descendants that we want to process, but the top folder should
               // not be part of the output structure.
               nestedFilePath.shift();

               const finalPath = path.resolve(target.outDir, ...nestedFilePath);
               await mkdir(path.dirname(finalPath), { recursive: true });
               await copyFile(filePath, finalPath);

               console.log(`Copied "${filePath}" -> "${finalPath}"`);
            }
         }
      },
      buildEnd() {
         isRunning = false;
      },
   };
}
