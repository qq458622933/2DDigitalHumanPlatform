<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { navItems } from '../config/modules'

const route = useRoute()
const mobileOpen = ref(false)
const profileOpen = ref(false)

watch(() => route.path, () => {
  mobileOpen.value = false
  profileOpen.value = false
})
</script>

<template>
  <div class="app-shell">
    <div v-if="mobileOpen" class="sidebar-mask" @click="mobileOpen = false" />

    <aside class="sidebar" :class="{ 'is-open': mobileOpen }">
      <div class="brand">
        <div class="brand-mark">
          <span></span><span></span><span></span>
        </div>
        <div>
          <div class="brand-name">2D数字人平台</div>
          <div class="brand-en">DIGITAL HUMAN</div>
        </div>
        <button class="mobile-close" aria-label="关闭菜单" @click="mobileOpen = false">
          <AppIcon name="close" />
        </button>
      </div>

      <div class="nav-caption">工作台</div>
      <nav class="main-nav" aria-label="主要导航">
        <RouterLink v-for="item in navItems" :key="item.key" :to="item.path" class="nav-item">
          <AppIcon :name="item.icon" :size="20" />
          <span>{{ item.label }}</span>
          <AppIcon class="nav-arrow" name="chevron" :size="15" />
        </RouterLink>
      </nav>

      <div class="sidebar-spacer" />
      <div class="sidebar-help">
        <div class="help-art"><AppIcon name="help" :size="28" /></div>
        <div>
          <strong>需要帮助？</strong>
          <p>查看使用指南与帮助文档</p>
        </div>
        <AppIcon name="chevron" :size="16" />
      </div>
      <div class="sidebar-version">平台版本 v3.8.2</div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <button class="mobile-menu" aria-label="打开菜单" @click="mobileOpen = true">
          <AppIcon name="menu" :size="22" />
        </button>
        <div class="topbar-title">
          <span class="status-dot"></span>
          <span>服务状态正常</span>
        </div>
        <div class="topbar-actions">
          <button class="icon-button notification" aria-label="通知">
            <AppIcon name="bell" :size="20" />
            <span class="notification-dot"></span>
          </button>
          <span class="topbar-divider"></span>
          <button class="profile-button" @click="profileOpen = !profileOpen">
            <span class="avatar">何</span>
            <span class="profile-copy">
              <strong>何文斌</strong>
              <small>超级管理员</small>
            </span>
            <AppIcon name="chevron-down" :size="15" />
          </button>
          <Transition name="drop">
            <div v-if="profileOpen" class="profile-menu">
              <button><AppIcon name="user" :size="17" />个人中心</button>
              <button><AppIcon name="logout" :size="17" />退出登录</button>
            </div>
          </Transition>
        </div>
      </header>

      <main class="main-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>
    </section>
  </div>
</template>
