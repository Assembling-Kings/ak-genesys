import { type Plugin, type ResolvedConfig } from "vite";
import path from "path";

type ReplaceTarget = {
   pattern: RegExp;
   glob: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   replace: (patternMatch: any[], filePath: string) => string;
};

export function replacePattern(targets: ReplaceTarget[]): Plugin {
   let savedConfig: ResolvedConfig;

   return {
      name: "vite-replace-pattern-in-files",
      apply: "build",
      enforce: "pre",
      configResolved(config) {
         savedConfig = config;
      },
      transform(content, filePath) {
         let transformedContent = content;
         for (const target of targets) {
            const relativePath = path.relative(savedConfig.root, filePath);
            if (!path.matchesGlob(relativePath, target.glob)) { continue; }

            const forcedPattern = new RegExp(
               target.pattern.source, target.pattern.flags.replace("y", "") + (target.pattern.global ? "" : "g"),
            );
            transformedContent = transformedContent.replaceAll(
               forcedPattern, (...patternMatch) => target.replace(patternMatch, relativePath),
            );
         }

         if (transformedContent !== content) {
            return {
               code: transformedContent,
               map: null,
            };
         }
      },
   };
}
