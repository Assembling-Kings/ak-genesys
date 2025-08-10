import { type DefineCustomElement } from "@/types/DefineCustomElement";
import "@client/global.d.mts";
import { type ProseMirrorInputConfig } from "foundry/client/applications/elements/prosemirror-editor.mjs";
import { type FormInputConfig } from "foundry/common/data/_types.mjs";

declare global {
   class Hooks extends foundry.helpers.Hooks {}
   const fromUuid = foundry.utils.fromUuid;

   //// Own ones
   export type Nullable<NonNull> = NonNull | null;
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
         Partial<Omit<ProseMirrorInputConfig, "documentUUID">
         & { dataDocumentUuid: string }>
         & FormInputConfig,
      >;
   }
}
