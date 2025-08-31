/// <reference types="vite/client" />
import "@client/global.d.mts";

declare global {
   class Hooks extends foundry.helpers.Hooks {}
   const fromUuid = foundry.utils.fromUuid;

   // Self-defined utility types.
   type Nullable<NonNull> = NonNull | null;
   type Optional<NonOptional> = NonOptional | undefined;
   type Emptiable<NonEmpty> = NonEmpty | [];
   type EnumValue<EnumLike> = EnumLike[keyof EnumLike];

   // Helper functions used during development.
   function $ak_tplt(relativePath: string): string;
   function $ak_tplts(...relativePaths: string[]): string[];
}
