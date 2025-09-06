import { type AppConfiguration } from "@/apps/GenesysAppMixin";
import { GenesysItemCommonSheet } from "@/sheets/items/GenesysItemCommonSheet";
import { type AbilityModel } from "@/sheets/items/advancement/ability/AbilityModel";
import { type ApplicationRenderContext } from "@client/applications/_types.mjs";
import { type HandlebarsRenderOptions } from "@client/applications/api/handlebars-application.mjs";
import { type DeepPartial } from "@common/_types.mjs";

export class AbilitySheet<Model extends AbilityModel = AbilityModel> extends GenesysItemCommonSheet<Model> {
   static DEFAULT_OPTIONS: AppConfiguration = {
      position: { width: 536, height: 374 },
      classes: ["ability-app"],
      actions: {
         spendUses: { handler: this.#spendUses, buttons: [0, 2] },
         resetUses: this.#resetUses,
      },
   };

   static PARTS = {
      ...GenesysItemCommonSheet.PARTS,
      main: { order: 1, get template() { return $ak_tplt("AbilityView[main]"); } },
   };

   static #MAX_DIAMONDS = 5;

   protected override async _preparePartContext(
      partId: string, context: ApplicationRenderContext, options: HandlebarsRenderOptions,
   ) {
      const theContext = await super._preparePartContext(partId, context, options);
      switch (partId) {
         case "main": {
            const uses = this.document.system.uses;
            if (this.getMode() !== "edit" && uses.max > 0) {
               // Determine how many of the shown diamonds should be filled or empty.
               const diamonds = Array(Math.min(uses.value, AbilitySheet.#MAX_DIAMONDS)).fill("full");
               diamonds.push(
                  ...Array(Math.max(Math.min(uses.max, AbilitySheet.#MAX_DIAMONDS) - uses.value, 0)).fill("empty"));
               theContext.usesGraph = {
                  diamonds,
                  extra: Math.max(uses.value - AbilitySheet.#MAX_DIAMONDS, 0),
                  showTotal: uses.max > AbilitySheet.#MAX_DIAMONDS,
               };
            }
            return theContext;
         }
         default: return theContext;
      }
   }

   override _prepareSubmitData(
      event: SubmitEvent, form: HTMLFormElement,
      formData: foundry.applications.ux.FormDataExtended, updateData?: object,
   ) {
      const submitData: DeepPartial<typeof this.document> = super._prepareSubmitData(event, form, formData, updateData);
      if (submitData.system?.uses?.value !== undefined) {
         const maxUses = submitData.system.uses.max ?? this.document.system.uses.max;

         // Make sure that the current value of uses never exceeds the maximum.
         if (submitData.system.uses.value > maxUses) {
            submitData.system.uses.value = maxUses;
            const inputElement = form.elements.namedItem("system.uses.value") as Nullable<HTMLInputElement>;
            if (inputElement) { inputElement.value = maxUses.toString(); }
         }
      }
      return submitData;
   }

   static async #spendUses(this: AbilitySheet, event: PointerEvent, _target: HTMLElement) {
      event.preventDefault(); event.stopPropagation(); if (event.detail > 1) { return; }
      await this.document.system.spendUses(event.button === 2 ? -1 : +1);
   }

   static async #resetUses(this: AbilitySheet, event: PointerEvent, _target: HTMLElement) {
      if (event.detail > 1) { return; }
      await this.document.system.resetUses();
   }
}
