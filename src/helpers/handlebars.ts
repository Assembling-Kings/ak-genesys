/**
 * A helper that serializes an object. This is used mostly for passing complex data to an element.
 * @param theObject An object that we want to serialize.
 * @returns A string representation of the passed object.
 */
export function asString(theObject: object) {
   return JSON.stringify(theObject);
}

/**
 * A helper to get the choices set on the desired `DataField`.
 * @param schema The ancestor `SchemaField` that contains the field with the choices we want.
 * @param path A path to the descendant child `DataField`.
 * @returns An array of the choices set on the desired `DataField`. If none then the array is empty.
 */
export function getChoices(schema: foundry.data.fields.SchemaField, path: string) {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   return (schema.getField(path) as Optional<{ choices: any[] }>)?.choices ?? [];
}
