import { BaseWeaponModel } from "@/sheets/items/combat/BaseWeaponModel";
import { $CONST } from "@/values/ValuesConst";

export class vWeaponModel extends BaseWeaponModel {
   declare firingArc: Record<EnumValue<typeof $CONST.FiringArcDirection>, boolean>;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { BooleanField, SchemaField } = foundry.data.fields;

      return {
         ...super.defineSchema(),
         firingArc: new SchemaField(
            Object.fromEntries(
               Object.values($CONST.FiringArcDirection).map((direction) => [
                  direction,
                  new BooleanField({
                     initial: false,
                     nullable: false,
                  }),
               ])),
            { nullable: false },
         ),
      };
   }
}
