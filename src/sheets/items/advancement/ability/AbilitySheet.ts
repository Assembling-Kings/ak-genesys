import { type AppConfiguration } from "@/apps/GenesysAppMixin";
import { GenesysItemSheet } from "@/sheets/items/GenesysItemSheet";
import { type AbilityModel } from "@/sheets/items/advancement/ability/AbilityModel";
import { type ApplicationRenderContext } from "@client/applications/_types.mjs";
import { type HandlebarsRenderOptions } from "@client/applications/api/handlebars-application.mjs";
import { DeepPartial } from "@common/_types.mjs";

export class AbilitySheet<Model extends AbilityModel = AbilityModel> extends GenesysItemSheet<Model> {
   static DEFAULT_OPTIONS: AppConfiguration = {
      position: {
         width: 536,
         height: 400,
      },
      actions: {
         markUsage: { handler: this.#markUsage, buttons: [0, 2] },
         resetUses: this.#resetUses,
      },
      classes: ["ability-app"],
   };

   static PARTS = {
      header: { get template() { return $ak_tplt("../../../CommonView[header]"); } },
      main: { get template() { return $ak_tplt("AbilityView[main]"); } },
      description: { get template() { return $ak_tplt("../../../CommonView[description]"); } },
      source: { get template() { return $ak_tplt("../../../CommonView[source]"); } },
   };

   protected override async _preparePartContext(
      partId: string, context: ApplicationRenderContext, options: HandlebarsRenderOptions,
   ) {
      const theContext = await super._preparePartContext(partId, context, options);
      switch (partId) {
         case "main": {
            const uses = this.document.system.uses;
            if (this.getMode() !== "edit" && uses.max > 0) {
               const MAX_DIAMONDS = 5;
               const diamonds: ("full" | "empty")[] = Array(Math.min(uses.value, MAX_DIAMONDS)).fill("full");
               diamonds.push(...Array(Math.max(Math.min(uses.max, MAX_DIAMONDS) - uses.value, 0)).fill("empty"));
               theContext.usesGraph = {
                  diamonds,
                  extra: Math.max(uses.value - MAX_DIAMONDS, 0),
                  showTotal: uses.max > MAX_DIAMONDS,
               };
            }
            return theContext;
         }
         case "description": return await this.document.system.prepareContextForFields(theContext, ["description"]);
         case "source": return await this.document.system.prepareContextForFields(theContext, ["source"]);
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
         if (submitData.system.uses.value > maxUses) {
            submitData.system.uses.value = maxUses;
            const inputElement = form.elements.namedItem("system.uses.value") as Nullable<HTMLInputElement>;//form.querySelector<HTMLInputElement>(".ability-uses-value > input");
            if (inputElement) { inputElement.value = maxUses.toString(); }
         }
      }
      return submitData;
   }

   static async #markUsage(this: AbilitySheet, event: PointerEvent, _target: HTMLElement) {
      event.preventDefault(); event.stopPropagation(); if (event.detail > 1) { return; }
      await this.document.system.spendUses(event.button === 2 ? -1 : +1);
   }

   static async #resetUses(this: AbilitySheet, event: PointerEvent, _target: HTMLElement) {
      if (event.detail > 1) { return; }
      await this.document.system.resetUses();
   }
}
