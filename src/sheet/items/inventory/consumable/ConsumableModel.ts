import { GearModel } from "@/sheet/items/inventory/gear/GearModel";

export class ConsumableModel extends GearModel {
   // Embedded-relevant properties.
   declare quantity: number;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { NumberField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         quantity: new NumberField({
            initial: 1,
            integer: true,
            min: 0,
            nullable: false,
         }),
      };
   }
}
