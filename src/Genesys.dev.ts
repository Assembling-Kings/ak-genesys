import "@/Genesys";

// Pattern that matches the filename part of a path.
const pathEndPattern = /\/\w+\.ts/i;

/**
 * A helper function used during development to shorten the path that needs to be typed when pointing to a template
 * file inside a sheet class. All properly formatted calls will be stripped during build and replaced with the
 * appropiate relative path.
 * @param relativePaths An array of paths relative to the file that is calling the helper.
 * @returns An array of relative paths from the system's directory in FVTT.
 */
globalThis.$ak_tplts = (...relativePaths: string[]) => {
   // Try to find the current file path by grabbing it from a fake error stack.
   const stackTrace = (new Error()).stack ?? "";
   const splittedStackTrace = stackTrace.split("/systems/ak-genesys/src/");

   if (splittedStackTrace.length < 2) {
      throw new Error("Unable to find the file path by ways of parsing an Error stack.");
   }
   const findLineWithFilepath = splittedStackTrace.find((path) => pathEndPattern.test(path))!;
   const splittedPotentialPath = findLineWithFilepath.split(pathEndPattern)[0].split("/");

   const finalPaths: string[] = [];
   for (const relativePath of relativePaths) {
      const splittedRelativePath = relativePath.split("/");

      // Properly handle relative paths that point to an ancestor folder. By finding out how many levels we need to go
      // up and comparing that to the current path.
      const relativePathTrueStart = splittedRelativePath.findIndex((pathPart) => pathPart !== "..");
      if (relativePathTrueStart === -1 || relativePathTrueStart >= splittedPotentialPath.length) {
         throw new Error("Unable to reconcile the provided relative path with the current file path.");
      }

      const finalPath = [
         "systems/ak-genesys/tplt",
         ...splittedPotentialPath.slice(
            0, relativePathTrueStart > 0 ? -relativePathTrueStart : splittedPotentialPath.length),
         ...splittedRelativePath.slice(relativePathTrueStart),
      ].join("/");
      finalPaths.push(`${finalPath}.hbs`);
   }

   return finalPaths;
};

globalThis.$ak_tplt = (relativePath: string) => {
   return globalThis.$ak_tplts(relativePath)[0];
};

if (import.meta.hot) {
   // Adds support for HMR of template (.hbs) files.
   function updateTemplateFactory(path: string) {
      return async () => {
         delete Handlebars.partials[path];
         await foundry.applications.handlebars.getTemplate(path);
      };
   }
   import.meta.hot.on("update-hbs", ({ path }: { path: string }) => {
      if (game.ready) {
         updateTemplateFactory(path)();
      } else {
         Hooks.once("ready", updateTemplateFactory(path));
      }
   });

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   function isValidJson(entity: any) {
      if (typeof entity !== "object" || entity === null) {
         return false;
      }
      const objPrototype = Object.getPrototypeOf(entity);
      return objPrototype === null || objPrototype === Object.prototype;
   }

   // Adds support for HMR of translation (.json) files.
   function updateLangFactory(paths: string[]) {
      return async () => {
         const relevantFile = paths.find((path) => path.endsWith(`/${game.i18n.lang}.json`));
         if (!relevantFile) { return; }
         const langObj = await foundry.utils.fetchJsonWithTimeout(relevantFile);
         if (!isValidJson(langObj)) { return; }
         foundry.utils.mergeObject(game.i18n.translations, langObj);
      };
   }
   import.meta.hot.on("update-yml", async ({ paths }: { paths: string[] }) => {
      if (game.ready) {
         updateLangFactory(paths)();
      } else {
         Hooks.once("ready", updateLangFactory(paths));
      }
   });
}
