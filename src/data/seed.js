// Datos de ejemplo (ficticios). Se generan relativos a la fecha actual con un PRNG
// determinístico para que la demo siempre se vea "viva" pero estable.

export const user = { name: 'Marcelo', last: 'Del Valle', alias: 'marcelo.nova.bank', cvu: '0000003100099887766554' }

export const categories = {
  supermercado: { label: 'Supermercado', icon: 'cart', color: 'var(--c1)' },
  restaurantes: { label: 'Comida', icon: 'food', color: 'var(--c2)' },
  transporte: { label: 'Transporte', icon: 'bus', color: 'var(--c3)' },
  servicios: { label: 'Servicios', icon: 'bolt', color: 'var(--c4)' },
  compras: { label: 'Compras', icon: 'bag', color: 'var(--c5)' },
  suscripciones: { label: 'Suscripciones', icon: 'play', color: 'var(--c6)' },
  transferencias: { label: 'Transferencias', icon: 'arrowUp', color: 'var(--ink-3)' },
  ingresos: { label: 'Ingresos', icon: 'arrowDown', color: 'var(--ok)' },
}
export const spendCats = ['supermercado', 'restaurantes', 'transporte', 'servicios', 'compras', 'suscripciones']

export const contacts = [
  { id: 1, name: 'Sofía Romero', alias: 'sofi.romero', bank: 'Nova Bank', hue: 330 },
  { id: 2, name: 'Martín Gómez', alias: 'martin.gomez.ok', bank: 'Banco Andino', hue: 210 },
  { id: 3, name: 'Lucía Fernández', alias: 'lu.fernandez', bank: 'Nova Bank', hue: 160 },
  { id: 4, name: 'Tomás Álvarez', alias: 'tomas.alvarez.mp', bank: 'Billetera Sur', hue: 30 },
  { id: 5, name: 'Valentina Ruiz', alias: 'vale.ruiz', bank: 'Banco Pampa', hue: 270 },
  { id: 6, name: 'Joaquín Pérez', alias: 'joaco.perez', bank: 'Nova Bank', hue: 100 },
  { id: 7, name: 'Camila Torres', alias: 'cami.torres.ar', bank: 'Banco Andino', hue: 0 },
]

const merchants = {
  supermercado: [['Almacén Don Pepe', 18000, 65000], ['Súper Del Barrio', 25000, 90000], ['Verdulería La Huerta', 6000, 18000]],
  restaurantes: [['Café Malbec', 4500, 12000], ['Pizzería Napoli', 14000, 32000], ['Sushi Koi', 22000, 45000]],
  transporte: [['Transporte público', 900, 2600], ['Taxi App', 5000, 16000], ['Estación de servicio', 30000, 55000]],
  servicios: [['Internet Fibra', 28000, 28000], ['Luz', 15000, 32000], ['Gas natural', 9000, 21000]],
  compras: [['Nova Market', 30000, 160000], ['Librería Atenea', 12000, 38000], ['Tienda Deportes', 40000, 120000]],
  suscripciones: [['StreamFlix', 8999, 8999], ['Musicly', 4599, 4599], ['Cloud 200 GB', 2999, 2999]],
}

function prng(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
}

export function seedTransactions() {
  const r = prng(42)
  const now = new Date()
  const txs = []
  let id = 1
  const at = (daysAgo, h) => { const d = new Date(now); d.setDate(d.getDate() - daysAgo); d.setHours(h, Math.floor(r() * 60), 0, 0); return d.toISOString() }

  for (let day = 0; day < 180; day++) {
    // sueldo el día 1 de cada mes
    const d = new Date(now); d.setDate(d.getDate() - day)
    if (d.getDate() === 1) txs.push({ id: id++, type: 'in', title: 'Sueldo', subtitle: 'Acme Software S.A.', category: 'ingresos', amount: 1850000, date: at(day, 9) })
    if (d.getDate() === 10) for (const [t, a] of [['Internet Fibra', 28000], ['StreamFlix', 8999], ['Musicly', 4599]])
      txs.push({ id: id++, type: 'out', title: t, subtitle: t === 'Internet Fibra' ? 'Débito automático' : 'Suscripción', category: t === 'Internet Fibra' ? 'servicios' : 'suscripciones', amount: a, date: at(day, 8) })
    const n = r() < 0.35 ? 0 : r() < 0.7 ? 1 : 2
    for (let k = 0; k < n; k++) {
      const cat = ['supermercado', 'restaurantes', 'transporte', 'transporte', 'compras', 'servicios', 'restaurantes', 'supermercado'][Math.floor(r() * 8)]
      const list = merchants[cat].filter(([t]) => !['Internet Fibra', 'StreamFlix', 'Musicly'].includes(t))
      const [title, min, max] = list[Math.floor(r() * list.length)]
      const amount = Math.round((min + r() * (max - min)) / 10) * 10
      txs.push({ id: id++, type: 'out', title, subtitle: 'Pago con tarjeta', category: cat, amount, date: at(day, 10 + Math.floor(r() * 11)) })
    }
    if (r() < 0.08) {
      const c = contacts[Math.floor(r() * contacts.length)]
      const incoming = r() < 0.5
      txs.push({ id: id++, type: incoming ? 'in' : 'out', title: c.name, subtitle: incoming ? 'Transferencia recibida' : 'Transferencia enviada', category: incoming ? 'ingresos' : 'transferencias', contactId: c.id, amount: Math.round((10000 + r() * 60000) / 100) * 100, date: at(day, 12 + Math.floor(r() * 8)) })
    }
  }
  return txs.sort((a, b) => b.date.localeCompare(a.date))
}

export const money = (n, cur = 'ARS', hideDecimals = false) => {
  const s = Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: hideDecimals ? 0 : 2, maximumFractionDigits: hideDecimals ? 0 : 2 })
  return (cur === 'USD' ? 'US$ ' : '$ ') + s
}
export const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('')
