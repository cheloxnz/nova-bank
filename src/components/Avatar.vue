<script setup>
import { initials } from '../data/seed.js'
defineProps({ name: String, hue: { type: Number, default: 240 }, size: { type: Number, default: 44 } })
</script>

<template>
  <span class="av" :style="{ width: size + 'px', height: size + 'px', fontSize: size * 0.36 + 'px', background: `hsl(${hue} 70% 93%)`, color: `hsl(${hue} 55% 32%)` }">{{ initials(name) }}</span>
</template>

<style scoped>
.av { display: inline-grid; place-items: center; border-radius: 50%; font-weight: 650; flex: none; letter-spacing: -.02em; }
</style>
