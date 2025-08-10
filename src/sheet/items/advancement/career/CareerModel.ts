import { CommonModel } from "@/sheet/CommonModel";

export class CareerModel extends CommonModel {
   declare skills: Record<string, { img: string }>;

   // Embedded-relevant properties.
   declare trained: string[];

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { TypedObjectField, SchemaField, FilePathField, ArrayField, DocumentUUIDField } = foundry.data.fields;
      return {
         ...super.defineSchema(),
         skills: new TypedObjectField(new SchemaField({
            img: new FilePathField({
               blank: false,
               nullable: false,
               categories: ["IMAGE"],
            }),
         })),
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
