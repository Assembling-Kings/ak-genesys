import { type AppConfiguration, GenesysAppMixin } from "@/apps/GenesysAppMixin";
import { type GenesysItem } from "@/sheets/items/GenesysItem";

export class GenesysItemSheet<
   Model extends foundry.abstract.TypeDataModel = foundry.abstract.TypeDataModel,
> extends GenesysAppMixin(foundry.applications.sheets.ItemSheetV2) {
   static DEFAULT_OPTIONS: AppConfiguration = {
      classes: ["item-app"],
      form: {
         submitOnChange: true,
      },
   };

   declare document: GenesysItem<Model>;
   declare item: GenesysItem<Model>;
}
