import { type ApplicationRenderContext } from "@client/applications/_types.mjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppRenderContext = ApplicationRenderContext & Record<string, any>;

export interface ContextProvider {
   prepareContextForFields?(context: AppRenderContext, fields: string[]): Promise<AppRenderContext>;
}
