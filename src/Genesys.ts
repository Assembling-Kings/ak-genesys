import "./styles/Genesys.css";
import { GenesysItem } from "@/sheets/items/GenesysItem";
import { AbilityModel } from "@/sheets/items/advancement/ability/AbilityModel";
import { AbilitySheet } from "@/sheets/items/advancement/ability/AbilitySheet";
import { ArchetypeModel } from "@/sheets/items/advancement/archetype/ArchetypeModel";
import { ArchetypeSheet } from "@/sheets/items/advancement/archetype/ArchetypeSheet";
import { CareerModel } from "@/sheets/items/advancement/career/CareerModel";
import { CareerSheet } from "@/sheets/items/advancement/career/CareerSheet";
import { SkillModel } from "@/sheets/items/advancement/skill/SkillModel";
import { SkillSheet } from "@/sheets/items/advancement/skill/SkillSheet";
import { TalentModel } from "@/sheets/items/advancement/talent/TalentModel";
import { TalentSheet } from "@/sheets/items/advancement/talent/TalentSheet";

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
   Object.entries({
      skill: SkillSheet,
      ability: AbilitySheet,
      talent: TalentSheet,
      career: CareerSheet,
      archetype: ArchetypeSheet,
   }).forEach(([itemType, itemSheet]) => {
      Items.registerSheet("genesys", itemSheet, {
         types: [itemType],
         makeDefault: true,
         label: "Genesys Sheet",
      });
   });
});
