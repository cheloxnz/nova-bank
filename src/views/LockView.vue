<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import { useBank } from '../stores/bank.js'

const bank = useBank()
const router = useRouter()
const route = useRoute()
const pin = ref('')
const shake = ref(false)
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches' })

const press = (k) => {
  if (k === 'del') return (pin.value = pin.value.slice(0, -1))
  if (pin.value.length >= 4) return
  pin.value += k
  if (pin.value.length === 4) setTimeout(enter, 220)
}
const enter = () => {
  bank.unlock()
  router.replace(route.query.next || '/')
}
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del']
const base = import.meta.env.BASE_URL
</script>

<template>
  <div class="lock">
    <div class="top">
      <img :src="`${base}icons/icon.svg`" alt="Nova Bank" width="64" height="64" class="logo" />
      <p class="hi">{{ greeting }}, {{ bank.user.name }}</p>
      <p class="muted">Ingresá tu PIN</p>
      <div class="dots" :class="{ shake }">
        <i v-for="n in 4" :key="n" :class="{ on: pin.length >= n }" />
      </div>
      <p class="hint">Demo: cualquier PIN de 4 dígitos</p>
    </div>
    <div class="pad">
      <button v-for="k in keys" :key="k" class="key" :class="{ ghost: k === 'bio' || k === 'del' }" @click="k === 'bio' ? enter() : press(k)" :aria-label="k === 'bio' ? 'Ingresar con biometría' : k === 'del' ? 'Borrar' : k">
        <Icon v-if="k === 'bio'" name="faceid" :size="28" />
        <Icon v-else-if="k === 'del'" name="delete" :size="26" />
        <template v-else>{{ k }}</template>
      </button>
    </div>
    <button class="forgot">¿Olvidaste tu PIN?</button>
  </div>
</template>

<style scoped>
.lock { min-height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 48px 28px 28px; background: radial-gradient(80% 50% at 50% 0%, rgba(109,94,252,.12), transparent 70%); }
.top { display: flex; flex-direction: column; align-items: center; text-align: center; }
.logo { border-radius: 18px; box-shadow: 0 16px 30px -12px rgba(79,70,229,.6); }
.hi { font-size: 22px; font-weight: 700; letter-spacing: -.03em; margin: 22px 0 4px; }
.muted { margin: 0; }
.dots { display: flex; gap: 18px; margin: 28px 0 14px; }
.dots i { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--ink-3); transition: background .15s, border-color .15s, transform .2s var(--ease); }
.dots i.on { background: var(--ink); border-color: var(--ink); transform: scale(1.1); }
.hint { font-size: 12.5px; color: var(--brand); background: var(--brand-50); padding: 5px 12px; border-radius: 999px; margin: 0; }
.pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px 22px; padding: 0 14px; }
.key { height: 68px; border-radius: 50%; font-size: 28px; font-weight: 500; display: grid; place-items: center; background: rgba(255,255,255,.7); transition: background .15s, transform .1s; aspect-ratio: 1; justify-self: center; }
.key:active { background: var(--line); transform: scale(.94); }
.key.ghost { background: none; color: var(--ink-2); }
.forgot { margin-top: 16px; font-size: 14px; color: var(--brand); font-weight: 600; }
</style>
