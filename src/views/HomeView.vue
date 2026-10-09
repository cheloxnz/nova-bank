<script setup>
import { computed } from 'vue'
import Icon from '../components/Icon.vue'
import Avatar from '../components/Avatar.vue'
import TxItem from '../components/TxItem.vue'
import BankCard from '../components/BankCard.vue'
import { money } from '../data/seed.js'
import { useBank } from '../stores/bank.js'

const bank = useBank()
const recent = computed(() => bank.txs.slice(0, 6))
const parts = computed(() => {
  const [int, dec] = money(bank.balance, bank.currency).split(',')
  return { int, dec }
})
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches' })
const favs = computed(() => bank.favorites.map((id) => bank.contacts.find((c) => c.id === id)))
const actions = [
  { icon: 'send', label: 'Transferir', to: '/transfer' },
  { icon: 'arrowDown', label: 'Recibir', sheet: 'receive' },
  { icon: 'qr', label: 'Pagar QR', toast: 'Escáner QR disponible en la app nativa' },
  { icon: 'receipt', label: 'Servicios', toast: 'Pago de servicios: próximamente' },
]
const act = (a) => { if (a.sheet) bank.sheet = { type: a.sheet }; else if (a.toast) bank.notify(a.toast) }
</script>

<template>
  <div class="home">
    <header class="hd">
      <Avatar :name="`${bank.user.name} ${bank.user.last}`" :hue="250" :size="42" />
      <div class="hello"><small class="muted">{{ greeting }}</small><b>{{ bank.user.name }}</b></div>
      <button class="icon-btn" aria-label="Notificaciones" @click="bank.notify('No tenés notificaciones nuevas')"><Icon name="bell" :size="21" /><i class="dot" /></button>
    </header>

    <section class="balance">
      <div class="seg" role="tablist">
        <button v-for="c in ['ARS', 'USD']" :key="c" :class="{ on: bank.currency === c }" @click="bank.currency = c" role="tab">{{ c === 'ARS' ? 'Pesos' : 'Dólares' }}</button>
      </div>
      <p class="label">Saldo disponible
        <button class="eye" @click="bank.hidden = !bank.hidden" :aria-label="bank.hidden ? 'Mostrar saldo' : 'Ocultar saldo'"><Icon :name="bank.hidden ? 'eyeOff' : 'eye'" :size="18" /></button>
      </p>
      <p class="amount num" aria-live="polite">
        <template v-if="bank.hidden">$ ••••••</template>
        <template v-else>{{ parts.int }}<span>,{{ parts.dec }}</span></template>
      </p>
      <p v-if="bank.currency === 'ARS'" class="delta"><span class="ok">↑ 2,4%</span> rendimiento estimado del mes</p>
      <p v-else class="delta muted">Cuenta en dólares · sin costo de mantenimiento</p>
    </section>

    <nav class="actions">
      <component :is="a.to ? 'RouterLink' : 'button'" v-for="a in actions" :key="a.label" :to="a.to" class="action" @click="!a.to && act(a)">
        <span class="a-ic"><Icon :name="a.icon" :size="22" /></span>{{ a.label }}
      </component>
    </nav>

    <RouterLink to="/card" class="card-peek" aria-label="Ver tarjeta">
      <BankCard compact />
    </RouterLink>

    <div class="sec-title"><h2>Enviar de nuevo</h2><RouterLink to="/transfer">Ver todos</RouterLink></div>
    <div class="favs">
      <RouterLink v-for="c in favs" :key="c.id" :to="{ path: '/transfer', query: { to: c.id } }" class="fav">
        <Avatar :name="c.name" :hue="c.hue" :size="52" /><span>{{ c.name.split(' ')[0] }}</span>
      </RouterLink>
      <RouterLink to="/transfer" class="fav"><span class="add"><Icon name="plus" :size="22" /></span><span>Nuevo</span></RouterLink>
    </div>

    <div class="sec-title"><h2>Últimos movimientos</h2><RouterLink to="/activity">Ver todo</RouterLink></div>
    <div class="list card">
      <TxItem v-for="t in recent" :key="t.id" :tx="t" show-date />
    </div>
  </div>
</template>

<style scoped>
.home { padding: 8px 20px 0; }
.hd { display: flex; align-items: center; gap: 12px; padding: 6px 0 4px; }
.hello { display: flex; flex-direction: column; flex: 1; line-height: 1.25; }
.hello small { font-size: 13px; }
.hello b { font-size: 17px; letter-spacing: -.02em; }
.icon-btn { position: relative; width: 44px; height: 44px; border-radius: 14px; background: var(--surface); display: grid; place-items: center; }
.icon-btn .dot { position: absolute; top: 11px; right: 12px; width: 8px; height: 8px; border-radius: 50%; background: var(--danger); border: 2px solid #fff; }

.balance { margin-top: 18px; text-align: center; }
.seg { display: inline-flex; padding: 4px; background: var(--surface-2); border-radius: 12px; margin-bottom: 18px; }
.seg button { padding: 7px 16px; border-radius: 9px; font-size: 13.5px; font-weight: 600; color: var(--ink-3); transition: background .2s, color .2s, box-shadow .2s; }
.seg button.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(14,17,22,.1); }
.label { display: flex; justify-content: center; align-items: center; gap: 6px; margin: 0; color: var(--ink-3); font-size: 14px; }
.eye { color: var(--ink-3); padding: 4px; }
.amount { margin: 4px 0 6px; font-size: 44px; font-weight: 700; letter-spacing: -.05em; line-height: 1.1; }
.amount span { font-size: 24px; color: var(--ink-3); font-weight: 600; }
.delta { margin: 0; font-size: 13px; color: var(--ink-3); }
.delta .ok { font-weight: 650; }

.actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 26px 0 22px; }
.action { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 550; color: var(--ink-2); }
.a-ic { width: 58px; height: 58px; border-radius: 20px; background: var(--surface); display: grid; place-items: center; color: var(--ink); box-shadow: 0 1px 2px rgba(14,17,22,.04); transition: transform .15s, background .2s; }
.action:first-child .a-ic { background: var(--ink); color: #fff; }
.action:active .a-ic { transform: scale(.94); }

.card-peek { display: block; }

.favs { display: flex; gap: 14px; overflow-x: auto; scrollbar-width: none; margin: 0 -20px; padding: 0 20px 4px; }
.fav { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 500; color: var(--ink-2); flex: none; width: 60px; }
.add { width: 52px; height: 52px; border-radius: 50%; border: 1.5px dashed var(--ink-3); display: grid; place-items: center; color: var(--ink-2); }
.list { padding: 6px 10px; }
</style>
