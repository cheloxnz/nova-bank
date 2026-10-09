<script setup>
import { ref, computed } from 'vue'
import TxItem from '../components/TxItem.vue'
import Icon from '../components/Icon.vue'
import { categories, spendCats, money } from '../data/seed.js'
import { useBank } from '../stores/bank.js'

const bank = useBank()
const tab = ref('list')
const q = ref('')
const filter = ref('all')
const shown = ref(40)

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const filtered = computed(() => bank.txs.filter((t) =>
  (filter.value === 'all' || (filter.value === 'in' ? t.type === 'in' : t.type === 'out')) &&
  (!q.value || norm(t.title + ' ' + t.subtitle + ' ' + categories[t.category].label).includes(norm(q.value)))))

const dayLabel = (iso) => {
  const d = new Date(iso); const today = new Date(); const y = new Date(); y.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === y.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}
const groups = computed(() => {
  const out = []
  for (const t of filtered.value.slice(0, shown.value)) {
    const k = new Date(t.date).toDateString()
    const last = out[out.length - 1]
    if (last && last.k === k) last.items.push(t)
    else out.push({ k, label: dayLabel(t.date), items: [t] })
  }
  return out
})

/* ── Estadísticas ── */
const months = computed(() => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const txs = bank.txs.filter((t) => { const x = new Date(t.date); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear() })
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      short: d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', ''),
      long: d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
      spent: txs.filter((t) => t.type === 'out').reduce((a, t) => a + t.amount, 0),
      income: txs.filter((t) => t.type === 'in').reduce((a, t) => a + t.amount, 0),
      txs,
    }
  })
})
const sel = ref(5)
const hover = ref(null)
const month = computed(() => months.value[sel.value])
const maxSpent = computed(() => Math.max(...months.value.map((m) => m.spent), 1))

const byCat = computed(() => {
  const totals = spendCats.map((c) => ({ id: c, ...categories[c], total: month.value.txs.filter((t) => t.type === 'out' && t.category === c).reduce((a, t) => a + t.amount, 0) }))
  const sum = totals.reduce((a, c) => a + c.total, 0) || 1
  return totals.map((c) => ({ ...c, pct: (c.total / sum) * 100 })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total)
})
// Donut: arcos con 2px de separación
const R = 70, C = 2 * Math.PI * R
const arcs = computed(() => {
  let acc = 0
  return byCat.value.map((c) => {
    const len = (c.pct / 100) * C
    const a = { ...c, dash: `${Math.max(0, len - 3)} ${C}`, offset: -acc }
    acc += len
    return a
  })
})
const activeCat = ref(null)
const center = computed(() => activeCat.value ? byCat.value.find((c) => c.id === activeCat.value) : null)
</script>

<template>
  <div class="act">
    <h1 class="h-title">Actividad</h1>
    <div class="seg" role="tablist">
      <button :class="{ on: tab === 'list' }" @click="tab = 'list'" role="tab">Movimientos</button>
      <button :class="{ on: tab === 'stats' }" @click="tab = 'stats'" role="tab">Estadísticas</button>
    </div>

    <!-- Movimientos -->
    <template v-if="tab === 'list'">
      <label class="search"><Icon name="search" :size="18" /><input v-model="q" placeholder="Buscar movimientos" type="search" /></label>
      <div class="chips">
        <button v-for="f in [['all', 'Todos'], ['in', 'Ingresos'], ['out', 'Egresos']]" :key="f[0]" :class="{ on: filter === f[0] }" @click="filter = f[0]">{{ f[1] }}</button>
      </div>
      <section v-for="g in groups" :key="g.k" class="day">
        <h3>{{ g.label }}</h3>
        <div class="card list"><TxItem v-for="t in g.items" :key="t.id" :tx="t" /></div>
      </section>
      <p v-if="!groups.length" class="empty muted">No hay movimientos que coincidan.</p>
      <button v-if="filtered.length > shown" class="btn btn-soft btn-block more" @click="shown += 40">Ver más</button>
    </template>

    <!-- Estadísticas -->
    <template v-else>
      <section class="card box">
        <div class="sum">
          <div><small class="muted">Gastaste en {{ month.long }}</small><b class="num">{{ money(month.spent, 'ARS', true) }}</b></div>
          <div class="r"><small class="muted">Ingresos</small><b class="num ok">{{ money(month.income, 'ARS', true) }}</b></div>
        </div>
        <!-- Barras: gasto por mes (una serie) -->
        <div class="bars" role="img" :aria-label="'Gasto mensual de los últimos 6 meses'">
          <button v-for="(m, i) in months" :key="m.key" class="b" :class="{ on: i === sel }" @click="sel = i; activeCat = null"
                  @mouseenter="hover = i" @mouseleave="hover = null" @focus="hover = i" @blur="hover = null" :aria-label="`${m.long}: ${money(m.spent, 'ARS', true)}`">
            <span class="tip num" v-if="hover === i">{{ money(m.spent, 'ARS', true) }}</span>
            <span class="col"><i :style="{ height: Math.max(4, (m.spent / maxSpent) * 100) + '%' }" /></span>
            <span class="lab">{{ m.short }}</span>
          </button>
        </div>
      </section>

      <div class="sec-title"><h2>Por categoría</h2></div>
      <section class="card box cat">
        <div class="donut">
          <svg viewBox="0 0 180 180" role="img" aria-label="Distribución del gasto por categoría">
            <circle cx="90" cy="90" :r="R" fill="none" stroke="var(--surface-2)" stroke-width="20" />
            <circle v-for="a in arcs" :key="a.id" cx="90" cy="90" :r="R" fill="none" :stroke="a.color" stroke-width="20"
                    :stroke-dasharray="a.dash" :stroke-dashoffset="a.offset" transform="rotate(-90 90 90)"
                    :opacity="activeCat && activeCat !== a.id ? .25 : 1" class="arc"
                    @mouseenter="activeCat = a.id" @mouseleave="activeCat = null" @click="activeCat = activeCat === a.id ? null : a.id" />
          </svg>
          <div class="center">
            <small class="muted">{{ center ? center.label : 'Total' }}</small>
            <b class="num">{{ money(center ? center.total : month.spent, 'ARS', true) }}</b>
            <small v-if="center" class="muted num">{{ center.pct.toFixed(1) }}%</small>
          </div>
        </div>
        <ul class="legend">
          <li v-for="c in byCat" :key="c.id" :class="{ dim: activeCat && activeCat !== c.id }" @click="activeCat = activeCat === c.id ? null : c.id">
            <i :style="{ background: c.color }" />
            <span class="n">{{ c.label }}</span>
            <span class="p muted num">{{ c.pct.toFixed(0) }}%</span>
            <b class="num">{{ money(c.total, 'ARS', true) }}</b>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.act { padding: 14px 20px 0; }
