import { type AppRenderContext, type ContextProvider } from "@/types/Providers";

export class CommonModel extends foundry.abstract.TypeDataModel implements ContextProvider {
   /**
    * A text note that describes the origin of the real world data used for the document.
    */
   declare source: string;
   /**
    * This field is used to hold the textual information and/or description of a document.
    */
   declare description: string;

   async prepareContextForFields(context: AppRenderContext, fields: string[]) {
      const enrichHTML = foundry.applications.ux.TextEditor.implementation.enrichHTML;
      for (const field of fields) {
         switch (field) {
            case "source": context.enrSource = await enrichHTML(this.source); break;
            case "description": context.enrDescription = await enrichHTML(this.description); break;
            //No Default
         }
      }
      return context;
   }

   static override defineSchema(): foundry.abstract.types.DataSchema {
      const { HTMLField } = foundry.data.fields;
      return {
         source: new HTMLField({
            initial: "",
            nullable: false,
            trim: true,
         }),
         description: new HTMLField({
            initial: "",
            nullable: false,
            trim: true,
         }),
      };
   }
}
