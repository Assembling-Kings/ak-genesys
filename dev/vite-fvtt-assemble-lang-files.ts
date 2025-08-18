import { type Plugin } from "vite";
import path from "path";
import crawler from "fast-glob";
import { readFile, mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { type FvttHmrTarget } from "dev/vite-fvtt-hot-module-reload";

export type LangSubFileContent = Record<string, Record<string, Record<string, string>>>;
export type LangSubFileTags = {
   /**
    * Should the partial translation use a sub-key for the second depth level after the top language key. By default
    * this values is assumed to be `true`.
    */
   _USE_SUB_KEY?: boolean;
   /**
    * When using a sub-key this is used instead of infering it from the parent folder's name.
    */
   _PATH?: string;
};

/**
 * A plugin that merges all the partial translation (`.yml`) files into the base ones.
 * @param baseDir Path to the folder that contains the base translation (`.yml`) files
 * @param targetsGlob A glob that points to the partial translations (`.yml`) files.
 * @param mergeKey An object key under which all the partial translation are merged.
 * @param dstDir The folder to which we save the output of the assembled translation files.
 */
export function assembleLangFiles(baseDir: string, targetsGlob: string, mergeKey: string, dstDir: string): Plugin {
   let isRunning = false;

   return {
      name: "vite-fvtt-assemble-lang-files",
      apply: "build",
      enforce: "pre",
      async buildStart() {
         if (isRunning) { return; }
         isRunning = true;

         const langFiles = {};
         const baseLangFilesPath = await crawler.glob(`${baseDir}/*.yml`);

         // Get all the base translation files and store their content for later processing.
         for (const baseLangFilePath of baseLangFilesPath) {
            const content = await readFile(baseLangFilePath, "utf8");
            const contentAsObj = yaml.load(content, { filename: baseLangFilePath }) as object;

            if (!Object.hasOwn(contentAsObj, mergeKey)) {
               contentAsObj[mergeKey] = {};
            }
            const fileName = path.basename(baseLangFilePath, ".yml");
            langFiles[fileName] = contentAsObj;
         }

         // Find all the paths to the partial translations.
         const filePaths = await crawler.glob(targetsGlob);

         await updateLangObjWithLangSubFiles(
            langFiles, filePaths, mergeKey, dstDir, (filePath) => readFile(filePath, "utf8"),
         );
      },
      buildEnd() {
         isRunning = false;
      },
   };
}

/**
 * HMR module for base translation (`.yml`) files.
 * @param mergeKey An object key under which all the partial translation are merged.
 * @param subFilesGlob A glob that points to the partial translations (`.yml`) files.
 * @param dstDir The folder to which we save the output of the assembled translation files.
 */
export function assembleLangFilesHmr(
   mergeKey: string, subFilesGlob: string, dstDir: string,
): FvttHmrTarget["transform"] {
   return {
      async handler(content: () => string | Promise<string>, filePath: string) {
         const contentAsObj = yaml.load(await content(), { filename: filePath }) as object;

         if (!Object.hasOwn(contentAsObj, mergeKey)) {
            contentAsObj[mergeKey] = {};
         }
         const fileName = path.basename(filePath, ".yml");
         const langFiles = { [fileName]: contentAsObj };

         const filePaths = await crawler.glob(subFilesGlob);

         await updateLangObjWithLangSubFiles(langFiles, filePaths, mergeKey, dstDir, (fp) => readFile(fp, "utf8"));

         return {
            content: "", // No need since we already took care of updating the files.
            fileName: "", // We potentially updated multiple files so no specific one is returned here.
            paths: [`${dstDir}/${fileName}.json`],
         };
      },
      skipOutUpdate: true,
   };
}

/**
 * HMR module for partial translation (`.yml`) files.
 * @param mergeKey An object key under which all the partial translation are merged.
 * @param dstDir The folder to which we save the output of the assembled translation files.
 */
export function assembleLangSubFilesHmr(mergeKey: string, dstDir: string): FvttHmrTarget["transform"] {
   return {
      async handler(content: () => string | Promise<string>, filePath: string) {
         const langFilesPath = await crawler.glob(`${dstDir}/*.json`);
         const langFiles = {};
         for (const langFilePath of langFilesPath) {
            const langKey = path.basename(langFilePath, ".json");
            const targetContent = await readFile(langFilePath, "utf8");
            langFiles[langKey] = JSON.parse(targetContent) as LangSubFileContent;
         }

         await updateLangObjWithLangSubFiles(langFiles, [filePath], mergeKey, dstDir, content);

         return {
            content: "", // No need since we already took care of updating the files.
            fileName: "", // We potentially updated multiple files so no specific one is returned here.
            paths: langFilesPath,
         };
      },
      skipOutUpdate: true,
   };
}

/**
 * A helper function used to merge all the translation files and saving them to the output folder.
 * @param langFiles An object with the content of the base translation files.
 * @param filePaths A list of file paths to the partial translation (`.yml`) files.
 * @param mergeKey An object key under which all the partial translation are merged.
 * @param dstDir The folder to which we save the output of the assembled translation files.
 * @param readFileFunc The function that will be used to read the contents of the partial translation (`.yml`) files.
 */
async function updateLangObjWithLangSubFiles(
   langFiles: object,
   filePaths: string[],
   mergeKey: string,
   dstDir: string,
   readFileFunc: (filePath: string) => string | Promise<string>,
) {
   for (const filePath of filePaths) {
      const content = await readFileFunc(filePath);
      const contentAsObj = yaml.load(content, { filename: filePath }) as LangSubFileContent;

      // Get additional modifiers from the partial translation file in order to determine how to do the upcoming merge.
      // These modifiers are removed from the content object as to not interfeer with the upcoming code.
      const useSubKey = (contentAsObj as LangSubFileTags)._USE_SUB_KEY ?? true;
      delete (contentAsObj as LangSubFileTags)._USE_SUB_KEY;
      const potentialSubKey = (contentAsObj as LangSubFileTags)._PATH;
      delete (contentAsObj as LangSubFileTags)._PATH;

      if (!useSubKey) {
         // If sub-keys are disabled then it's a simple merge with each base translation file.
         Object.entries(contentAsObj).forEach(([langKey, transValues]) => {
            if (!Object.hasOwn(langFiles, langKey)) { return; }
            Object.assign(langFiles[langKey][mergeKey], transValues);
         });
      } else {
         // Use the defined sub-key or infer it from the parent folder's name.
         const subKey = potentialSubKey ?? filePath.split("/").at(-2);
         if (!subKey) {
            throw new Error(`Unable to find a proper \`subKey\` for "${filePath}".`);
         }

         Object.entries(contentAsObj).forEach(([langKey, transValues]) => {
            if (!Object.hasOwn(langFiles, langKey)) { return; }
            Object.entries(transValues).forEach(([sectionKey, sectionValues]) => {
               if (!Object.hasOwn(langFiles[langKey][mergeKey], sectionKey)) {
                  langFiles[langKey][mergeKey][sectionKey] = {};
               }
               // Add the sub-key to the second depth level after the top language key.
               Object.assign(langFiles[langKey][mergeKey][sectionKey], { [subKey]: sectionValues });
            });
         });
      }
   }

   // Write the final output for all the base translation files.
   for (const [fileName, fileContent] of Object.entries(langFiles)) {
      const finalFileName = `${fileName}.json`;
      const finalPath = path.resolve(dstDir, finalFileName);

      await mkdir(path.dirname(finalPath), { recursive: true });
      await writeFile(finalPath, JSON.stringify(fileContent, null, 3), "utf8");

      console.log(`Constructed JSON file and saved it at "${finalPath}"`);
   }
}
