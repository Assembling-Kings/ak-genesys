import { GenesysItemSheet } from "@/sheet/items/GenesysItemSheet";
import { type VueContext } from "@/sheet/VueApplicationMixin";
import { type ConsumableModel } from "@/sheet/items/inventory/consumable/ConsumableModel";
import ConsumableApp from "@/sheet/items/inventory/consumable/ConsumableApp.vue";

export type ConsumableContext = VueContext & ReturnType<ConsumableSheet["getVueContext"]>;

export class ConsumableSheet extends GenesysItemSheet<ConsumableModel> {
   override vueParts = {
      main: ConsumableApp,
   };
}
