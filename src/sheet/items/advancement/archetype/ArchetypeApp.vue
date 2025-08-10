<script lang="ts" setup>
import { inject, computed } from "vue";
import { ContextSymbol } from "@/sheet/VueApplicationMixin";
import { type ArchetypeContext } from "@/sheet/items/advancement/archetype/ArchetypeSheet";

const context = inject<ArchetypeContext>(ContextSymbol)!;
const system = computed(() => context.document.system);
</script>

<template>
   <header class="archetype-header">
      <img :src="context.document.img" data-edit="img" data-action="editImage"
         :title="context.document.name" :alt="context.document.name" />
      <input type="text" :value="context.document.name" name="name" />
   </header>

   <section class="archetype-content">
      <div class="archetype-characteristics">
         <input v-for="(rank, characteristic) in system.characteristics" :key="characteristic"
            type="number" :value="rank" :name="`system.characteristics.${characteristic}`" />
      </div>

      <input type="number" :value="system.wounds" name="system.wounds" />
      <input type="number" :value="system.strain" name="system.strain" />
      <input type="number" :value="system.xp" name="system.xp" />

      <prose-mirror :value="system.description" name="system.description" />
      <input  type="text" :value="system.source" name="system.source" />
   </section>

</template>

<style>
   .archetype-header {
      margin-bottom: 1em;
   }

   .archetype-content {
      display: flex;
      flex-direction: column;
      gap: 1em;

      .archetype-characteristics {
         display: flex;
      }
   }
</style>
