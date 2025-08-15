import { CommonModel } from "@/sheets/CommonModel";

export class InjuryModel extends CommonModel {
   declare severity: number;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { NumberField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         severity: new NumberField({
            initial: 2,
            integer: true,
            min: 0,
            max: 5,
            nullable: false,
         }),
      };
   }
}
