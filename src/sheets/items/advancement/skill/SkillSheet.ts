import { type AppConfiguration } from "@/apps/GenesysAppMixin";
import { GenesysItemSheet } from "@/sheets/items/GenesysItemSheet";
import { type SkillModel } from "@/sheets/items/advancement/skill/SkillModel";
import { type ApplicationRenderContext } from "@client/applications/_types.mjs";
import { type HandlebarsRenderOptions } from "@client/applications/api/handlebars-application.mjs";

export class SkillSheet extends GenesysItemSheet<SkillModel> {
   static DEFAULT_OPTIONS: AppConfiguration = {
      position: {
         width: 536,
         height: 400,
      },
   };

   protected override async _preparePartContext(
      partId: string, context: ApplicationRenderContext, options: HandlebarsRenderOptions,
   ) {
      const theContext = await super._preparePartContext(partId, context, options);
      switch (partId) {
         case "header": {
            const charLabel = game.i18n.localize(
               `GENESYS.values.characteristic.${this.document.system.characteristic}.label`);
            theContext.displayName = `${this.document.name} (${charLabel})`;
            return theContext;
         }
         case "main": return await this.document.system.prepareContextForFields(theContext, ["description"]);
         case "source": return await this.document.system.prepareContextForFields(theContext, ["source"]);
         default: return theContext;
      }
   }

   static PARTS = {
      header: {
         get template() { return $ak_tplt("SkillView[header]"); },
         get templates() { return $ak_tplts("../../../CommonView[header]"); },
      },
      main: {
         get template() { return $ak_tplt("SkillView[main]"); },
      },
      source: {
         get template() { return $ak_tplt("../../../CommonView[source]"); },
      },
   };
}
