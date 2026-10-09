<script setup>
import { useBank } from '../stores/bank.js'
import Icon from './Icon.vue'
const props = defineProps({ compact: Boolean, reveal: Boolean })
const bank = useBank()
// Número ficticio de demo (no válido)
const groups = ['4000', '1234', '5678', '4821']
</script>

<template>
  <div class="bc" :class="{ compact, frozen: bank.card.frozen }">
    <div class="shine" />
    <div class="row">
      <span class="brand"><b>nova</b> bank</span>
      <span class="type">{{ compact ? 'Virtual · Débito' : 'Débito' }}</span>
    </div>
    <div v-if="!compact" class="chip-row">
      <span class="chip" />
      <svg class="nfc" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 7a7 7 0 0 1 0 10M12 4.5a11 11 0 0 1 0 15M4.5 9.5a3.5 3.5 0 0 1 0 5" /></svg>
    </div>
    <div class="num">
      <template v-if="reveal"><span v-for="g in groups" :key="g">{{ g }}</span></template>
      <template v-else><span>••••</span><span v-if="!compact">••••</span><span v-if="!compact">••••</span><span>{{ groups[3] }}</span></template>
    </div>
    <div class="row bottom">
      <div v-if="!compact"><small>Titular</small><b>{{ bank.user.name.toUpperCase() }} {{ bank.user.last.toUpperCase() }}</b></div>
      <div v-if="!compact"><small>Vence</small><b>{{ reveal ? '09/30' : '••/••' }}</b></div>
      <div v-if="compact" class="cmp-l"><b>Tarjeta virtual</b><small>{{ bank.card.frozen ? 'Congelada' : 'Activa · lista para usar' }}</small></div>
      <span class="net" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 17V7l10 10V7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
    </div>
    <div v-if="bank.card.frozen" class="ice"><Icon name="snow" :size="compact ? 22 : 30" /><span v-if="!compact">Tarjeta congelada</span></div>
  </div>
</template>

<style scoped>
.bc { position: relative; overflow: hidden; aspect-ratio: 1.586; border-radius: 22px; padding: 20px 22px; color: #fff; display: flex; flex-direction: column; justify-content: space-between;
  background: radial-gradient(120% 120% at 100% 0%, #8b5cf6 0%, transparent 55%), radial-gradient(90% 90% at 0% 100%, #2a78d6 0%, transparent 60%), linear-gradient(135deg, #1e1b4b, #4f46e5);
  box-shadow: 0 24px 40px -22px rgba(79,70,229,.8); transition: filter .4s; }
.bc.compact { aspect-ratio: auto; height: 118px; padding: 16px 18px; border-radius: 20px; }
.shine { position: absolute; inset: 0; background: repeating-linear-gradient(115deg, rgba(255,255,255,.06) 0 2px, transparent 2px 14px); mask-image: linear-gradient(90deg, transparent, #000 60%); -webkit-mask-image: linear-gradient(90deg, transparent, #000 60%); pointer-events: none; }
.row { position: relative; display: flex; justify-content: space-between; align-items: center; }
.brand { font-size: 18px; letter-spacing: -.03em; font-weight: 400; opacity: .95; }
.brand b { font-weight: 750; }
.type { font-size: 12px; font-weight: 550; opacity: .75; }
.chip-row { position: relative; display: flex; align-items: center; gap: 12px; }
.chip { width: 42px; height: 32px; border-radius: 7px; background: linear-gradient(135deg, #f6e7b0, #c9a64a); box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
.nfc { opacity: .8; }
.num { position: relative; display: flex; gap: 14px; font-size: 19px; font-weight: 550; letter-spacing: .06em; font-variant-numeric: tabular-nums; }
.compact .num { display: none; }
.bottom { align-items: flex-end; }
.bottom div { display: flex; flex-direction: column; }
.bottom small { font-size: 10px; opacity: .65; text-transform: uppercase; letter-spacing: .08em; }
.bottom b { font-size: 13px; font-weight: 600; letter-spacing: .04em; }
.cmp-l b { font-size: 15px; letter-spacing: -.01em; }
.cmp-l small { font-size: 12.5px; text-transform: none; letter-spacing: 0; opacity: .8; }
.net { width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.25); backdrop-filter: blur(4px); }
.frozen { filter: saturate(.35); }
.ice { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: rgba(220,232,255,.35); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); font-weight: 650; font-size: 15px; }
</style>
