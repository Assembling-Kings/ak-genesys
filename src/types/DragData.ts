export type DragTransferData<ObjectData extends object = object> = {
   type: string;
   uuid?: string;
   data?: ObjectData;
   genesys?: {
      type: string;
      name: string;
      img: string;
   };
};