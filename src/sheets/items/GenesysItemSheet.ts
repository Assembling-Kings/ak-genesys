import { GenesysApplicationMixin } from "@/apps/GenesysApplicationMixin";
import { type GenesysItem } from "@/sheets/items/GenesysItem";

export class GenesysItemSheet<
   Model extends foundry.abstract.TypeDataModel = foundry.abstract.TypeDataModel,
> extends GenesysApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
   static DEFAULT_OPTIONS = {
      classes: ["item-app"],
      form: {
         submitOnChange: true,
      },
   };

   declare document: GenesysItem<Model>;
   declare item: GenesysItem<Model>;
}
