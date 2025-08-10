import "@client/global.d.mts";
import { type DefineCustomElement } from "@/types/DefineCustomElement";
import { type ProseMirrorInputConfig } from "foundry/client/applications/elements/prosemirror-editor.mjs";
import { type FormInputConfig } from "foundry/common/data/_types.mjs";

declare global {
   class Hooks extends foundry.helpers.Hooks {}
   const fromUuid = foundry.utils.fromUuid;

   // Self-defined utility types
   export type Nullable<NonNull> = NonNull | null;
   export type EnumValue<EnumLike> = EnumLike[keyof EnumLike];
}

declare module "vue" {
   interface GlobalComponents {
      "prose-mirror": DefineCustomElement<
         foundry.applications.elements.HTMLProseMirrorElement,
         {
            open: Event;
            close: Event;
            save: Event;
            plugins: Event;
         },
         Partial<Omit<ProseMirrorInputConfig, "documentUUID"> & { dataDocumentUuid: string }> & FormInputConfig,
      >;
   }
}
