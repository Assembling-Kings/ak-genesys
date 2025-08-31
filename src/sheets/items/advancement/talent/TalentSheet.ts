import { AbilitySheet } from "@/sheets/items/advancement/ability/AbilitySheet";
import { type TalentModel } from "@/sheets/items/advancement/talent/TalentModel";
import { DragTransferData } from "@/types/DragData";
import { ApplicationRenderContext } from "@client/applications/_types.mjs";
import { HandlebarsRenderOptions } from "@client/applications/api/handlebars-application.mjs";

export class TalentSheet extends AbilitySheet<TalentModel> {
   static DEFAULT_OPTIONS = {
      position: {
         width: 536,
         height: 435,
      },
      classes: ["talent-app"],
   };

   static PARTS = {
      ...AbilitySheet.PARTS,
      header: {
         get template() { return $ak_tplt("TalentView[header]"); },
         get templates() { return $ak_tplts("../../../CommonView[header]"); },
      },
      extra: { order: 1, get template() { return $ak_tplt("TalentView[extra]"); } },
   };

   protected override async _preparePartContext(partId: string, context: ApplicationRenderContext, options: HandlebarsRenderOptions) {
      const theContext = await super._preparePartContext(partId, context, options);
      switch (partId) {
         case "extra": return await this.document.system.prepareContextForFields(theContext, ["tier"]);
         default: return theContext;
      }
   }

   protected override async _onRender(_context: ApplicationRenderContext, _options: HandlebarsRenderOptions) {
      this.element.querySelector('[name="system.requirement"]')?.addEventListener("drop", (event: DragEvent) => {
         const dropData: Partial<DragTransferData> = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
         if (dropData.uuid === this.document.uuid) {
            event.preventDefault();
            event.stopPropagation();
         }
      }, { capture: true });
   }
}
