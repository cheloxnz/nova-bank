<script setup>
import Icon from './Icon.vue'
const tabs = [
  { to: '/', icon: 'home', label: 'Inicio' },
  { to: '/activity', icon: 'activity', label: 'Actividad' },
  null,
  { to: '/card', icon: 'card', label: 'Tarjeta' },
  { to: '/profile', icon: 'user', label: 'Perfil' },
]
</script>

<template>
  <nav class="tabs" aria-label="Navegación">
    <template v-for="(t, i) in tabs" :key="i">
      <RouterLink v-if="t" :to="t.to" class="tab" :exact-active-class="'on'">
        <Icon :name="t.icon" :size="23" />
        <span>{{ t.label }}</span>
      </RouterLink>
      <RouterLink v-else to="/transfer" class="fab" aria-label="Transferir"><Icon name="send" :size="24" :stroke="2.2" /></RouterLink>
    </template>
  </nav>
</template>

<style scoped>
.tabs { position: absolute; left: 0; right: 0; bottom: 0; z-index: 20; display: grid; grid-template-columns: repeat(5, 1fr); align-items: center; padding: 8px 10px calc(10px + env(safe-area-inset-bottom)); background: rgba(255,255,255,.88); backdrop-filter: blur(18px) saturate(1.6); -webkit-backdrop-filter: blur(18px) saturate(1.6); border-top: 1px solid var(--line); }
.tab { display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 11px; font-weight: 550; color: var(--ink-3); padding: 4px 0; transition: color .2s; }
.tab.on { color: var(--ink); }
.fab { justify-self: center; width: 54px; height: 54px; border-radius: 18px; background: var(--ink); color: #fff; display: grid; place-items: center; box-shadow: 0 10px 24px -8px rgba(14,17,22,.5); transform: translateY(-6px); transition: transform .2s; }
.fab:active { transform: translateY(-6px) scale(.94); }
</style>
