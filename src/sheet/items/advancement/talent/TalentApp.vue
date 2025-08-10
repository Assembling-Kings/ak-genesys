<script lang="ts" setup>
import { inject, computed } from "vue";
import { ContextSymbol } from "@/sheet/VueApplicationMixin";
import { type TalentContext } from "@/sheet/items/advancement/talent/TalentSheet";
import { AbilityActivation } from "@/values/Activation";

const context = inject<TalentContext>(ContextSymbol)!;
const system = computed(() => context.document.system);

const activationOptions = Object.values(AbilityActivation).map((activation) => [
   game.i18n.localize(`GENESYS.ability.activation.${activation}`), activation,
]);
</script>

<template>
   <header class="talent-header">
      <img :src="context.document.img"  data-edit="img" data-action="editImage"
         :title="context.document.name" :alt="context.document.name" />
      <input type="text" :value="context.document.name" name="name" />
   </header>

   <section class="talent-content">
      <input type="number" :value="system.tier" name="system.tier" />
      <input type="number" :value="system.rank" name="system.rank" />
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
   .talent-header {
      margin-bottom: 1em;
   }

   .talent-content {
      display: flex;
      flex-direction: column;
      gap: 1em;
   }
</style>
