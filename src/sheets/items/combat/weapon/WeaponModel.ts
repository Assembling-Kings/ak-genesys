import { BaseWeaponModel } from "@/sheets/items/combat/BaseWeaponModel";
import { $CONST } from "@/values/ValuesConst";

export class WeaponModel extends BaseWeaponModel {
   declare characteristic: Nullable<EnumValue<typeof $CONST.Characteristic>>;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { StringField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         characteristic: new StringField({
            initial: null,
            choices: Object.values($CONST.Characteristic),
            blank: false,
            nullable: true,
            trim: true,
         }),
      };
   }
}
