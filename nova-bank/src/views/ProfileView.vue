<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from '../components/Avatar.vue'
import Icon from '../components/Icon.vue'
import { useBank } from '../stores/bank.js'

const bank = useBank()
const router = useRouter()
const bio = ref(true)
const push = ref(true)
const logout = () => { bank.lock(); router.replace('/lock') }
const reset = () => { bank.reset(); bank.notify('Datos de la demo restablecidos') }
</script>

<template>
  <div class="prof">
    <h1 class="h-title">Perfil</h1>
    <section class="me card">
      <Avatar :name="`${bank.user.name} ${bank.user.last}`" :hue="250" :size="64" />
      <div><b>{{ bank.user.name }} {{ bank.user.last }}</b><small class="muted">{{ bank.user.alias }}</small></div>
      <span class="lvl">Cuenta verificada</span>
    </section>

    <h3 class="lbl">Cuenta</h3>
    <section class="card group">
      <button class="it" @click="bank.sheet = { type: 'receive' }"><span class="ic"><Icon name="qr" :size="20" /></span><span class="t">Mis datos (alias y CVU)</span><Icon name="chevronR" :size="18" class="muted" /></button>
      <RouterLink to="/card" class="it"><span class="ic"><Icon name="card" :size="20" /></span><span class="t">Tarjetas</span><Icon name="chevronR" :size="18" class="muted" /></RouterLink>
      <RouterLink :to="{ path: '/activity' }" class="it"><span class="ic"><Icon name="receipt" :size="20" /></span><span class="t">Comprobantes</span><Icon name="chevronR" :size="18" class="muted" /></RouterLink>
    </section>

    <h3 class="lbl">Seguridad</h3>
    <section class="card group">
      <label class="it"><span class="ic"><Icon name="faceid" :size="20" /></span><span class="t">Ingreso con biometría</span><input type="checkbox" class="sw" v-model="bio" /></label>
      <label class="it"><span class="ic"><Icon name="bell" :size="20" /></span><span class="t">Notificaciones</span><input type="checkbox" class="sw" v-model="push" /></label>
      <label class="it"><span class="ic"><Icon name="eye" :size="20" /></span><span class="t">Ocultar saldos</span><input type="checkbox" class="sw" v-model="bank.hidden" /></label>
    </section>

    <h3 class="lbl">Más</h3>
    <section class="card group">
      <button class="it" @click="bank.notify('Centro de ayuda: próximamente')"><span class="ic"><Icon name="help" :size="20" /></span><span class="t">Ayuda</span><Icon name="chevronR" :size="18" class="muted" /></button>
      <button class="it" @click="reset"><span class="ic"><Icon name="refresh" :size="20" /></span><span class="t">Restablecer datos de la demo</span></button>
      <button class="it danger" @click="logout"><span class="ic"><Icon name="logout" :size="20" /></span><span class="t">Cerrar sesión</span></button>
    </section>
    <p class="ver muted">Nova Bank v1.0 · Template demo por <a href="https://cheloxnz.github.io/" target="_blank" rel="noopener">Marcelo Del Valle</a></p>
  </div>
</template>

<style scoped>
.prof { padding: 14px 20px 0; }
.me { display: flex; align-items: center; gap: 14px; padding: 18px; margin-top: 16px; position: relative; }
.me div { display: flex; flex-direction: column; }
.me b { font-size: 17px; letter-spacing: -.02em; }
.me small { font-size: 13px; }
.lvl { position: absolute; top: 14px; right: 14px; font-size: 11px; font-weight: 650; color: var(--ok); background: var(--ok-50); padding: 3px 8px; border-radius: 999px; }
.lbl { font-size: 13px; font-weight: 600; color: var(--ink-3); margin: 22px 4px 8px; }
.group { padding: 4px 14px; }
.it { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 0; text-align: left; cursor: pointer; }
.it + .it { border-top: 1px solid var(--line); }
.ic { width: 38px; height: 38px; border-radius: 12px; background: var(--surface-2); display: grid; place-items: center; flex: none; }
.t { flex: 1; font-weight: 550; font-size: 14.5px; }
.danger { color: var(--danger); }
.danger .ic { background: var(--danger-50); }
.sw { appearance: none; width: 46px; height: 28px; border-radius: 14px; background: var(--line); position: relative; cursor: pointer; transition: background .2s; flex: none; margin: 0; }
.sw::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .25s var(--ease); }
.sw:checked { background: var(--ok); }
.sw:checked::after { transform: translateX(18px); }
.ver { text-align: center; font-size: 12px; margin: 22px 0 0; }
.ver a { color: var(--brand); font-weight: 600; }
</style>
