/**
 * A type helper for easily registering custom element type definitions in Vue.
 * Source: https://vuejs.org/guide/extras/web-components#non-vue-web-components-and-typescript
 */
import { type EmitFn, type HTMLAttributes, type PublicProps } from "vue";

type EventMap = {
   [event: string]: Event;
};

// This maps an EventMap to the format that Vue's $emit type expects.
type VueEmit<T extends EventMap> = EmitFn<{
   [K in keyof T]: (event: T[K]) => void
}>;

export type DefineCustomElement<
   ElementType extends HTMLElement,
   Events extends EventMap = object,
   AdditionalAttributes extends keyof ElementType = keyof ElementType,
> = new () => ElementType & {
   // Use $props to define the properties exposed to template type checking. Vue specifically reads prop definitions
   // from the `$props` type. Note that we combine the element's props with the global HTML props and Vue's special
   // props.
   $props: HTMLAttributes & PublicProps & AdditionalAttributes;

   // Use $emit to specifically define event types. Vue specifically reads event types from the `$emit` type. Note that
   // `$emit` expects a particular format that we map `Events` to.
   $emit: VueEmit<Events>;
};
