import { GenesysItemSheet } from "@/sheet/items/GenesysItemSheet";
import SkillApp from "@/sheet/items/advancement/skill/SkillApp.vue";
import { type SkillModel } from "@/sheet/items/advancement/skill/SkillModel";
import { type VueContext } from "@/sheet/VueApplicationMixin";

export type SkillContext = VueContext & ReturnType<SkillSheet["getVueContext"]>;

export class SkillSheet extends GenesysItemSheet<SkillModel> {
   override vueParts = {
      main: SkillApp,
   };
}
