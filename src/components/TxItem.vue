<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'
import Avatar from './Avatar.vue'
import { categories, contacts, money } from '../data/seed.js'
import { useBank } from '../stores/bank.js'

const props = defineProps({ tx: Object, showDate: Boolean })
const bank = useBank()
const cat = computed(() => categories[props.tx.category])
const contact = computed(() => contacts.find((c) => c.id === props.tx.contactId))
const time = computed(() => {
  const d = new Date(props.tx.date)
  return props.showDate
    ? d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    : d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
})
</script>

<template>
  <button class="tx" @click="bank.sheet = { type: 'tx', tx }">
    <Avatar v-if="contact" :name="contact.name" :hue="contact.hue" :size="44" />
    <span v-else class="ic" :style="{ color: cat.color }"><Icon :name="cat.icon" :size="20" /></span>
    <span class="mid">
      <b>{{ tx.title }}</b>
      <small>{{ tx.subtitle }} · {{ time }}</small>
    </span>
    <span class="amt num" :class="{ in: tx.type === 'in' }">
      {{ bank.hidden ? '••••' : (tx.type === 'in' ? '+ ' : '− ') + money(tx.amount).replace('$ ', '$') }}
    </span>
  </button>
</template>

<style scoped>
.tx { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 4px; text-align: left; border-radius: 14px; transition: background .2s; }
.tx:active { background: var(--surface-2); }
.ic { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; flex: none; background: var(--surface-2); }
.mid { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.mid b { font-weight: 550; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mid small { font-size: 12.5px; color: var(--ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.amt { font-weight: 600; font-size: 15px; white-space: nowrap; }
.amt.in { color: var(--ok); }
</style>
