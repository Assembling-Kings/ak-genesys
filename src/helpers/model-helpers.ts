import { type DataField } from "@client/data/fields.mjs";

export type ResourceField = {
   max: number;
   value: number;
};
export function constructResourceField() {
   const { SchemaField, NumberField } = foundry.data.fields;
   return new SchemaField({
      max: new NumberField({
         initial: 0,
         integer: true,
         min: 0,
         nullable: false,
      }),

      // Embedded-relevant property.
      value: new NumberField({
         initial: 0,
         integer: true,
         min: 0,
         nullable: false,
      }),
   });
}

export type RefByNameField<ExtraProps extends object = object> = Nullable<{
   img: string;
} & ExtraProps>;
export function constructRefByNameField(extraProps?: Record<string, DataField>) {
   const { SchemaField, StringField, FilePathField } = foundry.data.fields;
   return new SchemaField({
      name: new StringField({
         blank: false,
         nullable: false,
         trim: true,
      }),
      img: new FilePathField({
         blank: false,
         nullable: false,
         categories: ["IMAGE"],
         trim: true,
      }),
      ...extraProps,
   }, {
      initial: null,
      nullable: true,
   });
}

export type RefsByNameField<ExtraProps extends object = object> = Record<string, {
   img: string;
} & ExtraProps>;
export function constructRefsByNameField(extraProps?: Record<string, DataField>) {
   const { TypedObjectField, SchemaField, FilePathField } = foundry.data.fields;
   return new TypedObjectField(
      new SchemaField({
         img: new FilePathField({
            blank: false,
            nullable: false,
            categories: ["IMAGE"],
            trim: true,
         }),
         ...extraProps,
      }, {
         nullable: false,
      }), {
         initial: {},
         nullable: false,
      },
   );
}
