import { type AppConfiguration, type AppV2Constructor, GenesysAppMixin } from "@/apps/GenesysAppMixin";
import { $CONST } from "@/values/ValuesConst";
import { type HandlebarsRenderOptions } from "@client/applications/api/handlebars-application.mjs";
import type FormDataExtended from "@client/applications/ux/form-data-extended.mjs";

type DocV2Type = Omit<
   typeof foundry.applications.api.DocumentSheetV2, "DEFAULT_OPTIONS"
> & AppV2Constructor & { DEFAULT_OPTIONS?: AppConfiguration };
type DocumentWithModel = foundry.abstract.Document & { system: foundry.abstract.TypeDataModel };

type SheetMode = "view" | "edit";

/**
 * A mixin that augments a DocumentV2 class with additional basic functionality to handle sheets from this system.
 * @param BaseSheet The DocumentV2 class we want to expand.
 */
export function GenesysSheetMixin<Doc extends DocV2Type = DocV2Type>(BaseSheet: Doc) {
   return class GenesysSheet extends GenesysAppMixin(BaseSheet) {
      static DEFAULT_OPTIONS: AppConfiguration = {
         form: {
            submitOnChange: true,
         },
         actions: {
            toggleMode: this.#toggleMode,
         },
      };

      /**
       * A map of each sheet's mode to the relevant classes for the toggle icon.
       */
      static #MODE_ICON_MAP: Record<SheetMode, string> = Object.freeze({
         view: "fa-lock",
         edit: "fa-lock-open",
      });

      declare document: DocumentWithModel;
      declare isEditable: boolean;

      /**
       * This variable holds the current mode of the sheet. Typically users have access of the sheet in `view` mode and
       * require owner privilages to toogle the sheet to `edit` mode.
       */
      #mode: SheetMode = "view";

      /**
       * Gets the sheet's current mode.
       */
      getMode() { return this.#mode; }

      /**
       * Check if changing to the requested mode is valid.
       * @param mode The mode we want to test if the sheet can change to.
       * @returns `true` if the sheet can change to the passed mode, `false` otherwise.
       */
      #canSetMode(mode: SheetMode) {
         switch (mode) {
            case "view": return true;
            case "edit": return this.isEditable;
            default: return false;
         }
      }

      /**
       * Sets the sheet's mode if possible.
       * @param mode The mode we want to change the sheet to.
       * @returns `true` if the sheet's mode has been updated, `false` otherwise.
       */
      setMode(mode: SheetMode) {
         if (this.#canSetMode(mode)) {
            this.#mode = mode;
            return true;
         }
         return false;
      }

      override _configureRenderOptions(options: { renderContext?: string }) {
         super._configureRenderOptions(options);
         // Set the mode to `edit` immediately after creation.
         if (options.renderContext?.startsWith("create") && this.#canSetMode("edit")) {
            this.#mode = "edit";
         }
      }

      protected override async _prepareContext(options: HandlebarsRenderOptions) {
         const context = await super._prepareContext(options);
         const modeMap: Record<SheetMode, boolean> = {
            edit: this.#mode === "edit",
            view: this.#mode === "view",
         };

         // Quick access to the DataModel and the sheet's mode.
         return Object.assign(context, {
            system: this.document.system,
            mode: modeMap,
         });
      }

      protected override async _renderFrame(options: HandlebarsRenderOptions) {
         const frame = await super._renderFrame(options);
         if (this.#canSetMode("edit")) {
            // Adds a button to toggle the sheet's mode.
            const button = document.createElement("button");
            button.type = "button";
            button.dataset.action = "toggleMode";
            button.classList.add(
               ...["header-control", "icon", "fa-solid", "fa-fw", GenesysSheet.#MODE_ICON_MAP[this.getMode()]]);
            this.window.controls.before(button);
         }
         return frame;
      }

      protected override _onClose(_options: HandlebarsRenderOptions) {
         // Reset the mode to `view` for the next time we render the sheet.
         this.setMode("view");
      }

      /**
       * Method in charge of expanding the form data with potentially additional modifications.
       * @param event The event that triggered the form submission.
       * @param form The assoaciated HTMLFormElement.
       * @param formData Processed form data that hasn't been expanded yet.
       * @returns An expanded object of processed form data.
       * @override Replaces the method defined by the `foundry.applications.api.DocumentSheetV2` base class.
       */
      protected _processFormData(
         _event: Nullable<SubmitEvent>, _form: HTMLFormElement, formData: FormDataExtended & { object: object },
      ) {
         const pathsToTransmute: string[] = [];
         // Get all the paths that point to a Map object that has the system's marker.
         for (const [modelPath, formValue] of Object.entries(formData.object)) {
            if (foundry.utils.getType(formValue) === "Map"
               && (formValue as Map<symbol, unknown>).has($CONST.SYSTEM.marker)) {
               const pathKeys = modelPath.split(".");
               // Force a full replacement for the end key since the data we are receiving already has the desired
               // structure for nested data fields.
               pathKeys[pathKeys.length - 1] = `==${pathKeys[pathKeys.length - 1]}`;
               const pathToTransmute = pathKeys.join(".");
               pathsToTransmute.push(pathToTransmute);

               delete formData.object[modelPath];
               formData.object[pathToTransmute] = formValue;
            }
         }

         const expandedData = foundry.utils.expandObject(formData.object);
         // FVTT's `expandObject` utility doesn't touch complex data types like Map so we take advantage of that to
         // transform the output of all the previously captured paths to be proper Objects.
         for (const pathToTransmute of pathsToTransmute) {
            const transmutable: Map<symbol, unknown> = foundry.utils.getProperty(expandedData, pathToTransmute);
            transmutable.delete($CONST.SYSTEM.marker);
            foundry.utils.setProperty(expandedData, pathToTransmute, Object.fromEntries(transmutable));
         }

         return expandedData;
      }

      /**
       * Method to toogle the sheet mode and update the icon on the window frame.
       * @param _event The originating click event.
       * @param target The capturing HTML element which defined a `data-action`.
       */
      static #toggleMode(this: GenesysSheet, event: PointerEvent, target: HTMLElement) {
         if (event.detail > 1) { return; }
         if (this.setMode(this.getMode() === "edit" ? "view" : "edit")) {
            Object.values(GenesysSheet.#MODE_ICON_MAP).forEach((iconClass) => target.classList.toggle(iconClass));
         }
         this.render();
      }
   };
}
