import { GearModel } from "@/sheets/items/inventory/gear/GearModel";
import { constructRefsByNameField, type RefsByNameField } from "@/helpers/model-helpers";

export class ArmorModel extends GearModel {
   declare defense: number;
   declare soak: number;
   declare qualities: RefsByNameField<{ rating: number }>;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { NumberField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         defense: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            nullable: false,
         }),
         soak: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            nullable: false,
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
