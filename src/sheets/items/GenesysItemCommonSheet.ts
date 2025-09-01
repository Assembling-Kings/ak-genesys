import { type CommonModel } from "@/sheets/CommonModel";
import { GenesysItemSheet } from "@/sheets/items/GenesysItemSheet";
import { type AppRenderContext } from "@/types/Providers";
import { type ApplicationRenderContext } from "@client/applications/_types.mjs";
import { type HandlebarsRenderOptions } from "@client/applications/api/handlebars-application.mjs";

/**
 * An "Item" sheet that is reused by all the sheets that pair with a model that extends the `CommonModel`. In here we
 * add basic functionality that is shared between all those sheets.
 */
export class GenesysItemCommonSheet<Model extends CommonModel = CommonModel> extends GenesysItemSheet<Model> {
   static PARTS = {
      header: { get template() { return $ak_tplt("../CommonView[header]"); } },
      description: { get template() { return $ak_tplt("../CommonView[description]"); } },
      source: { get template() { return $ak_tplt("../CommonView[source]"); } },
   };

   protected override async _preparePartContext(
      partId: string, context: ApplicationRenderContext, options: HandlebarsRenderOptions,
   ): Promise<AppRenderContext> {
      const theContext = await super._preparePartContext(partId, context, options);
      switch (partId) {
         case "description": return await this.document.system.prepareContextForFields(theContext, ["description"]);
         case "source": return await this.document.system.prepareContextForFields(theContext, ["source"]);
         default: return theContext;
      }
   }
}
