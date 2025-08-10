<script lang="ts" setup>
import { inject, computed } from "vue";
import { ContextSymbol } from "@/sheet/VueApplicationMixin";
import { type CareerContext } from "@/sheet/items/advancement/career/CareerSheet";

const context = inject<CareerContext>(ContextSymbol)!;
const system = computed(() => context.document.system);
</script>

<template>
   <header class="career-header">
      <img :src="context.document.img" data-edit="img" data-action="editImage"
         :title="context.document.name" :alt="context.document.name" />
      <input type="text" :value="context.document.name" name="name" />
   </header>

   <section class="career-content">
      <div>
         <div v-for="(details, name) in system.skills" :key="name" class="skill-preview">
            <img :src="details.img" :title="name" :alt="name" />
            {{ name }}
         </div>
      </div>
      <prose-mirror :value="system.description" name="system.description" />
      <input  type="text" :value="system.source" name="system.source" />
   </section>

</template>

<style>
   .career-header {
      margin-bottom: 1em;
   }

   .career-content {
      display: flex;
      flex-direction: column;
      gap: 1em;

      .skill-preview {
         display: flex;

         img {
            width: 50px;
         }
      }
   }
</style>
