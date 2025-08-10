import { AbilityModel } from "@/sheet/items/advancement/ability/AbilityModel";

export class TalentModel extends AbilityModel {
   declare tier: number;
   declare rank: number;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { NumberField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         tier: new NumberField({
            initial: 1,
            integer: true,
            min: 1,
            max: 5,
            nullable: false,
         }),
         rank: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            nullable: false,
         }),
      };
   }
}
