import { type AppConfiguration } from "@/apps/GenesysAppMixin";
import { GenesysSheetMixin } from "@/sheets/GenesysSheetMixin";
import { type GenesysItem } from "@/sheets/items/GenesysItem";

/**
 * A system specific base class for all documents of "Item" type. In here we add basic functionality that is shared by
 * all "Item" sheets.
 */
export class GenesysItemSheet<
   Model extends foundry.abstract.TypeDataModel = foundry.abstract.TypeDataModel,
> extends GenesysSheetMixin(foundry.applications.sheets.ItemSheetV2) {
   static DEFAULT_OPTIONS: AppConfiguration = {
      classes: ["item-app"],
   };

   declare document: GenesysItem<Model>;
   declare item: GenesysItem<Model>;
}
