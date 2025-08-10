<script lang="ts" setup>
import { inject, computed } from "vue";
import { ContextSymbol } from "@/sheet/VueApplicationMixin";
import { type AbilityContext } from "@/sheet/items/advancement/ability/AbilitySheet";
import { AbilityActivation } from "@/values/Activation";

const context = inject<AbilityContext>(ContextSymbol)!;
const system = computed(() => context.document.system);

const activationOptions = Object.values(AbilityActivation).map((activation) => [
   game.i18n.localize(`GENESYS.ability.activation.${activation}`), activation,
]);
</script>

<template>
   <header class="ability-header">
      <img :src="context.document.img"  data-edit="img" data-action="editImage"
         :title="context.document.name" :alt="context.document.name" />
      <input type="text" :value="context.document.name" name="name" />
   </header>

   <section class="ability-content">
      <input type="number" :value="system.uses.max" name="system.uses.max" />
      <select :value="system.activation" name="system.activation">
         <option v-for="[label, value] in activationOptions" :key="value" :value="value">
         {{ label }}
         </option>
      </select>

      <prose-mirror :value="system.description" name="system.description" />
      <input  type="text" :value="system.source" name="system.source" />
   </section>

</template>

<style>
   .ability-header {
      margin-bottom: 1em;
   }

   .ability-content {
      display: flex;
      flex-direction: column;
      gap: 1em;
   }
</style>
