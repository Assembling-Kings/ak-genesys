import { VueApplicationMixin } from "@/sheet/VueApplicationMixin";
import { type GenesysItem } from "@/sheet/items/GenesysItem";
import { type ApplicationConfiguration } from "@client/applications/_types.mjs";

type _ForceDefaultOptionsTyping = Partial<Omit<ApplicationConfiguration, "position">> & {
   position: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export class GenesysItemSheet<
   Model extends foundry.abstract.TypeDataModel = foundry.abstract.TypeDataModel,
> extends VueApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
   static override DEFAULT_OPTIONS = {
      classes: ["ak-genesys", "item-app"],
      form: {
         submitOnChange: true,
      },
   } as _ForceDefaultOptionsTyping;

   override getVueContext() {
      return {
         document: this.document as GenesysItem<Model>,
      };
   }
}
