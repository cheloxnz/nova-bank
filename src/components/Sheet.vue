<script setup>
defineProps({ open: Boolean, title: String })
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="#overlay" defer>
    <Transition name="sheet">
      <div v-if="open" class="scrim" @click.self="emit('close')">
        <section class="sheet" role="dialog" :aria-label="title">
          <span class="grab" />
          <header v-if="title"><h3>{{ title }}</h3><button class="x" @click="emit('close')" aria-label="Cerrar">✕</button></header>
          <slot />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scrim { position: absolute; inset: 0; z-index: 40; background: rgba(14, 17, 22, .38); display: flex; align-items: flex-end; }
.sheet { width: 100%; max-height: 92%; overflow-y: auto; background: var(--surface); border-radius: 28px 28px 0 0; padding: 10px 22px calc(26px + env(safe-area-inset-bottom)); }
.grab { display: block; width: 40px; height: 5px; border-radius: 3px; background: var(--line); margin: 0 auto 14px; }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
h3 { margin: 0; font-size: 19px; letter-spacing: -.02em; }
.x { width: 34px; height: 34px; border-radius: 50%; background: var(--surface-2); font-size: 13px; color: var(--ink-2); }
.sheet-enter-active, .sheet-leave-active { transition: opacity .3s; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .4s var(--ease); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
