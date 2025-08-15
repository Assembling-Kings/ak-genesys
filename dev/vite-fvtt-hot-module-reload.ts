import { type Plugin, type ResolvedConfig } from "vite";
import path from "path";
import { mkdir, writeFile, copyFile } from "fs/promises";
import crawler from "fast-glob";

type FileContent = Parameters<typeof writeFile>[1];
type TransformOutput = [content: FileContent, fileName: string];
type HmrTarget = {
   fileExt: string;
   inDir: string;
   outDir: string;
   modDir?: string;
   transform?: (
      content: () => string | Promise<string>,
      filePath: string,
   ) => TransformOutput | Promise<TransformOutput>;
};

export function hotModuleReloadFvtt(sysName: string, targets: HmrTarget[]): Plugin {
   let savedConfig: ResolvedConfig;

   return {
      name: "vite-fvtt-hot-module-reload",
      apply: "serve",
      configResolved(config) {
         savedConfig = config;
      },
      async handleHotUpdate(context) {
         const relativePath = path.relative(savedConfig.root, context.file);
         for (const target of targets) {
            let nestedFilePath = path.relative(target.inDir, relativePath);
            if (nestedFilePath.startsWith("..") || path.extname(nestedFilePath) !== `.${target.fileExt}`) {
               continue;
            }

            if (target.modDir) {
               nestedFilePath = path.join(target.modDir, nestedFilePath);
            }

            let finalPath: string;
            if (target.transform) {
               const [content, fileName] = await target.transform(context.read, nestedFilePath);
               nestedFilePath = path.join(path.dirname(nestedFilePath), fileName);
               finalPath = path.resolve(target.outDir, nestedFilePath);
               await mkdir(path.dirname(finalPath), { recursive: true });
               await writeFile(finalPath, content, "utf8");
            } else {
               finalPath = path.resolve(target.outDir, nestedFilePath);
               await mkdir(path.dirname(finalPath), { recursive: true });
               await copyFile(context.file, finalPath);
            }

            context.server.ws.send({
               type: "custom",
               event: `update-${target.fileExt}`,
               data: { path: crawler.convertPathToPattern(`systems/${sysName}/${nestedFilePath}`) },
            });
            console.log(`Updated file at "${finalPath}"`);
            return;
         }
      },
   };
}
