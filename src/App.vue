<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'
import GlobalSheets from './components/GlobalSheets.vue'
import Icon from './components/Icon.vue'
import { useBank } from './stores/bank.js'

const bank = useBank()
const route = useRoute()
watch(() => [bank.hidden, bank.currency, bank.balances, bank.txs, bank.card, bank.favorites], () => bank.persist(), { deep: true })
watch(() => route.fullPath, () => (bank.sheet = null))

const clock = ref('')
let t
const tick = () => (clock.value = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }))
onMounted(() => { tick(); t = setInterval(tick, 20000) })
onBeforeUnmount(() => clearInterval(t))

const base = import.meta.env.BASE_URL
const bare = computed(() => route.meta.bare)
const features = ['Saldo y movimientos', 'Transferencias en 3 pasos', 'Tarjeta virtual: congelar y límites', 'Estadísticas de gastos', 'PWA instalable']
</script>

<template>
  <div class="stage">
    <aside class="intro">
      <div class="brand"><img :src="`${base}icons/icon.svg`" alt="" width="44" height="44" /><b>Nova Bank</b></div>
      <h1>Tu plata,<br /><span>simple y a mano.</span></h1>
      <p>Template de app fintech mobile hecho con Vue 3. Probalo acá o instalalo en tu celular como app.</p>
      <ul><li v-for="f in features" :key="f"><Icon name="check" :size="16" :stroke="2.4" />{{ f }}</li></ul>
      <div class="links">
        <a href="https://github.com/cheloxnz/nova-bank" target="_blank" rel="noopener"><Icon name="github" :size="18" />Código</a>
        <a href="https://cheloxnz.github.io/" target="_blank" rel="noopener">Hecho por <b>Marcelo Del Valle</b></a>
      </div>
      <small class="muted">Demo: datos ficticios, sin operaciones reales.</small>
    </aside>

    <div class="phone">
      <div class="device">
        <div class="status" aria-hidden="true">
          <span class="num">{{ clock }}</span><i class="island" />
          <span class="sig"><svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="6" rx="1" /><rect x="10" y="2.5" width="3" height="8.5" rx="1" /><rect x="15" y="0" width="3" height="11" rx="1" /></svg><svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="16" height="8" rx="2" /><rect x="24" y="4" width="1.5" height="4" rx=".75" opacity=".4" /></svg></span>
        </div>
        <div class="screen" :class="{ bare }">
          <div class="scroll" id="scroll">
            <RouterView v-slot="{ Component }">
              <Transition name="fade" mode="out-in"><component :is="Component" /></Transition>
            </RouterView>
          </div>
          <TabBar v-if="!bare" />
          <div id="overlay" />
          <GlobalSheets />
          <Transition name="toast"><div v-if="bank.toast" :key="bank.toast.key" class="toast"><Icon name="check" :size="16" :stroke="2.4" />{{ bank.toast.text }}</div></Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.stage { min-height: 100dvh; display: grid; grid-template-columns: minmax(0, 460px) auto; justify-content: center; align-items: center; gap: clamp(40px, 8vw, 120px); padding: 40px 24px; background:
  radial-gradient(60% 50% at 80% 20%, rgba(109,94,252,.14), transparent 60%),
  radial-gradient(50% 50% at 10% 90%, rgba(42,120,214,.10), transparent 60%), var(--bg); }
.intro .brand { display: flex; align-items: center; gap: 12px; font-size: 20px; letter-spacing: -.03em; }
.intro .brand img { border-radius: 12px; box-shadow: 0 10px 24px -10px rgba(79,70,229,.6); }
.intro h1 { font-size: clamp(40px, 4.4vw, 60px); line-height: 1.02; letter-spacing: -.05em; margin: 32px 0 18px; font-weight: 750; }
.intro h1 span { background: linear-gradient(90deg, #4f46e5, #8b5cf6); -webkit-background-clip: text; background-clip: text; color: transparent; }
.intro p { color: var(--ink-2); font-size: 17px; margin: 0 0 24px; max-width: 40ch; }
.intro ul { list-style: none; padding: 0; margin: 0 0 28px; display: grid; gap: 10px; }
.intro li { display: flex; align-items: center; gap: 10px; font-weight: 500; }
.intro li svg { color: #fff; background: var(--brand); border-radius: 50%; padding: 3px; width: 20px; height: 20px; }
.intro .links { display: flex; gap: 20px; align-items: center; margin-bottom: 18px; font-size: 14px; }
.intro .links a:first-child { display: inline-flex; gap: 8px; align-items: center; height: 44px; padding: 0 16px; border-radius: 12px; background: var(--ink); color: #fff; font-weight: 600; }
.intro .links a:last-child:hover b { color: var(--brand); }

.device { position: relative; width: 390px; height: 844px; border-radius: 56px; background: var(--bg); overflow: hidden; box-shadow: 0 0 0 11px #0e1116, 0 0 0 13px #2b2f38, 0 50px 100px -30px rgba(14,17,22,.45), 0 30px 60px -40px rgba(79,70,229,.5); }
.status { position: absolute; top: 0; left: 0; right: 0; height: 50px; z-index: 30; display: flex; align-items: center; justify-content: space-between; padding: 6px 30px 0 36px; font-weight: 600; font-size: 15px; pointer-events: none; }
.status .island { position: absolute; left: 50%; top: 11px; width: 120px; height: 34px; border-radius: 20px; background: #0e1116; transform: translateX(-50%); }
.status .sig { display: flex; gap: 6px; align-items: center; fill: currentColor; }
.screen { position: absolute; inset: 0; padding-top: 50px; }
.scroll { position: absolute; inset: 50px 0 0; overflow-y: auto; overflow-x: hidden; padding-bottom: 110px; scrollbar-width: none; }
.screen.bare .scroll { padding-bottom: 0; }
.scroll::-webkit-scrollbar { display: none; }
#overlay { position: absolute; inset: 0; pointer-events: none; z-index: 40; }
#overlay > * { pointer-events: auto; }
.toast { position: absolute; z-index: 60; left: 50%; top: 62px; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; background: var(--ink); color: #fff; font-size: 14px; font-weight: 550; white-space: nowrap; box-shadow: 0 12px 30px -10px rgba(14,17,22,.5); }
.toast svg { color: #4ade80; }
.toast-enter-active, .toast-leave-active { transition: opacity .25s, transform .35s var(--ease); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -12px); }

/* Mobile real: app a pantalla completa */
@media (max-width: 760px) {
  .stage { display: block; padding: 0; background: var(--bg); }
  .intro { display: none; }
  .device { width: 100%; height: 100dvh; border-radius: 0; box-shadow: none; }
  .status { display: none; }
  .screen { padding-top: env(safe-area-inset-top); }
  .scroll { inset: env(safe-area-inset-top) 0 0; }
  .toast { top: calc(14px + env(safe-area-inset-top)); }
}
@media (min-width: 761px) and (max-height: 900px) { .device { transform: scale(.88); transform-origin: center; } .stage { padding: 0 24px; } }
</style>
