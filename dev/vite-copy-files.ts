import { type Plugin } from "vite";
import path from "path";
import crawler from "fast-glob";
import { mkdir, copyFile } from "fs/promises";

type FileTarget = {
   /**
    * A glob that points at a list of files that should be copied to the output folder.
    */
   srcGlob: string;
   /**
    * The folder were the files will be copied to.
    */
   dstDir: string;
};

/**
 * A plugin that copies the files that match a passed glob to the specified folder.
 * @param targets List of objects that describe the files that need to be copied and where.
 */
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
            const files = await crawler.glob(target.srcGlob);
            for (const filePath of files) {
               const nestedFilePath = filePath.split("/");
               // The top folder is used to point to the descendants that we want to process, but the it should not be
               // part of the output structure.
               nestedFilePath.shift();

               const finalPath = path.resolve(target.dstDir, ...nestedFilePath);
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
