import { type ApplicationClickAction } from "@client/applications/_types.mjs";
import { type Component, type App as VueApp, type ShallowRef, createApp, shallowRef, h as createElement } from "vue";

export type VueContext = {
   renderCounter: number;
};

export const ContextSymbol = Symbol("vue-context");

type ApplicationV2Type = typeof foundry.applications.api.ApplicationV2;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApplicationV2Constructor = new (..._args: any[]) => InstanceType<ApplicationV2Type>;

/**
 * This mixin augments an ApplicationV2 class with the Vue framework for rendering.
 */
export function VueApplicationMixin<App extends ApplicationV2Constructor = ApplicationV2Type>(BaseApplication: App) {
   class VueApplication extends BaseApplication {
      /**
       * Contains a mapping of all the different parts of the application to their corresponding Vue components.
       */
      vueParts: Record<string, Component> = { };

      /**
       * Holds the Vue App instance that has all the parts as Vue components.
       */
      #vueApp: VueApp<Element>;

      /**
       * A shallow reference used to provide a pointer of the current instance to the Vue components.
       */
      #vueContext: ShallowRef<VueContext>;

      /**
       * An object that will be injected into the created VueApp. This method should be overriden by a derived class to
       * provide any relevant data.
       */
      getVueContext() {
         return {};
      }

      /**
       * Forces a re-render on the Vue components.
       *
       * We facilitate a re-render of the Vue components by updating the shallow reference with updated pointers to the tracked
       * values. We do this to ensure that the app is rendering the latest values after an event, like a form submission, might
       * have updated the underlying document (if any).
       */
      override async _renderHTML(
         _context: foundry.applications.types.ApplicationRenderContext,
         _options: foundry.applications.types.ApplicationRenderOptions,
      ) {
         if (this.#vueContext) {
            this.#vueContext.value = {
               renderCounter: this.#vueContext.value.renderCounter + 1,
               ...this.getVueContext(),
            };
         }
      }

      /**
       * Initializes the Vue components and mount them.
       *
       * The first time we render this app we create a VueApp, add all the specified Vue components, and mount it. We also enable
       * additional functionality by providing the context and attaching the actions that were listed as part of the app's
       * `DEFAULT_OPTIONS`.
       * @param content - The content element into which the Vue app will be mounted
       */
      protected override _replaceHTML(
         _result: any, // eslint-disable-line @typescript-eslint/no-explicit-any
         content: HTMLElement,
         _options: foundry.applications.types.ApplicationRenderOptions,
      ) {
         if (!this.#vueApp) {
            this.#vueContext = shallowRef({
               // This field is not super relevant and is mostly used to determine if it's the first time we render this app.
               renderCounter: 0,
               // Additional context fields provided by a sheet that should be passed down to the VueApp.
               ...this.getVueContext(),
            });

            this.#vueApp = createApp({
               render: () => {
                  const nodes = [];
                  for (const [vuePartId, vueComponent] of Object.entries(this.vueParts)) {
                     nodes.push(
                        createElement("div", { "data-application-part": vuePartId }, [createElement(vueComponent)]),
                     );
                  }
                  return nodes;
               },
            }).mixin({
               updated: () => {
                  // TODO: Find a way to call the expected rendering hooks, potentially wrapped around a `nextTick()`
                  // call to prevent overzealous calling of hooks. Additionally, some type of tracking might be needed
                  // to minimize the possibility of a consumer inserting "the same element" on the DOM multiple times.
               },
            }).provide(
               ContextSymbol, this.#vueContext.value,
            );

            this._attachPartListeners();

            this.#vueApp.mount(content);
         }
      }

      /**
       * Closes the Application, removing it from the DOM.
       */
      override async close(options?: Partial<foundry.applications.types.ApplicationClosingOptions>) {
         await super.close(options);
         this.#vueApp?.unmount();
         this.#vueApp = undefined;
         this.#vueContext = undefined;

         return this;
      }

      /**
       * Provide all the click actions supported by the Application.
       */
      _attachPartListeners() {
         // Make sure all the configured actions on the `DEFAULT_OPTIONS` chain are provided to all the Vue components.
         const configuredActions = Object.entries(this.options.actions ?? {});
         for (const [actionName, action] of configuredActions) {
            const boundAction = Object.hasOwn(action, "handler")
               ? (action as { handler: ApplicationClickAction }).handler.bind(this)
               : (action as ApplicationClickAction).bind(this);
            this.#vueApp?.provide(actionName, boundAction);
         }
      }
   }

   return VueApplication;
}
