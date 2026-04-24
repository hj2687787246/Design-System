<template>
  <main class="login-page">
    <div class="login-background" aria-hidden="true">
      <span class="wave wave-a"></span>
      <span class="wave wave-b"></span>
    </div>

    <section class="login-card" aria-labelledby="login-title">
      <div class="brand-mark" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div class="login-heading">
        <h1 id="login-title">管理系统</h1>
        <p>欢迎登录，请输入账号密码</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <label class="form-field">
          <span>账号</span>
          <input v-model.trim="loginForm.account" type="text" autocomplete="username" placeholder="请输入账号" />
        </label>

        <label class="form-field">
          <span>密码</span>
          <input v-model="loginForm.password" type="password" autocomplete="current-password" placeholder="请输入密码" />
        </label>

        <div class="form-options">
          <label class="remember-password">
            <input v-model="loginForm.remember" type="checkbox" />
            <span>记住密码</span>
          </label>
          <a href="javascript:void(0)">忘记密码</a>
        </div>

        <button class="login-button" type="submit">登录</button>

        <p class="permission-tip">登录后系统将自动识别用户权限</p>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const loginForm = reactive({
  account: '',
  password: '',
  remember: true
})

const handleLogin = () => {
  console.log('login submit', {
    account: loginForm.account,
    remember: loginForm.remember
  })
}
</script>
