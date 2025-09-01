import { type AppConfiguration } from "@/apps/GenesysAppMixin";
import { GenesysSheetMixin } from "@/sheets/GenesysSheetMixin";
import { type GenesysItem } from "@/sheets/items/GenesysItem";

/**
 * A system specific base class for all documents of "Item" type. In here we add basic functionality that is shared by
 * all "Item" sheets.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class GenesysItemSheet<
   Model extends foundry.abstract.TypeDataModel = foundry.abstract.TypeDataModel,
> extends GenesysSheetMixin(foundry.applications.sheets.ItemSheetV2) {
   static DEFAULT_OPTIONS: AppConfiguration = {
      classes: ["item-app"],
   };

   declare document: GenesysItem<Model>;
   declare item: GenesysItem<Model>;
}

type PrepareSubmitDataFunc = foundry.applications.sheets.ItemSheetV2["_prepareSubmitData"];
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- Mixin typing propagation
export interface GenesysItemSheet {
   _prepareSubmitData(...p: Parameters<PrepareSubmitDataFunc>): ReturnType<PrepareSubmitDataFunc>;
}
