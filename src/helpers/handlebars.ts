export function asString(theObject: object) {
   return JSON.stringify(theObject);
}

export function getChoices(schema: foundry.data.fields.SchemaField, path: string) {
   return (schema.getField(path) as Optional<{ choices: any[] }>)?.choices ?? [];
}