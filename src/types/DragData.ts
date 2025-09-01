export type DragTransferData<ObjectData extends object = object> = {
   /**
    * The `documentClass` (Item, Actor, etc.) of the dragged document.
    */
   type: string;
   /**
    * The UUID of the dragged document. This value is rarely unavailable.
    */
   uuid?: string;
   /**
    * An object representation of the dragged document. This is typically present when the document itself has no UUID.
    */
   data?: ObjectData;
   /**
    * Additional data appended by the system that might be useful in drag and drop operations between supported
    * "Items/Actors".
    */
   genesys?: {
      /**
       * The document type (ability, skill, minion, etc.) of the dragged document.
       */
      type: string;
      /**
       * The name of the dragged document.
       */
      name: string;
      /**
       * The path to the image associated with the dragged document.
       */
      img: string;
   };
};
