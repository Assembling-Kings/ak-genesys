import { CommonModel } from "@/sheets/CommonModel";
import { constructResourceField, type ResourceField } from "@/helpers/model-helpers";
import { type GenesysItem } from "@/sheets/items/GenesysItem";
import { $CONST } from "@/values/ValuesConst";

export class AbilityModel extends CommonModel {
   /**
    * Represents how the ability can be activated.
    */
   declare activation: EnumValue<typeof $CONST.AbilityActivation>;
   /**
    * A friendly tracker of how many times the ability has, and can, be used.
    */
   declare uses: ResourceField;

   /**
    * Spend, or restore, a number of uses of the ability.
    * @param amount An integer that represents how many times we should use the ability. Negative numbers instead
    *        restore uses.
    * @returns `true` if we updated the current amount of ability uses.
    */
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

   /**
    * Reset the number of times the ability can be used.
    * @returns `true` if we updated the current amount of ability uses.
    */
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
