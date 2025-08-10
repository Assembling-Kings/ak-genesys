import { type VueContext } from "@/sheet/VueApplicationMixin";
import { GenesysItemSheet } from "@/sheet/items/GenesysItemSheet";
import ArchetypeApp from "@/sheet/items/advancement/archetype/ArchetypeApp.vue";
import { type ArchetypeModel } from "@/sheet/items/advancement/archetype/ArchetypeModel";

export type ArchetypeContext = VueContext & ReturnType<ArchetypeSheet["getVueContext"]>;

export class ArchetypeSheet extends GenesysItemSheet<ArchetypeModel> {
   override vueParts = {
      main: ArchetypeApp,
   };
}
