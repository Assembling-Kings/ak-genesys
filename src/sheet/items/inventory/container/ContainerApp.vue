<script lang="ts" setup>
import { inject, computed } from "vue";
import { ContextSymbol } from "@/sheet/VueApplicationMixin";
import { type ContainerContext } from "@/sheet/items/inventory/container/ContainerSheet";
import { ItemDamageState } from "@/values/StatusEffect";

const context = inject<ContainerContext>(ContextSymbol)!;
const system = computed(() => context.document.system);

const itemDamageOptions = Object.values(ItemDamageState).map((damageState) => [
   game.i18n.localize(`GENESYS.gear.damageState.${damageState}`), damageState,
]);
</script>

<template>
   <header class="container-header">
      <img :src="context.document.img" data-edit="img" data-action="editImage"
         :title="context.document.name" :alt="context.document.name" />
      <input type="text" :value="context.document.name" name="name" />
   </header>

   <section class="container-content">
      <input type="number" :value="system.rarity" name="system.rarity" />
      <input type="number" :value="system.price" name="system.price" />
      <input type="number" :value="system.encumbrance" name="system.wounds" />

      <select :value="system.condition" name="system.condition">
         <option v-for="[label, value] in itemDamageOptions" :key="value" :value="value">
         {{ label }}
         </option>
      </select>

      <prose-mirror :value="system.description" name="system.description" />
      <input  type="text" :value="system.source" name="system.source" />
   </section>
</template>

<style>
   .container-header {
      margin-bottom: 1em;
   }

   .container-content {
      display: flex;
      flex-direction: column;
      gap: 1em;
   }
</style>
