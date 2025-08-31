import { CommonModel } from "@/sheets/CommonModel";
import { constructResourceField, type ResourceField } from "@/helpers/model-helpers";
import { type GenesysItem } from "@/sheets/items/GenesysItem";
import { $CONST } from "@/values/ValuesConst";

export class AbilityModel extends CommonModel {
   declare activation: EnumValue<typeof $CONST.AbilityActivation>;
   declare uses: ResourceField;

   async spendUses(amount: number) {
      if (this.uses.max && amount !== 0) {
         const newCurrentUses = this.uses.value - Math.round(amount);
         if (newCurrentUses >= 0 && newCurrentUses <= this.uses.max) {
            await (this.parent as GenesysItem<this>).update({ "system.uses.value": newCurrentUses });
            return true;
         }
      }
      return false;
   }

   async resetUses() {
      if (this.uses.max > 0 && this.uses.value < this.uses.max) {
         await (this.parent as GenesysItem<this>).update({ "system.uses.value": this.uses.max });
         return true;
      }
      return false;
   }

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
