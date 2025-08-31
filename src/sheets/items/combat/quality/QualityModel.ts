import { CommonModel } from "@/sheets/CommonModel";
import { $CONST } from "@/values/ValuesConst";

export class QualityModel extends CommonModel {
   declare activation: EnumValue<typeof $CONST.QualityActivation>;
   declare rated: boolean;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { StringField, BooleanField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         activation: new StringField({
            initial: $CONST.QualityActivation.Passive,
            choices: Object.values($CONST.QualityActivation),
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
