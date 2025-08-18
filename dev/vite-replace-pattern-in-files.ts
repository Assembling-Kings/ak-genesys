import { type Plugin, type ResolvedConfig } from "vite";
import path from "path";

type ReplaceTarget = {
   /**
    * The pattern to match in a given file. Capturing groups will be made available to the replacer function.
    */
   pattern: RegExp;
   /**
    * A glob that points at a list of files to check the passed pattern against.
    */
   glob: string;
   /**
    * A function used to construct the string that should replace the matched pattern.
    * @param patternMatch An array that contains the result of matching the pattern to a file's content. The order of
    *    contents follow the same order as the arguments passed to a `String.prototype.replace()` replacement function.
    * @param filePath A path to the file that matched the pattern.
    * @returns A replacement string.
    */
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   replace: (patternMatch: any[], filePath: string) => string;
};

/**
 * A plugin that replaces a specific string pattern in a file with the results of the passed `replace` function.
 * @param targets List of objects that describe the replacement that needs to be done.
 */
export function replacePattern(targets: ReplaceTarget[]): Plugin {
   let savedConfig: ResolvedConfig;

   return {
      name: "vite-replace-pattern-in-files",
      apply: "build",
      enforce: "pre",
      configResolved(config) {
         savedConfig = config;
      },
      transform(fileContent, filePath) {
         let transformedContent = fileContent;
         for (const target of targets) {
            const relativePath = path.posix.relative(savedConfig.root, filePath);
            if (!path.matchesGlob(relativePath, target.glob)) { continue; }

            // Prevent the `replaceAll` call to throw an error by forcing the passed regexp to be global.
            const forcedPattern = new RegExp(
               target.pattern.source, target.pattern.flags.replace("y", "") + (target.pattern.global ? "" : "g"),
            );
            transformedContent = transformedContent.replaceAll(
               forcedPattern, (...patternMatch) => target.replace(patternMatch, relativePath),
            );
         }

         if (transformedContent !== fileContent) {
            return {
               code: transformedContent,
               map: null,
            };
         }
      },
   };
}
