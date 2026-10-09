<script setup>
import { computed } from 'vue'
import Sheet from './Sheet.vue'
import Icon from './Icon.vue'
import Avatar from './Avatar.vue'
import { categories, contacts, money } from '../data/seed.js'
import { useBank } from '../stores/bank.js'

const bank = useBank()
const s = computed(() => bank.sheet)
const tx = computed(() => s.value?.type === 'tx' ? s.value.tx : null)
const contact = computed(() => tx.value && contacts.find((c) => c.id === tx.value.contactId))
const cat = computed(() => tx.value && categories[tx.value.category])
const when = computed(() => tx.value && new Date(tx.value.date).toLocaleString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false }))
const close = () => (bank.sheet = null)
const copy = async (text, label) => { try { await navigator.clipboard.writeText(text) } catch {} bank.notify(`${label} copiado`) }
</script>

<template>
  <Sheet :open="!!tx" @close="close">
    <div v-if="tx" class="det">
      <Avatar v-if="contact" :name="contact.name" :hue="contact.hue" :size="64" />
      <span v-else class="big-ic" :style="{ color: cat.color }"><Icon :name="cat.icon" :size="28" /></span>
      <p class="t">{{ tx.title }}</p>
      <p class="amt num" :class="{ in: tx.type === 'in' }">{{ tx.type === 'in' ? '+' : '−' }} {{ money(tx.amount) }}</p>
      <span class="pill"><Icon name="check" :size="14" :stroke="2.4" />Aprobado</span>
      <dl>
        <div><dt>Fecha</dt><dd>{{ when }}</dd></div>
        <div><dt>Categoría</dt><dd><i :style="{ background: cat.color }" />{{ cat.label }}</dd></div>
        <div><dt>Detalle</dt><dd>{{ tx.subtitle }}</dd></div>
        <div v-if="contact"><dt>Alias</dt><dd>{{ contact.alias }} · {{ contact.bank }}</dd></div>
        <div><dt>N.º de operación</dt><dd class="num">{{ tx.ref || String(tx.id).padStart(8, '0') }}</dd></div>
      </dl>
      <div class="acts">
        <button class="btn btn-soft" @click="bank.notify('Comprobante listo para compartir')"><Icon name="share" :size="18" />Compartir</button>
        <button class="btn btn-soft" @click="close">Listo</button>
      </div>
    </div>
  </Sheet>

  <Sheet :open="s?.type === 'receive'" title="Recibir dinero" @close="close">
    <p class="muted lead">Compartí tus datos para que te transfieran desde cualquier banco o billetera.</p>
    <div class="row-box">
      <div><small>Alias</small><b>{{ bank.user.alias }}</b></div>
      <button @click="copy(bank.user.alias, 'Alias')" aria-label="Copiar alias"><Icon name="copy" :size="18" /></button>
    </div>
    <div class="row-box">
      <div><small>CVU</small><b class="num">{{ bank.user.cvu }}</b></div>
      <button @click="copy(bank.user.cvu, 'CVU')" aria-label="Copiar CVU"><Icon name="copy" :size="18" /></button>
    </div>
    <div class="row-box"><div><small>Titular</small><b>{{ bank.user.name }} {{ bank.user.last }}</b></div></div>
    <button class="btn btn-primary btn-block" style="margin-top:14px" @click="copy(`Alias: ${bank.user.alias}\nCVU: ${bank.user.cvu}`, 'Datos')"><Icon name="share" :size="18" />Compartir datos</button>
  </Sheet>
</template>

<style scoped>
.det { display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 6px; }
.big-ic { width: 64px; height: 64px; border-radius: 50%; background: var(--surface-2); display: grid; place-items: center; }
.t { margin: 12px 0 2px; font-weight: 600; font-size: 16px; }
.amt { margin: 0; font-size: 34px; font-weight: 700; letter-spacing: -.04em; }
.amt.in { color: var(--ok); }
.pill { display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; padding: 4px 10px; border-radius: 999px; background: var(--ok-50); color: var(--ok); font-size: 12.5px; font-weight: 600; }
dl { width: 100%; margin: 22px 0 18px; text-align: left; background: var(--surface-2); border-radius: 16px; padding: 4px 16px; }
dl div { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
dl div:last-child { border: 0; }
dt { color: var(--ink-3); flex: none; }
dd { margin: 0; font-weight: 550; text-align: right; display: flex; align-items: center; gap: 6px; }
dd::first-letter { text-transform: uppercase; }
dd i { width: 8px; height: 8px; border-radius: 50%; }
.acts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }
.lead { margin: -4px 0 16px; font-size: 14px; }
.row-box { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; border-radius: 16px; background: var(--surface-2); margin-bottom: 8px; }
.row-box div { display: flex; flex-direction: column; min-width: 0; }
.row-box small { font-size: 12px; color: var(--ink-3); }
.row-box b { font-weight: 600; word-break: break-all; }
.row-box button { width: 40px; height: 40px; border-radius: 12px; background: #fff; display: grid; place-items: center; flex: none; }
</style>
