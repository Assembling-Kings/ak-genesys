import "./Genesys.ts";

const pathEndPattern = /\/\w+\.ts/i;

globalThis.$ak_tplts = (...relativePaths: string[]) => {
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

      let relativePathTrueStart = 0;
      for (; relativePathTrueStart < splittedRelativePath.length; relativePathTrueStart++) {
         if (splittedRelativePath[relativePathTrueStart] !== "..") { break; }
      }
      if (relativePathTrueStart >= splittedPotentialPath.length) {
         throw new Error("Unable to reconcile the provided relative path with the current file path.");
      }

      const finalPath = [
         "systems/ak-genesys/tplt",
         ...splittedPotentialPath.slice(
            0, relativePathTrueStart > 0 ? -relativePathTrueStart : splittedPotentialPath.length,
         ),
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
   function updateLangFactory(langObj: object) {
      return () => {
         foundry.utils.mergeObject(game.i18n.translations, langObj);
      };
   }
   import.meta.hot.on("update-yml", async ({ path }: { path: string }) => {
      const langObj = await foundry.utils.fetchJsonWithTimeout(path);
      if (!isValidJson(langObj)) { return; }

      if (game.ready) {
         updateLangFactory(langObj)();
      } else {
         Hooks.once("ready", updateLangFactory(langObj));
      }
   });
}
