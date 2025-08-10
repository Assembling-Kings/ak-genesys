<script lang="ts" setup>
import { inject, computed } from "vue";
import { ContextSymbol } from "@/sheet/VueApplicationMixin";
import { type SkillContext } from "@/sheet/items/advancement/skill/SkillSheet";
import { Characteristic } from "@/values/Characteristic";

const context = inject<SkillContext>(ContextSymbol)!;
const system = computed(() => context.document.system);

const characteristicOptions = Object.values(Characteristic).map((characteristic) => [
   game.i18n.localize(`GENESYS.stat.characteristic.${characteristic}.label`), characteristic,
]);
</script>

<template>
   <header class="skill-header">
      <img :src="context.document.img" data-edit="img" data-action="editImage"
         :title="context.document.name" :alt="context.document.name" />
      <input type="text" :value="context.document.name" name="name" />
   </header>

   <section class="skill-content">
      <select :value="system.characteristic" name="system.characteristic">
         <option v-for="[label, value] in characteristicOptions" :key="value" :value="value">
         {{ label }}
         </option>
      </select>
      <input type="text" :value="system.category" name="system.category" />

      <div>{{ system.rank }}</div>
      <i v-if="system.career.length" class="fa-solid fa-check" />

      <prose-mirror :value="system.description" name="system.description" />
      <input  type="text" :value="system.source" name="system.source" />
   </section>
</template>

<style>
   .skill-header {
      margin-bottom: 1em;
   }

   .skill-content {
      display: flex;
      flex-direction: column;
      gap: 1em;
   }
</style>
