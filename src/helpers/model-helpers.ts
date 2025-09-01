import { type DataField } from "@client/data/fields.mjs";

export type ResourceField = {
   max: number;
   value: number;
};

/**
 * This constructor simplifies the addition of the necessary fields used to track a generic resource.
 * @returns A `SchemaField` that can hold a current value and a maximum.
 */
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

/**
 * This constructor simplifies the addition of a `SchemaField` that will hold a reference to an entity by their name.
 * The intention is that the exact entity is not as important as the entity itself existing. This field will be
 * mostly used in combination with a parent actor; the stored reference will be compared to the "Items" embedded on the
 * parent.
 * @param extraProps Additional DataFields that should be part of the object that describes the reference.
 * @returns A `SchemaField` that can hold a reference to an entity by name.
 */
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

/**
 * This constructor simplifies the addition of a `TypedObjectField` that will hold references to other entities by
 * their name. The intention is that the exact entity is not as important as the entity itself existing. This field
 * will be mostly used in combination with a parent actor; the stored references will be compared to the "Items"
 * embedded on the parent.
 * @param extraProps Additional DataFields that should be part of the object that describes the reference.
 * @returns A `TypedObjectField` that can hold references to other entities by name.
 */
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
