<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import Avatar from '../components/Avatar.vue'
import { money } from '../data/seed.js'
import { useBank } from '../stores/bank.js'

const bank = useBank()
const router = useRouter()
const route = useRoute()

const step = ref('to') // to → amount → confirm → done
const q = ref('')
const contact = ref(null)
const raw = ref('') // monto en centavos como string
const note = ref('Varios')
const loading = ref(false)
const result = ref(null)

onMounted(() => {
  const pre = bank.contacts.find((c) => c.id === Number(route.query.to))
  if (pre) { contact.value = pre; step.value = 'amount' }
})

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const results = computed(() => bank.contacts.filter((c) => !q.value || norm(c.name + ' ' + c.alias).includes(norm(q.value))))
const isNewAlias = computed(() => /^[a-z0-9.\-]{6,20}$/i.test(q.value.trim()) && q.value.includes('.') && !results.value.length)
const isCvu = computed(() => /^\d{22}$/.test(q.value.trim()))
const favs = computed(() => bank.favorites.map((id) => bank.contacts.find((c) => c.id === id)))

const pick = (c) => { contact.value = c; step.value = 'amount' }
const pickNew = () => pick({ id: 999, name: isCvu.value ? 'Cuenta CVU' : q.value.trim(), alias: q.value.trim(), bank: 'Otra entidad', hue: 200 })

const amount = computed(() => Number(raw.value || 0) / 100)
const display = computed(() => {
  const [int, dec] = money(amount.value).split(',')
  return { int, dec }
})
const over = computed(() => amount.value > bank.balances.ARS)
const press = (k) => {
  if (k === 'del') return (raw.value = raw.value.slice(0, -1))
  if (raw.value.length >= 11) return
  if (k === '00') { if (raw.value) raw.value += '00'; return }
  if (!raw.value && k === '0') return
  raw.value += k
}
const quick = (n) => (raw.value = String(n * 100))
const notes = ['Varios', 'Alquiler', 'Expensas', 'Regalo', 'Cuota']

const confirm = () => {
  loading.value = true
  setTimeout(() => {
    try {
      result.value = bank.transfer({ contact: contact.value, amount: amount.value, note: note.value })
      step.value = 'done'
    } catch (e) { bank.notify(e.message) }
    loading.value = false
  }, 1100)
}
const back = () => {
  if (step.value === 'amount') { step.value = 'to'; raw.value = '' }
  else if (step.value === 'confirm') step.value = 'amount'
  else router.push('/')
}
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del']
</script>

