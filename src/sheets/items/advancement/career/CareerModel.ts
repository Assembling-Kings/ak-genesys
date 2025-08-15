import { CommonModel } from "@/sheets/CommonModel";
import { constructRefsByNameField, type RefsByNameField } from "@/helpers/model-helpers";

export class CareerModel extends CommonModel {
   declare skills: RefsByNameField;

   // Embedded-relevant properties.
   declare trained: string[];

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { ArrayField, DocumentUUIDField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         skills: constructRefsByNameField(),
         trained: new ArrayField(new DocumentUUIDField({
            embedded: true,
            trim: true,
         }), {
            initial: [],
            nullable: false,
         }),
      };
   }
}
