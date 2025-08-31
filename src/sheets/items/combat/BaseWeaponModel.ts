import { GearModel } from "@/sheets/items/inventory/gear/GearModel";
import { constructRefsByNameField, type RefsByNameField } from "@/helpers/model-helpers";
import { $CONST } from "@/values/ValuesConst";

export class BaseWeaponModel extends GearModel {
   declare damage: number;
   declare critical: number;
   declare skill: Nullable<{ name: string; img: string }>;
   declare range: EnumValue<typeof $CONST.RangeBand>;
   declare qualities: RefsByNameField<{ rating: number }>;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { NumberField, SchemaField, StringField, FilePathField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         damage: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            max: 10,
            nullable: false,
         }),
         critical: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            nullable: false,
         }),
         skill: new SchemaField({
            name: new StringField({
               blank: false,
               nullable: false,
               trim: true,
            }),
            img: new FilePathField({
               blank: false,
               nullable: false,
               categories: ["IMAGE"],
               trim: true,
            }),
         }, {
            nullable: true,
         }),
         range: new StringField({
            initial: $CONST.RangeBand.Engaged,
            choices: Object.values($CONST.RangeBand),
            blank: false,
            nullable: false,
            trim: true,
         }),
         qualities: constructRefsByNameField({
            rating: new NumberField({
               initial: 0,
               integer: true,
               min: 0,
               nullable: false,
            }),
         }),
      };
   }
}
