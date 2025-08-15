import { BaseWeaponModel } from "@/sheets/items/combat/BaseWeaponModel";
import { Characteristic } from "@/values/Characteristic";

export class WeaponModel extends BaseWeaponModel {
   declare characteristic: Nullable<EnumValue<typeof Characteristic>>;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { StringField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         characteristic: new StringField({
            initial: null,
            choices: Object.values(Characteristic),
            blank: false,
            nullable: true,
            trim: true,
         }),
      };
   }
}
