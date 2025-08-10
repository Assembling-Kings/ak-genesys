import { type VueContext } from "@/sheet/VueApplicationMixin";
import { GenesysItemSheet } from "@/sheet/items/GenesysItemSheet";
import TalentApp from "@/sheet/items/advancement/talent/TalentApp.vue";
import { type TalentModel } from "@/sheet/items/advancement/talent/TalentModel";

export type TalentContext = VueContext & ReturnType<TalentSheet["getVueContext"]>;

export class TalentSheet extends GenesysItemSheet<TalentModel> {
   override vueParts = {
      main: TalentApp,
   };
}
