export class CommonModel extends foundry.abstract.TypeDataModel {
   declare source: string;
   declare description: string;

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { HTMLField } = foundry.data.fields;
      return {
         source: new HTMLField({
            initial: "",
            nullable: false,
            trim: true,
         }),
         description: new HTMLField({
            initial: "",
            nullable: false,
            trim: true,
         }),
      };
   }
}
