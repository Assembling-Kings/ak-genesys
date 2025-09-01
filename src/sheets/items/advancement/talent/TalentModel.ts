import { constructRefByNameField, type RefByNameField } from "@/helpers/model-helpers";
import { AbilityModel } from "@/sheets/items/advancement/ability/AbilityModel";
import { type AppRenderContext } from "@/types/Providers";

export class TalentModel extends AbilityModel {
   /**
    * The talent's tier value.
    */
   declare tier: number;
   /**
    * A friendly way to show that a talent has another talent or ability as a requirement.
    */
   declare requirement: RefByNameField<{ type: "ability" | "talent" }>;

   /**
    * This value serves both as an indication that the talent is ranked (if the value is at least 1), and as the
    * actor's current rank value for the talent.
    */
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
