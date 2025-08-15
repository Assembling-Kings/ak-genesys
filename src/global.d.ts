/// <reference types="vite/client" />
import "@client/global.d.mts";

declare global {
   class Hooks extends foundry.helpers.Hooks {}
   const fromUuid = foundry.utils.fromUuid;

   // Self-defined utility types
   export type Nullable<NonNull> = NonNull | null;
   export type EnumValue<EnumLike> = EnumLike[keyof EnumLike];

   function $ak_tplt(relativePath: string): string;
   function $ak_tplts(...relativePaths: string[]): string[];
}
