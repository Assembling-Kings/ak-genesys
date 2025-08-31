import { CommonModel } from "@/sheets/CommonModel";
import { constructResourceField, type ResourceField } from "@/helpers/model-helpers";
import { type GenesysItem } from "@/sheets/items/GenesysItem";
import { $CONST } from "@/values/ValuesConst";

export class AbilityModel extends CommonModel {
   declare activation: EnumValue<typeof $CONST.AbilityActivation>;
   declare uses: ResourceField;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { StringField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         activation: new StringField({
            initial: $CONST.AbilityActivation.Passive,
            choices: Object.values($CONST.AbilityActivation),
            blank: false,
            nullable: false,
            trim: true,
         }),
         uses: constructResourceField(),
      };
   }
}
