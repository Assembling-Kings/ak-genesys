import { type DragTransferData } from "@/types/DragData";

/**
 * The system's implementation of an "Item", which is used client-side to represent an "Item" Document on the server.
 */
export class GenesysItem<
   Model extends foundry.abstract.TypeDataModel = foundry.abstract.TypeDataModel,
> extends foundry.documents.Item {
   declare type: string;
   declare name: string;
   declare img: string;
   declare system: Model;

   /**
    * Provides basic data about the dragged Document for the system to consume as it see fits.
    * @returns An object with additional data that will be serialized and added to the DragEvent.
    * @override Replaces the method defined by the `foundry.documents.abstract.ClientDocumentMixin` mixin.
    */
   toDragData() {
      const dragData = super.toDragData() as DragTransferData;
      dragData.genesys = {
         type: this.type,
         name: this.name,
         img: this.img,
      };
      return dragData;
   }
}

// Mixin typing propagation.
declare module "foundry/client/documents/item.mjs" {
   export default interface Item {
      toDragData(): object;
   }
}
