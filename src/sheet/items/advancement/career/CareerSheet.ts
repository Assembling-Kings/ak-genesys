import { type VueContext } from "@/sheet/VueApplicationMixin";
import { GenesysItemSheet } from "@/sheet/items/GenesysItemSheet";
import CareerApp from "@/sheet/items/advancement/career/CareerApp.vue";
import { type CareerModel } from "@/sheet/items/advancement/career/CareerModel";

export type CareerContext = VueContext & ReturnType<CareerSheet["getVueContext"]>;

export class CareerSheet extends GenesysItemSheet<CareerModel> {
   override vueParts = {
      main: CareerApp,
   };
}
