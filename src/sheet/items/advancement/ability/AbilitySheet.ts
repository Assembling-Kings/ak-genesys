import { type VueContext } from "@/sheet/VueApplicationMixin";
import { GenesysItemSheet } from "@/sheet/items/GenesysItemSheet";
import AbilityApp from "@/sheet/items/advancement/ability/AbilityApp.vue";
import { type AbilityModel } from "@/sheet/items/advancement/ability/AbilityModel";

export type AbilityContext = VueContext & ReturnType<AbilitySheet["getVueContext"]>;

export class AbilitySheet extends GenesysItemSheet<AbilityModel> {
   override vueParts = {
      main: AbilityApp,
   };
}
