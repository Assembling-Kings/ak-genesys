import { type ApplicationFormConfiguration, type ApplicationConfiguration } from "@client/applications/_types.mjs";
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

      /**
      * Allows the user to open a "prose-mirror" element by simply clicking on it.
      * @param _event The originating click event.
      * @param target The capturing HTML element which defined a `data-action`.
      */
      static #openEditor(_event: PointerEvent, target: HTMLElement & { open: boolean }) {
         target.open = true;
      }

      /**
       * Shows a bigger version of the clicked image to the user.
       * @param _event The originating click event.
       * @param target The capturing HTML element which defined a `data-action`.
       */
      static #showImage(_event: PointerEvent, target: HTMLImageElement) {
         new foundry.applications.apps.ImagePopout({
            src: target.src,
            uuid: target.dataset.docUuid,
            window: { title: target.title },
         } as ApplicationConfiguration & ImagePopoutConfiguration).render({ force: true });
      }
   };
}
