import { CommonModel } from "@/sheets/CommonModel";
import { $CONST } from "@/values/ValuesConst";

export class SkillModel extends CommonModel {
   declare characteristic: EnumValue<typeof $CONST.Characteristic>;
   declare category: string;

   // Embedded-relevant properties.
   declare rank: number;
   declare career: string[];

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { StringField, NumberField, ArrayField, DocumentUUIDField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         characteristic: new StringField({
            initial: $CONST.Characteristic.Brawn,
            choices: Object.values($CONST.Characteristic),
            blank: false,
            nullable: false,
            trim: true,
         }),
         category: new StringField({
            initial: game.i18n.localize("GENESYS.fields.skill.category.initial"),
            blank: false,
            nullable: false,
            trim: true,
         }),
         rank: new NumberField({
            initial: 0,
            integer: true,
            min: 0,
            max: 5,
            nullable: false,
         }),
         career: new ArrayField(
            new DocumentUUIDField({
               embedded: true,
               trim: true,
               blank: false,
               nullable: false,
            }), {
               initial: [],
               nullable: false,
            },
         ),
      };
   }
}
