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
