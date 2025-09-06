import { GenesysItemCommonSheet } from "@/sheets/items/GenesysItemCommonSheet";
import { type CareerModel } from "@/sheets/items/advancement/career/CareerModel";

export class CareerSheet extends GenesysItemCommonSheet<CareerModel> {
   static DEFAULT_OPTIONS = {
      position: { width: 536, height: 522 },
      classes: ["career-app"],
   };

   static PARTS = {
      ...GenesysItemCommonSheet.PARTS,
      main: { order: 2, get template() { return $ak_tplt("CareerView[main]"); } },
   };
}
