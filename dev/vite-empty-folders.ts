import { type Plugin } from "vite";
import crawler from "fast-glob";
import { rm } from "fs/promises";

export function emptyFolders(targets: string[]): Plugin {
   let isRunning = false;

   return {
      name: "vite-empty-folders",
      apply: "build",
      enforce: "pre",
      async buildStart() {
         if (isRunning) { return; }
         isRunning = true;

         for (const target of targets) {
            const files = await crawler.glob(`${target}/**`, { onlyFiles: false, deep: 1 });

            for (const filePath of files) {
               await rm(filePath, { recursive: true, force: true });
            }
            console.log(`Emptied folder "${target}"`);
         }
      },
      buildEnd() {
         isRunning = false;
      },
   };
}
