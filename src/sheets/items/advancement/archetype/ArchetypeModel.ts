import { CommonModel } from "@/sheets/CommonModel";
import { Characteristic } from "@/values/Characteristic";

export class ArchetypeModel extends CommonModel {
   declare characteristics: Record<EnumValue<typeof Characteristic>, number>;
   declare wounds: number;
   declare strain: number;
   declare xp: number;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { SchemaField, NumberField } = foundry.data.fields;
      const newCharacteristicField = () => {
         return new NumberField({
            initial: 2,
            integer: true,
            min: 1,
            nullable: false,
         });
      };

      return {
         ...super.defineSchema(),
         characteristics: new SchemaField(
            Object.fromEntries(
               Object.values(Characteristic).map((characteristic) => [characteristic, newCharacteristicField()]),
            ),
            {
               nullable: false,
            },
         ),
         wounds: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            nullable: false,
         }),
         strain: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            nullable: false,
         }),
         xp: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            nullable: false,
         }),
      };
   }
}