.seg { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; background: var(--surface-2); border-radius: 14px; margin: 16px 0; }
.seg button { padding: 9px; border-radius: 10px; font-size: 14px; font-weight: 600; color: var(--ink-3); transition: background .2s, color .2s; }
.seg button.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(14,17,22,.1); }
.search { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 14px; border-radius: 14px; background: var(--surface); color: var(--ink-3); }
.search input { flex: 1; border: 0; outline: none; background: none; color: var(--ink); min-width: 0; }
.chips { display: flex; gap: 8px; margin: 12px 0 4px; }
.chips button { padding: 7px 14px; border-radius: 999px; background: var(--surface); font-size: 13.5px; font-weight: 550; color: var(--ink-2); transition: background .2s, color .2s; }
.chips button.on { background: var(--ink); color: #fff; }
.day h3 { font-size: 13px; font-weight: 600; color: var(--ink-3); margin: 18px 4px 8px; }
.day h3::first-letter { text-transform: uppercase; }
.list { padding: 4px 10px; }
.empty { text-align: center; padding: 30px 0; }
.more { margin-top: 16px; }

.box { padding: 18px; }
.sum { display: flex; justify-content: space-between; gap: 10px; }
.sum div { display: flex; flex-direction: column; }
.sum .r { text-align: right; }
.sum small { font-size: 12.5px; }
.sum small::first-letter { text-transform: uppercase; }
.sum b { font-size: 22px; letter-spacing: -.03em; }
.bars { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; height: 150px; margin-top: 18px; }
.b { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; }
.col { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
.col i { width: 70%; max-width: 30px; border-radius: 4px 4px 0 0; background: #c9c6f7; transition: height .5s var(--ease), background .2s; }
.b.on .col i { background: var(--brand); }
.b:hover .col i { background: #a5a0f2; }
.b.on:hover .col i { background: var(--brand); }
.lab { font-size: 12px; color: var(--ink-3); font-weight: 550; text-transform: capitalize; }
.b.on .lab { color: var(--ink); }
.tip { position: absolute; top: -10px; left: 50%; transform: translate(-50%, -100%); background: var(--ink); color: #fff; font-size: 11.5px; font-weight: 600; padding: 4px 8px; border-radius: 8px; white-space: nowrap; z-index: 2; pointer-events: none; }

.cat { display: flex; flex-direction: column; align-items: center; }
.donut { position: relative; width: 190px; height: 190px; }
.donut svg { width: 100%; height: 100%; }
.arc { cursor: pointer; transition: opacity .2s; }
.center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.center small { font-size: 12px; }
.center b { font-size: 19px; letter-spacing: -.03em; }
.legend { list-style: none; padding: 0; margin: 16px 0 0; width: 100%; }
.legend li { display: grid; grid-template-columns: 12px 1fr auto auto; align-items: center; gap: 10px; padding: 10px 2px; border-top: 1px solid var(--line); font-size: 14px; cursor: pointer; transition: opacity .2s; }
.legend li.dim { opacity: .4; }
.legend i { width: 10px; height: 10px; border-radius: 3px; }
.legend b { font-weight: 600; min-width: 88px; text-align: right; }
.legend .p { font-size: 12.5px; }
</style>
