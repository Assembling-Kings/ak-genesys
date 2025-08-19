import { type ApplicationFormConfiguration, type ApplicationConfiguration } from "@client/applications/_types.mjs";
import { type HandlebarsRenderOptions } from "@client/applications/api/handlebars-application.mjs";

type AppV2Type = typeof foundry.applications.api.ApplicationV2;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppV2Constructor = new (..._args: any[]) => InstanceType<AppV2Type>;
type DocumentWithModel = foundry.abstract.Document & { system: foundry.abstract.TypeDataModel };

export type AppConfiguration = Partial<
   Omit<ApplicationConfiguration, "form"> & { form: Partial<ApplicationFormConfiguration> }
>;

export function GenesysAppMixin<App extends AppV2Constructor = AppV2Type>(BaseApplication: App) {
   return class GenesysApplication extends foundry.applications.api.HandlebarsApplicationMixin(BaseApplication) {
      declare document: DocumentWithModel;

      static DEFAULT_OPTIONS: AppConfiguration = {
         classes: ["genesys"],
         window: {
            resizable: true,
         },
         actions: {
            openEditor: this.#openEditor,
         },
      };

      protected override async _prepareContext(options: HandlebarsRenderOptions) {
         const context = await super._prepareContext(options);
         return Object.assign(context, {
            system: this.document.system,
            systemFields: this.document.system.schema.fields,
         });
      }

      /**
      * Allows the user to open a "prose-mirror" element by simply clicking on it.
      * @param event The originating click event.
      * @param target The capturing HTML element which defined a `data-action`.
      */
      static #openEditor(event: PointerEvent, target: HTMLElement & { open: boolean }) {
         target.open = true;
      }
   };
}
