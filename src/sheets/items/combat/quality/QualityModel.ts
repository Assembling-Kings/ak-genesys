import { QualityActivation } from "@/values/Activation";
import { CommonModel } from "@/sheets/CommonModel";

export class QualityModel extends CommonModel {
   declare activation: EnumValue<typeof QualityActivation>;
   declare rated: boolean;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { StringField, BooleanField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         activation: new StringField({
            initial: QualityActivation.Passive,
            choices: Object.values(QualityActivation),
            blank: false,
            nullable: false,
            trim: true,
         }),
         rated: new BooleanField({
            initial: false,
            nullable: false,
         }),
      };
   }
}
