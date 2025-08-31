import { CommonModel } from "@/sheets/CommonModel";
import { $CONST } from "@/values/ValuesConst";

export class ArchetypeModel extends CommonModel {
   declare characteristics: Record<EnumValue<typeof $CONST.Characteristic>, number>;
   declare wounds: number;
   declare strain: number;
   declare xp: number;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { SchemaField, NumberField } = foundry.data.fields;

      return {
         ...super.defineSchema(),
         characteristics: new SchemaField(
            Object.fromEntries(
               Object.values($CONST.Characteristic).map((characteristic) => [
                  characteristic,
                  new NumberField({
                     initial: 2,
                     integer: true,
                     min: 1,
                     nullable: false,
                  }),
            ])),
            { nullable: false },
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
