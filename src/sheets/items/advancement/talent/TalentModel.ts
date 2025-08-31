import { constructRefByNameField, RefByNameField } from "@/helpers/model-helpers";
import { AbilityModel } from "@/sheets/items/advancement/ability/AbilityModel";
import { AppRenderContext } from "@/types/Providers";

export class TalentModel extends AbilityModel {
   declare tier: number;
   declare requirement: RefByNameField<{ type: "ability" | "talent" }>;

   // Embedded-relevant properties.
   declare rank: number;

   override async prepareContextForFields(context: AppRenderContext, fields: string[]) {
      await super.prepareContextForFields(context, fields);
      for (const field of fields) {
         switch (field) {
            case "tier": context.tierOptions = [1, 2, 3, 4, 5]; break;
            //No Default
         }
      }
      return context;
   }

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { NumberField, StringField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         tier: new NumberField({
            initial: 1,
            integer: true,
            min: 1,
            max: 5,
            nullable: false,
         }),
         requirement: constructRefByNameField({
            type: new StringField({
               choices: ["ability", "talent"],
               blank: false,
               nullable: false,
               trim: true,
            }),
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
