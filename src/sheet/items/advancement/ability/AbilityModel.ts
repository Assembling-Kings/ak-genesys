import { CommonModel } from "@/sheet/CommonModel";
import { AbilityActivation } from "@/values/Activation";
import { constructResourceField, type ResourceField } from "@/helpers/model-helpers";

export class AbilityModel extends CommonModel {
   declare activation: EnumValue<typeof AbilityActivation>;
   declare uses: ResourceField;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { StringField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         activation: new StringField({
            initial: AbilityActivation.Passive,
            choices: Object.values(AbilityActivation),
            nullable: false,
         }),
         uses: constructResourceField(),
      };
   }
}