<template>
  <div class="tr" :class="step">
    <header v-if="step !== 'done'" class="top">
      <button class="nav" @click="back" :aria-label="step === 'to' ? 'Cerrar' : 'Volver'"><Icon :name="step === 'to' ? 'close' : 'back'" :size="22" /></button>
      <b>{{ step === 'to' ? 'Transferir' : step === 'amount' ? '¿Cuánto querés enviar?' : 'Revisá la transferencia' }}</b>
      <span class="stepn muted">{{ step === 'to' ? 1 : step === 'amount' ? 2 : 3 }}/3</span>
    </header>

    <!-- Paso 1: destinatario -->
    <section v-if="step === 'to'" class="pad-x">
      <label class="search"><Icon name="search" :size="18" /><input v-model="q" placeholder="Nombre, alias o CVU" autocomplete="off" /></label>
      <button v-if="isNewAlias || isCvu" class="new" @click="pickNew">
        <span class="n-ic"><Icon name="plus" :size="20" /></span>
        <span><b>Transferir a “{{ q.trim() }}”</b><small class="muted">{{ isCvu ? 'CVU / CBU' : 'Alias' }} · nuevo destinatario</small></span>
        <Icon name="chevronR" :size="18" />
      </button>

      <template v-if="!q">
        <h3 class="lbl">Favoritos</h3>
        <div class="favs">
          <button v-for="c in favs" :key="c.id" class="fav" @click="pick(c)"><Avatar :name="c.name" :hue="c.hue" :size="56" /><span>{{ c.name.split(' ')[0] }}</span></button>
        </div>
      </template>

      <h3 class="lbl">{{ q ? 'Resultados' : 'Contactos' }}</h3>
      <div class="card list">
        <button v-for="c in results" :key="c.id" class="ct" @click="pick(c)">
          <Avatar :name="c.name" :hue="c.hue" :size="44" />
          <span class="ct-m"><b>{{ c.name }}</b><small class="muted">{{ c.alias }} · {{ c.bank }}</small></span>
          <Icon name="chevronR" :size="18" class="muted" />
        </button>
        <p v-if="!results.length && !isNewAlias && !isCvu" class="muted empty">Sin resultados. Probá con un alias (ej: <b>juan.perez.ok</b>) o un CVU de 22 dígitos.</p>
      </div>
    </section>

    <!-- Paso 2: monto -->
    <section v-else-if="step === 'amount'" class="amount-step">
      <div class="to-chip"><Avatar :name="contact.name" :hue="contact.hue" :size="32" /><span><b>{{ contact.name }}</b><small class="muted">{{ contact.alias }}</small></span></div>
      <p class="big num" :class="{ zero: !amount, err: over }">{{ display.int }}<span>,{{ display.dec }}</span></p>
      <p class="avail" :class="{ err: over }">{{ over ? 'Saldo insuficiente' : `Disponible: ${money(bank.balances.ARS)}` }}</p>
      <div class="quick"><button v-for="n in [5000, 10000, 50000]" :key="n" @click="quick(n)">{{ money(n, 'ARS', true) }}</button></div>
      <div class="notes"><button v-for="n in notes" :key="n" :class="{ on: note === n }" @click="note = n">{{ n }}</button></div>
      <div class="pad">
        <button v-for="k in keys" :key="k" class="key" @click="press(k)" :aria-label="k === 'del' ? 'Borrar' : k">
          <Icon v-if="k === 'del'" name="delete" :size="24" /><template v-else>{{ k }}</template>
        </button>
      </div>
      <div class="cta"><button class="btn btn-primary btn-block" :disabled="!amount || over" @click="step = 'confirm'">Continuar</button></div>
    </section>

    <!-- Paso 3: confirmación -->
    <section v-else-if="step === 'confirm'" class="pad-x confirm">
      <div class="card sumc">
        <Avatar :name="contact.name" :hue="contact.hue" :size="60" />
        <p class="muted">Vas a transferir</p>
        <p class="big2 num">{{ money(amount) }}</p>
        <p>a <b>{{ contact.name }}</b></p>
        <dl>
          <div><dt>Alias</dt><dd>{{ contact.alias }}</dd></div>
          <div><dt>Entidad</dt><dd>{{ contact.bank }}</dd></div>
          <div><dt>Motivo</dt><dd>{{ note }}</dd></div>
          <div><dt>Desde</dt><dd>Cuenta en pesos</dd></div>
          <div><dt>Costo</dt><dd class="ok">Sin costo</dd></div>
        </dl>
      </div>
      <p class="secure muted"><Icon name="shield" :size="14" />Transferencia inmediata · operación protegida</p>
      <div class="cta">
        <button class="btn btn-brand btn-block" :disabled="loading" @click="confirm">
          <span v-if="loading" class="spin" />{{ loading ? 'Procesando…' : `Transferir ${money(amount)}` }}
        </button>
      </div>
    </section>

    <!-- Paso 4: éxito -->
    <section v-else class="done">
      <div class="burst"><span class="check"><Icon name="check" :size="44" :stroke="2.6" /></span></div>
      <h2>¡Transferencia enviada!</h2>
      <p class="big2 num">{{ money(result.amount) }}</p>
      <p class="muted">a {{ contact.name }} · {{ new Date(result.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) }} h</p>
      <p class="ref muted num">Operación N.º {{ result.ref }}</p>
      <div class="cta stack">
        <button class="btn btn-soft btn-block" @click="bank.sheet = { type: 'tx', tx: result }"><Icon name="receipt" :size="18" />Ver comprobante</button>
        <RouterLink to="/" class="btn btn-primary btn-block">Volver al inicio</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tr { min-height: 100%; display: flex; flex-direction: column; background: var(--bg); }
