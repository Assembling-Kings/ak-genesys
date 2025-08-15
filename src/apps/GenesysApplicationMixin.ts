import { type ApplicationFormConfiguration, type ApplicationConfiguration } from "@client/applications/_types.mjs";

type AppV2Type = typeof foundry.applications.api.ApplicationV2;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppV2Constructor = new (..._args: any[]) => InstanceType<AppV2Type>;

type AppConfiguration = Partial<
   Omit<ApplicationConfiguration, "form"> & { form: Partial<ApplicationFormConfiguration> }
>;

export function GenesysApplicationMixin<App extends AppV2Constructor = AppV2Type>(BaseApplication: App) {
   return class GenesysApplication extends foundry.applications.api.HandlebarsApplicationMixin(BaseApplication) {
      static DEFAULT_OPTIONS: AppConfiguration = {
         classes: ["genesys"],
         window: {
            resizable: true,
         },
      };
   };
}
