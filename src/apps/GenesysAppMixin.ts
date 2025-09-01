import { type ApplicationFormConfiguration, type ApplicationConfiguration } from "@client/applications/_types.mjs";
import {
   type HandlebarsRenderOptions,
   type HandlebarsTemplatePart,
} from "@client/applications/api/handlebars-application.mjs";
import { type ImagePopoutConfiguration } from "@client/applications/apps/image-popout.mjs";

type AppV2Type = typeof foundry.applications.api.ApplicationV2;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppV2Constructor = new (..._args: any[]) => InstanceType<AppV2Type>;
export type AppConfiguration = Partial<
   Omit<ApplicationConfiguration, "form"> & { form: Partial<ApplicationFormConfiguration> }
>;

/**
 * This mixin augments an ApplicationV2 class with additional basic functionality.
 * @param BaseApplication The Applicationv2 class to extend.
 */
export function GenesysAppMixin<App extends AppV2Constructor = AppV2Type>(BaseApplication: App) {
   return class GenesysApplication extends foundry.applications.api.HandlebarsApplicationMixin(BaseApplication) {
      static DEFAULT_OPTIONS: AppConfiguration = {
         classes: ["genesys"],
         window: { resizable: true },
         actions: {
            openEditor: this.#openEditor,
            showImage: this.#showImage,
         },
      };

      protected override _configureRenderParts(options: HandlebarsRenderOptions) {
         const parts = super._configureRenderParts(options);
         const finalParts: Array<[string, HandlebarsTemplatePart & { order?: number }]> = [];

         Object.entries(parts).forEach((part: typeof finalParts[number]) => {
            if (part[1].order !== undefined) {
               finalParts.splice(part[1].order, 0, part);
               delete part[1].order;
            } else {
               finalParts.push(part);
            }
         });
         return Object.fromEntries(finalParts);
      }

      /**
      * Allows the user to open a "prose-mirror" element by simply clicking on it.
      * @param _event The originating click event.
      * @param target The capturing HTML element which defined a `data-action`.
      */
      static #openEditor(event: PointerEvent, target: HTMLElement & { open: boolean }) {
         if (event.detail > 1) { return; }
         target.open = true;
      }

      /**
       * Shows a bigger version of the clicked image to the user.
       * @param _event The originating click event.
       * @param target The capturing HTML element which defined a `data-action`.
       */
      static #showImage(event: PointerEvent, target: HTMLImageElement) {
         if (event.detail > 1) { return; }
         new foundry.applications.apps.ImagePopout({
            src: target.src,
            uuid: target.dataset.docUuid,
            window: { title: target.title },
         } as ApplicationConfiguration & ImagePopoutConfiguration).render({ force: true });
      }
   };
}
