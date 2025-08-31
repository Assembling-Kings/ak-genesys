import { CommonModel } from "@/sheets/CommonModel";
import { $CONST } from "@/values/ValuesConst";

export class GearModel extends CommonModel {
   declare rarity: number;
   declare price: number;
   declare encumbrance: number;

   // Embedded-relevant properties.
   declare condition: EnumValue<typeof $CONST.GearDamageState>;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { NumberField, StringField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         rarity: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            max: 10,
            nullable: false,
         }),
         price: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            nullable: false,
         }),
         encumbrance: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            nullable: false,
         }),
         condition: new StringField({
            initial: $CONST.GearDamageState.Undamaged,
            choices: Object.values($CONST.GearDamageState),
            blank: false,
            nullable: false,
            trim: true,
         }),
      };
   }
}
