import { DragTransferData } from "@/types/DragData";

export class GenesysItem<
   Model extends foundry.abstract.TypeDataModel = foundry.abstract.TypeDataModel,
> extends foundry.documents.Item {
   declare type: string;
   declare name: string;
   declare img: string;
   declare system: Model;

   toDragData() {
      // @ts-expect-error -- `ClientDocumentMixin` doesn't play well with typescript.
      const dragData: DragTransferData = super.toDragData();
      dragData.genesys = {
         type: this.type,
         name: this.name,
         img: this.img,
      };
      return dragData;
   }
}
