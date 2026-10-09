<script setup>
import { ref, computed } from 'vue'
import BankCard from '../components/BankCard.vue'
import Icon from '../components/Icon.vue'
import { money } from '../data/seed.js'
import { useBank } from '../stores/bank.js'

const bank = useBank()
const reveal = ref(false)
const spentMonth = computed(() => bank.monthStats.spent)
const usedPct = computed(() => Math.min(100, (spentMonth.value / bank.card.limit) * 100))

const toggleFreeze = () => {
  bank.card.frozen = !bank.card.frozen
  bank.notify(bank.card.frozen ? 'Tarjeta congelada' : 'Tarjeta activada')
}
const toggleReveal = () => { reveal.value = !reveal.value; if (reveal.value) setTimeout(() => (reveal.value = false), 8000) }
const copyNumber = async () => { try { await navigator.clipboard.writeText('4000123456784821') } catch {} bank.notify('Número copiado') }
const settings = [
  { key: 'online', icon: 'globe', t: 'Compras online', d: 'Pagos en tiendas web y apps' },
  { key: 'international', icon: 'globe', t: 'Compras en el exterior', d: 'Se cobra en dólares' },
  { key: 'contactless', icon: 'wifi', t: 'Pago sin contacto', d: 'Acercá el celular o la tarjeta' },
]
</script>

<template>
  <div class="cardv">
    <h1 class="h-title">Tarjeta</h1>
    <div class="wrap"><BankCard :reveal="reveal" /></div>

    <div class="ctrls">
      <button class="ctrl" :class="{ on: bank.card.frozen }" @click="toggleFreeze"><span><Icon name="snow" :size="22" /></span>{{ bank.card.frozen ? 'Descongelar' : 'Congelar' }}</button>
      <button class="ctrl" @click="toggleReveal" :disabled="bank.card.frozen"><span><Icon :name="reveal ? 'eyeOff' : 'eye'" :size="22" /></span>{{ reveal ? 'Ocultar' : 'Ver datos' }}</button>
      <button class="ctrl" @click="copyNumber" :disabled="bank.card.frozen"><span><Icon name="copy" :size="22" /></span>Copiar</button>
    </div>

    <section class="card box">
      <div class="lim-head">
        <div><small class="muted">Consumos del mes</small><b class="num">{{ money(spentMonth, 'ARS', true) }}</b></div>
        <div class="r"><small class="muted">Límite mensual</small><b class="num">{{ money(bank.card.limit, 'ARS', true) }}</b></div>
      </div>
      <div class="bar" role="progressbar" :aria-valuenow="Math.round(usedPct)" aria-valuemin="0" aria-valuemax="100"><i :style="{ width: usedPct + '%' }" :class="{ warn: usedPct > 85 }" /></div>
      <label class="slider">
        <span class="muted">Ajustar límite</span>
        <input type="range" min="200000" max="2000000" step="50000" v-model.number="bank.card.limit" />
      </label>
    </section>

    <div class="sec-title"><h2>Configuración</h2></div>
    <section class="card box list">
      <label v-for="s in settings" :key="s.key" class="set">
        <span class="s-ic"><Icon :name="s.icon" :size="20" /></span>
        <span class="s-t"><b>{{ s.t }}</b><small class="muted">{{ s.d }}</small></span>
        <input type="checkbox" class="sw" v-model="bank.card[s.key]" :disabled="bank.card.frozen" />
      </label>
      <button class="set" @click="bank.notify('Te enviamos un PIN temporal por SMS (demo)')">
        <span class="s-ic"><Icon name="lock" :size="20" /></span>
        <span class="s-t"><b>Cambiar PIN</b><small class="muted">PIN para cajeros y POS</small></span>
        <Icon name="chevronR" :size="18" class="muted" />
      </button>
    </section>
    <p class="note muted"><Icon name="shield" :size="14" />Número de tarjeta ficticio, solo para la demo.</p>
  </div>
</template>

<style scoped>
.cardv { padding: 14px 20px 0; }
.wrap { margin: 18px 0 18px; }
.ctrls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ctrl { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 6px; border-radius: 18px; background: var(--surface); font-size: 13px; font-weight: 600; transition: background .2s, color .2s; }
.ctrl span { width: 42px; height: 42px; border-radius: 14px; background: var(--surface-2); display: grid; place-items: center; }
.ctrl.on { background: #e5eeff; color: #2a5bd7; }
.ctrl.on span { background: #fff; }
.ctrl:disabled { opacity: .45; }
.box { padding: 18px; margin-top: 14px; }
.lim-head { display: flex; justify-content: space-between; }
.lim-head div { display: flex; flex-direction: column; }
.lim-head .r { text-align: right; }
.lim-head small { font-size: 12.5px; }
.lim-head b { font-size: 18px; letter-spacing: -.02em; }
.bar { height: 8px; border-radius: 4px; background: var(--surface-2); margin: 14px 0 16px; overflow: hidden; }
.bar i { display: block; height: 100%; border-radius: 4px; background: var(--brand); transition: width .5s var(--ease); }
.bar i.warn { background: var(--c2); }
.slider { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
input[type=range] { width: 100%; accent-color: var(--brand); }
.list { padding: 6px 16px; margin-top: 0; }
.set { display: flex; align-items: center; gap: 12px; padding: 12px 0; width: 100%; text-align: left; cursor: pointer; }
.set + .set { border-top: 1px solid var(--line); }
.s-ic { width: 40px; height: 40px; border-radius: 12px; background: var(--surface-2); display: grid; place-items: center; flex: none; }
.s-t { flex: 1; display: flex; flex-direction: column; }
.s-t b { font-weight: 600; font-size: 14.5px; }
.s-t small { font-size: 12.5px; }
.sw { appearance: none; width: 46px; height: 28px; border-radius: 14px; background: var(--line); position: relative; cursor: pointer; transition: background .2s; flex: none; margin: 0; }
.sw::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .25s var(--ease); }
.sw:checked { background: var(--ok); }
.sw:checked::after { transform: translateX(18px); }
.sw:disabled { opacity: .5; }
.note { display: flex; align-items: center; gap: 6px; justify-content: center; font-size: 12px; margin: 16px 0 0; }
</style>
