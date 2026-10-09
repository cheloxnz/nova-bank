import { defineStore } from 'pinia'
import { seedTransactions, contacts, user } from '../data/seed.js'

const KEY = 'nova-bank-v1'
let toastTimer
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null } }

const fresh = () => ({
  unlocked: false,
  hidden: false,
  currency: 'ARS',
  balances: { ARS: 2486350.75, USD: 1240.5 },
  txs: seedTransactions(),
  card: { frozen: false, online: true, international: false, contactless: true, limit: 800000 },
  favorites: [1, 3, 5],
})

export const useBank = defineStore('bank', {
  state: () => ({ ...fresh(), ...(load() || {}), unlocked: false, sheet: null, toast: null }),
  getters: {
    user: () => user,
    contacts: () => contacts,
    balance: (s) => s.balances[s.currency],
    monthStats: (s) => {
      const now = new Date()
      const inMonth = s.txs.filter((t) => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
      return {
        income: inMonth.filter((t) => t.type === 'in').reduce((a, t) => a + t.amount, 0),
        spent: inMonth.filter((t) => t.type === 'out').reduce((a, t) => a + t.amount, 0),
      }
    },
  },
  actions: {
    unlock() { this.unlocked = true },
    lock() { this.unlocked = false; this.sheet = null },
    transfer({ contact, amount, note }) {
      if (amount <= 0 || amount > this.balances.ARS) throw new Error('Saldo insuficiente')
      this.balances.ARS = Math.round((this.balances.ARS - amount) * 100) / 100
      const tx = {
        id: Date.now(), type: 'out', title: contact.name, subtitle: note || 'Transferencia enviada',
        category: 'transferencias', contactId: contact.id, amount, date: new Date().toISOString(),
        ref: Math.random().toString(36).slice(2, 10).toUpperCase(),
      }
      this.txs.unshift(tx)
      return tx
    },
    notify(text) {
      this.toast = { text, key: Date.now() }
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => (this.toast = null), 2200)
    },
    reset() { Object.assign(this, fresh(), { unlocked: true }) },
    persist() {
      const { hidden, currency, balances, txs, card, favorites } = this
      try { localStorage.setItem(KEY, JSON.stringify({ hidden, currency, balances, txs, card, favorites })) } catch {}
    },
  },
})
