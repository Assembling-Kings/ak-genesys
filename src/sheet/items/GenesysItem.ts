export class GenesysItem<
   Model extends foundry.abstract.TypeDataModel = foundry.abstract.TypeDataModel,
> extends foundry.documents.Item {
   declare system: Model;
   declare img: string;
   declare name: string;
}
