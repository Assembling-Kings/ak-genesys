export class GenesysItem<
   Model extends foundry.abstract.TypeDataModel = foundry.abstract.TypeDataModel,
> extends foundry.documents.Item {
   declare img: string;
   declare name: string;
   declare system: Model;
}
