import "@client/global.d.mts";

declare global {
   class Hooks extends foundry.helpers.Hooks {}
   const fromUuid = foundry.utils.fromUuid;
}
