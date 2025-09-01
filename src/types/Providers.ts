import { type ApplicationRenderContext } from "@client/applications/_types.mjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppRenderContext = ApplicationRenderContext & Record<string, any>;

export interface ContextProvider {
   /**
    * This method is used to delegate to a parent DataModel the preparation of any special values that will be consumed
    * when rendering the app. It's expected for the parent DataModel to make modifications to the passed context and
    * return it.
    * @param context The context object that will be passed to the app for rendering.
    * @param fields An array of field names that are part of the caller DataModel.
    */
   prepareContextForFields?(context: AppRenderContext, fields: string[]): Promise<AppRenderContext>;
}
