<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{ expiresAt: number }>();
const visible = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  const remaining = props.expiresAt - Date.now();
  if (remaining <= 0) return;

  visible.value = true;
  timer = setTimeout(() => {
    visible.value = false;
  }, remaining);
});

onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <slot v-if="visible" />
</template>
