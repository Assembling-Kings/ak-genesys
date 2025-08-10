import "./styles/Genesys.css";
import { GenesysItem } from "@/sheet/items/GenesysItem";
import { AbilityModel } from "@/sheet/items/advancement/ability/AbilityModel";
import { AbilitySheet } from "@/sheet/items/advancement/ability/AbilitySheet";
import { ArchetypeModel } from "@/sheet/items/advancement/archetype/ArchetypeModel";
import { ArchetypeSheet } from "@/sheet/items/advancement/archetype/ArchetypeSheet";
import { CareerModel } from "@/sheet/items/advancement/career/CareerModel";
import { CareerSheet } from "@/sheet/items/advancement/career/CareerSheet";
import { SkillModel } from "@/sheet/items/advancement/skill/SkillModel";
import { SkillSheet } from "@/sheet/items/advancement/skill/SkillSheet";
import { TalentModel } from "@/sheet/items/advancement/talent/TalentModel";
import { TalentSheet } from "@/sheet/items/advancement/talent/TalentSheet";

Hooks.once("init", () => {
   CONFIG.Item.documentClass = GenesysItem;
   CONFIG.Item.dataModels = {
      skill: SkillModel,
      ability: AbilityModel,
      talent: TalentModel,
      career: CareerModel,
      archetype: ArchetypeModel,
   };

   const { Items } = foundry.documents.collections;

   Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
   Items.registerSheet("genesys", SkillSheet, {
      types: ["skill"],
      makeDefault: true,
      label: "Genesys Sheet",
   });
   Items.registerSheet("genesys", AbilitySheet, {
      types: ["ability"],
      makeDefault: true,
      label: "Genesys Sheet",
   });
   Items.registerSheet("genesys", TalentSheet, {
      types: ["talent"],
      makeDefault: true,
      label: "Genesys Sheet",
   });
   Items.registerSheet("genesys", CareerSheet, {
      types: ["career"],
      makeDefault: true,
      label: "Genesys Sheet",
   });
   Items.registerSheet("genesys", ArchetypeSheet, {
      types: ["archetype"],
      makeDefault: true,
      label: "Genesys Sheet",
   });
});