.top { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; padding: 6px 14px 10px; text-align: center; font-size: 16px; }
.nav { width: 44px; height: 44px; border-radius: 14px; background: var(--surface); display: grid; place-items: center; }
.stepn { font-size: 13px; font-weight: 600; }
.pad-x { padding: 0 20px 24px; }
.search { display: flex; align-items: center; gap: 10px; height: 50px; padding: 0 14px; border-radius: 16px; background: var(--surface); color: var(--ink-3); margin-top: 4px; }
.search input { flex: 1; border: 0; outline: none; background: none; color: var(--ink); min-width: 0; font-size: 15px; }
.new { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px; margin-top: 10px; border-radius: 16px; background: var(--brand-50); text-align: left; color: var(--brand); }
.new span:nth-child(2) { flex: 1; display: flex; flex-direction: column; color: var(--ink); }
.n-ic { width: 40px; height: 40px; border-radius: 50%; background: var(--brand); color: #fff; display: grid; place-items: center; }
.lbl { font-size: 13px; font-weight: 600; color: var(--ink-3); margin: 22px 4px 10px; }
.favs { display: flex; gap: 16px; }
.fav { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 13px; font-weight: 550; }
.list { padding: 4px 10px; }
.ct { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 4px; text-align: left; }
.ct + .ct { border-top: 1px solid var(--line); }
.ct-m { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.ct-m b { font-weight: 550; }
.ct-m small { font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty { padding: 14px 4px; font-size: 14px; margin: 0; }

.amount-step { flex: 1; display: flex; flex-direction: column; padding: 0 20px 20px; }
.to-chip { align-self: center; display: flex; align-items: center; gap: 10px; padding: 6px 14px 6px 6px; border-radius: 999px; background: var(--surface); }
.to-chip span { display: flex; flex-direction: column; line-height: 1.2; font-size: 14px; }
.to-chip small { font-size: 12px; }
.big { text-align: center; font-size: 46px; font-weight: 700; letter-spacing: -.05em; margin: 22px 0 2px; transition: color .2s; }
.big span { font-size: 26px; color: var(--ink-3); }
.big.zero { color: var(--ink-3); }
.big.err, .avail.err { color: var(--danger); }
.avail { text-align: center; font-size: 13.5px; color: var(--ink-3); margin: 0; }
.quick, .notes { display: flex; justify-content: center; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.quick button, .notes button { padding: 7px 12px; border-radius: 999px; background: var(--surface); font-size: 13px; font-weight: 600; }
.notes { margin-top: 8px; }
.notes button { background: none; border: 1px solid var(--line); color: var(--ink-2); font-weight: 550; }
.notes button.on { border-color: var(--ink); background: var(--ink); color: #fff; }
.pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: auto; padding-top: 14px; }
.key { height: 56px; border-radius: 16px; font-size: 24px; font-weight: 500; display: grid; place-items: center; transition: background .15s; }
.key:active { background: var(--line); }
.cta { padding-top: 12px; }
.confirm { flex: 1; display: flex; flex-direction: column; }
.confirm .cta { margin-top: auto; }
.sumc { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 26px 20px 8px; }
.sumc p { margin: 4px 0; }
.sumc > p.muted { margin-top: 14px; }
.big2 { font-size: 36px; font-weight: 700; letter-spacing: -.045em; margin: 2px 0; }
dl { width: 100%; margin: 18px 0 0; text-align: left; }
dl div { display: flex; justify-content: space-between; padding: 13px 0; border-top: 1px solid var(--line); font-size: 14px; }
dt { color: var(--ink-3); }
dd { margin: 0; font-weight: 600; }
.secure { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12.5px; margin: 16px 0; }
.spin { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff; animation: sp .7s linear infinite; }
@keyframes sp { to { transform: rotate(360deg); } }

.done { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 70px 24px 24px; background: radial-gradient(70% 40% at 50% 10%, rgba(16,155,86,.14), transparent 70%); }
.burst { width: 120px; height: 120px; border-radius: 50%; background: var(--ok-50); display: grid; place-items: center; animation: pop .6s var(--ease) both; }
.check { width: 84px; height: 84px; border-radius: 50%; background: var(--ok); color: #fff; display: grid; place-items: center; box-shadow: 0 16px 30px -12px rgba(16,155,86,.7); animation: pop .6s .1s var(--ease) both; }
@keyframes pop { from { transform: scale(.3); opacity: 0; } 70% { transform: scale(1.08); } }
.done h2 { margin: 28px 0 6px; font-size: 22px; letter-spacing: -.03em; }
.done p { margin: 2px 0; }
.ref { font-size: 12.5px; margin-top: 10px !important; }
.done .cta { margin-top: auto; width: 100%; }
.stack { display: grid; gap: 10px; }
</style>
