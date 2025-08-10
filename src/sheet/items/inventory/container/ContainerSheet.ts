import { GenesysItemSheet } from "@/sheet/items/GenesysItemSheet";
import { type VueContext } from "@/sheet/VueApplicationMixin";
import { type ContainerModel } from "@/sheet/items/inventory/container/ContainerModel";
import ContainerApp from "@/sheet/items/inventory/container/ContainerApp.vue";

export type ContainerContext = VueContext & ReturnType<ContainerSheet["getVueContext"]>;

export class ContainerSheet extends GenesysItemSheet<ContainerModel> {
   override vueParts = {
      main: ContainerApp,
   };
}
