import { type AppConfiguration, type AppV2Constructor, GenesysAppMixin } from "@/apps/GenesysAppMixin";
import { type HandlebarsRenderOptions } from "@client/applications/api/handlebars-application.mjs";

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
      };

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

         return Object.assign(context, {
            system: this.document.system,
            systemFields: this.document.system.schema.fields,
            mode: modeMap,
         });
      }

      protected override async _renderFrame(options: HandlebarsRenderOptions) {
         const frame = await super._renderFrame(options);
         if (this.#canSetMode("edit")) {
            const modeIconMap: Record<SheetMode, string> = {
               view: "fa-lock",
               edit: "fa-lock-open",
            };

            // Adds a button to toggle the sheet's mode.
            const button = document.createElement("button");
            button.type = "button";
            button.classList.add(...["header-control", "icon", "fa-solid", "fa-fw", modeIconMap[this.getMode()]]);
            button.addEventListener("click", () => {
               if (this.setMode(this.getMode() === "edit" ? "view" : "edit")) {
                  Object.values(modeIconMap).forEach((iconClass) => button.classList.toggle(iconClass));
               }
               this.render();
            });

            this.window.controls.before(button);
         }
         return frame;
      }

      protected override _onClose(_options: HandlebarsRenderOptions) {
         // Reset the mode to `view` for the next time we render the sheet.
         this.setMode("view");
      }
   };
}
