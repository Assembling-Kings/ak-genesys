import "@/Genesys.css";
import { ReferenceHolderElement } from "@/elements/ReferenceHolderElement";
import { asString, getChoices } from "@/helpers/handlebars";
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
import { ArmorModel } from "@/sheets/items/combat/armor/ArmorModel";
import { ArmorSheet } from "@/sheets/items/combat/armor/ArmorSheet";
import { InjuryModel } from "@/sheets/items/combat/injury/InjuryModel";
import { InjurySheet } from "@/sheets/items/combat/injury/InjurySheet";
import { QualityModel } from "@/sheets/items/combat/quality/QualityModel";
import { QualitySheet } from "@/sheets/items/combat/quality/QualitySheet";
import { vInjuryModel } from "@/sheets/items/combat/v_injury/vInjuryModel";
import { vInjurySheet } from "@/sheets/items/combat/v_injury/vInjurySheet";
import { vWeaponModel } from "@/sheets/items/combat/v_weapon/vWeaponModel";
import { vWeaponSheet } from "@/sheets/items/combat/v_weapon/vWeaponSheet";
import { WeaponModel } from "@/sheets/items/combat/weapon/WeaponModel";
import { WeaponSheet } from "@/sheets/items/combat/weapon/WeaponSheet";
import { ConsumableModel } from "@/sheets/items/inventory/consumable/ConsumableModel";
import { ConsumableSheet } from "@/sheets/items/inventory/consumable/ConsumableSheet";
import { ContainerModel } from "@/sheets/items/inventory/container/ContainerModel";
import { ContainerSheet } from "@/sheets/items/inventory/container/ContainerSheet";
import { GearModel } from "@/sheets/items/inventory/gear/GearModel";
import { GearSheet } from "@/sheets/items/inventory/gear/GearSheet";
import { $CONST } from "@/values/ValuesConst";

/**
 * Register custom elements.
 */
[
   ReferenceHolderElement,
].forEach((element) => {
   window.customElements.define(element.tagName, element);
});

Hooks.once("init", () => {
   /**
    * Register Document classes and Data Models for all of the system's types.
    */
   CONFIG.Item.documentClass = GenesysItem;
   CONFIG.Item.dataModels = {
      ability: AbilityModel,
      archetype: ArchetypeModel,
      career: CareerModel,
      skill: SkillModel,
      talent: TalentModel,

      armor: ArmorModel,
      injury: InjuryModel,
      quality: QualityModel,
      weapon: WeaponModel,

      consumable: ConsumableModel,
      container: ContainerModel,
      gear: GearModel,

      v_injury: vInjuryModel,
      v_weapon: vWeaponModel,
   };

   // TODO: Add a way to "remember" what was the last type created.
   // CONFIG.Item.defaultType = "myType";

   /**
    * Register Sheets for all of the system's types.
    */
   const { Items } = foundry.documents.collections;
   Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
   Object.entries({
      ability: AbilitySheet,
      archetype: ArchetypeSheet,
      career: CareerSheet,
      skill: SkillSheet,
      talent: TalentSheet,

      armor: ArmorSheet,
      injury: InjurySheet,
      quality: QualitySheet,
      weapon: WeaponSheet,

      consumable: ConsumableSheet,
      container: ContainerSheet,
      gear: GearSheet,

      v_injury: vInjurySheet,
      v_weapon: vWeaponSheet,
   }).forEach(([itemType, itemSheet]) => {
      Items.registerSheet("genesys", itemSheet, {
         types: [itemType],
         makeDefault: true,
         label: "Genesys Sheet",
      });
   });

   /**
    * Register additional fonts used by the system.
    */
   Object.entries({
      ["Bebas Neue"]: [["BebasNeue-Regular.ttf"]],
      ["Genesys Glyphs"]: [["GenesysGlyphsAndDice.woff2"]],
      ["Roboto Condensed"]: [
         ["RobotoCondensed-VariableFont_wght.ttf", "normal", "100 900"],
         ["RobotoCondensed-Italic-VariableFont_wght.ttf", "italic", "100 900"]],
      ["Roboto Serif"]: [
         ["RobotoSerif-VariableFont_GRAD,opsz,wdth,wght.ttf", "normal", "100 900"],
         ["RobotoSerif-Italic-VariableFont_GRAD,opsz,wdth,wght.ttf", "italic", "100 900"]],
      ["Roboto Slab"]: [["RobotoSlab-VariableFont_wght.ttf", "normal", "100 900"]],
   }).forEach(([fontName, fonts]) => {
      CONFIG.fontDefinitions[fontName] = {
         editor: true,
         fonts: fonts.map(([fontFile, style = "normal", weight = "400"]) => ({
            urls: [`systems/${$CONST.SYSTEM.id}/font/${fontFile}`], style, weight,
         })),
      };
   });

   /**
    * Register additional Handlebars helpers.
    */
   Object.entries({
      asString,
      getChoices,
   }).forEach(([funcName, funcHelper]) => {
      Handlebars.registerHelper(funcName, funcHelper);
   });
});
