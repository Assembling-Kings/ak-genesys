import { type AppConfiguration } from "@/apps/GenesysAppMixin";
import { GenesysItemCommonSheet } from "@/sheets/items/GenesysItemCommonSheet";
import { type SkillModel } from "@/sheets/items/advancement/skill/SkillModel";
import { type ApplicationRenderContext } from "@client/applications/_types.mjs";
import { type HandlebarsRenderOptions } from "@client/applications/api/handlebars-application.mjs";

export class SkillSheet extends GenesysItemCommonSheet<SkillModel> {
   static DEFAULT_OPTIONS: AppConfiguration = {
      position: { width: 536, height: 400 },
      classes: ["skill-app"],
   };

   static PARTS = {
      ...GenesysItemCommonSheet.PARTS,
      header: {
         get template() { return $ak_tplt("SkillView[header]"); },
         get templates() { return $ak_tplts("../../../CommonView[header]"); },
      },
      main: { order: 1, get template() { return $ak_tplt("SkillView[main]"); } },
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
         default: return theContext;
      }
   }
}
