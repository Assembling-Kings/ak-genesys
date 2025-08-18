import { type Plugin, type ResolvedConfig } from "vite";
import path from "path";
import { mkdir, writeFile, copyFile } from "fs/promises";

type FileContent = Parameters<typeof writeFile>[1];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransformOutput = { content: FileContent; fileName: string } & Record<string, any>;

export type FvttHmrTarget = {
   /**
    * The file extension of the files we are watching for.
    */
   fileExt: string;
   /**
    * The folder that contains the files we are watching for.
    */
   inDir: string;
   /**
    * The folder were we propagate the updated files to as part of the HMR.
    */
   dstDir: string;
   /**
    * An object that informs the plugin if the updated file should be transformed before updating it on the output
    * folder.
    */
   transform?: {
      /**
       * A function that transforms the content of an updated file.
       * @param content A function that returns the content of the updated file.
       * @param filePath The path to the file that was updated.
       * @returns The new content of the updated file with some optional additional data that can be consumed by the
       *    `buildEventData()` function.
       */
      handler(content: () => string | Promise<string>, filePath: string): TransformOutput | Promise<TransformOutput>;
      /**
       * If the pluging should skip writting the updated file to the `dstDir` folder.
       */
      skipOutUpdate?: boolean;
   };
   /**
    * A function that constructs the event data that will be sent to the client.
    * @param filePath The path to the file that was updated.
    * @param transformOutput The output from the `transform.handler()` function.
    * @returns An object that will be forwarded to the client to signal the update.
    */
   buildEventData: (filePath: string, transformOutput?: TransformOutput) => object;
};

/**
 * A plugin that expands FoundryVTT's HMR capabilities by watching certain files and notifying the client afterwards.
 * For this to properly work the client must implement additional code that should react to the server's notifications.
 * See the `Genesys.dev.ts` file for the relevant client code.
 * @param sysName The system id which should match the folder name of the system's installation.
 * @param targets List of objects that describe which files to watch and what should be reported to the server.
 */
export function hotModuleReloadFvtt(targets: FvttHmrTarget[]): Plugin {
   let savedConfig: ResolvedConfig;

   return {
      name: "vite-fvtt-hot-module-reload",
      apply: "serve",
      configResolved(config) {
         savedConfig = config;
      },
      async handleHotUpdate(context) {
         const relativePath = path.posix.relative(savedConfig.root, context.file);
         for (const target of targets) {
            // Find which of the passed targets match the current updated file, if any.
            let nestedFilePath = path.posix.relative(target.inDir, relativePath);
            if (nestedFilePath.startsWith("..") || path.extname(nestedFilePath) !== `.${target.fileExt}`) { continue; }

            let finalPath: string | undefined = undefined;
            let transformOutput: TransformOutput | undefined = undefined;

            // Propagate the update to the target output folder.
            if (target.transform) {
               transformOutput = await target.transform.handler(context.read, nestedFilePath);
               nestedFilePath = path.posix.join(path.dirname(nestedFilePath), transformOutput.fileName);

               if (!target.transform.skipOutUpdate) {
                  finalPath = path.resolve(target.dstDir, nestedFilePath);
                  await mkdir(path.dirname(finalPath), { recursive: true });
                  await writeFile(finalPath, transformOutput.content, "utf8");
               }
            } else {
               finalPath = path.resolve(target.dstDir, nestedFilePath);
               await mkdir(path.dirname(finalPath), { recursive: true });
               await copyFile(context.file, finalPath);
            }

            // Notify the client about the updated file.
            const eventData = target.buildEventData(nestedFilePath, transformOutput);
            context.server.ws.send({
               type: "custom",
               event: `update-${target.fileExt}`,
               data: eventData,
            });
            if (finalPath) { console.log(`Updated file at "${finalPath}"`); }
            return;
         }
      },
   };
}
