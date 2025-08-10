import { GenesysItemSheet } from "@/sheet/items/GenesysItemSheet";
import { type VueContext } from "@/sheet/VueApplicationMixin";
import { type GearModel } from "@/sheet/items/inventory/gear/GearModel";
import GearApp from "@/sheet/items/inventory/gear/GearApp.vue";

export type GearContext = VueContext & ReturnType<GearSheet["getVueContext"]>;

export class GearSheet extends GenesysItemSheet<GearModel> {
   override vueParts = {
      main: GearApp,
   };
}
