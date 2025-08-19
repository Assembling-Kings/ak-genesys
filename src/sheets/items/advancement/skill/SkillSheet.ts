import { GenesysItemSheet } from "@/sheets/items/GenesysItemSheet";
import { type SkillModel } from "@/sheets/items/advancement/skill/SkillModel";

export class SkillSheet extends GenesysItemSheet<SkillModel> {
   static DEFAULT_OPTIONS = {
      position: {
         width: 536,
         height: "auto",
      },
   } as const;

   static PARTS = {
      header: {
         get template() { return $ak_tplt("SkillView[header]"); },
         get templates() { return $ak_tplts("../../../CommonView[header]"); },
      },
      main: {
         get template() { return $ak_tplt("SkillView[main]"); },
      },
      source: {
         get template() { return $ak_tplt("../../../CommonView[source]"); },
      },
   };
}
