import { BaseWeaponModel } from "@/sheets/items/combat/BaseWeaponModel";
import { FiringArcDirection } from "@/values/FiringArcDirection";

export class vWeaponModel extends BaseWeaponModel {
   declare firingArc: Record<EnumValue<typeof FiringArcDirection>, boolean>;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { BooleanField, SchemaField } = foundry.data.fields;
      const newFiringArcField = () => {
         return new BooleanField({
            initial: false,
            nullable: false,
         });
      };

      return {
         ...super.defineSchema(),
         firingArc: new SchemaField(
            Object.fromEntries(
               Object.values(FiringArcDirection).map((direction) => [direction, newFiringArcField()]),
            ),
            {
               nullable: false,
            },
         ),
      };
   }
}
