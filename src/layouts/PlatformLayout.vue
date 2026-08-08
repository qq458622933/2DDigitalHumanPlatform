<script setup>
import { computed, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { navItems } from '../config/modules'

const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)
const profileOpen = ref(false)
const tutorialIntroOpen = ref(true)
const tutorialOpen = ref(false)
const tutorialStep = ref(0)
const tutorialStepName = computed(() => ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][tutorialStep.value] || String(tutorialStep.value))

watch(() => route.path, () => {
  mobileOpen.value = Boolean(tutorialOpen.value && [1, 3, 5, 7, 9, 10].includes(tutorialStep.value) && window.innerWidth <= 820)
  profileOpen.value = false
})

function startTutorial() {
  tutorialIntroOpen.value = false
  tutorialOpen.value = true
  tutorialStep.value = 1
  profileOpen.value = false
  if (window.innerWidth <= 820) mobileOpen.value = true
}

function skipTutorialIntro() {
  tutorialIntroOpen.value = false
}

function closeTutorial() {
  tutorialOpen.value = false
  tutorialStep.value = 0
}

function handleHelpClick() {
  if (tutorialOpen.value && tutorialStep.value === 10) {
    closeTutorial()
    return
  }
  startTutorial()
}

function handleTutorialNavClick(item) {
  if (tutorialOpen.value && tutorialStep.value === 1 && item.key === 'training') {
    tutorialStep.value = 2
    if (window.innerWidth <= 820) mobileOpen.value = false
    return
  }
  if (tutorialOpen.value && tutorialStep.value === 3 && item.key === 'orchestration') {
    tutorialStep.value = 4
    if (window.innerWidth <= 820) mobileOpen.value = false
    return
  }
  if (tutorialOpen.value && tutorialStep.value === 5 && item.key === 'knowledge') {
    tutorialStep.value = 6
    if (window.innerWidth <= 820) mobileOpen.value = false
    return
  }
  if (tutorialOpen.value && tutorialStep.value === 7 && item.key === 'digitalHumans') {
    tutorialStep.value = 8
    if (window.innerWidth <= 820) mobileOpen.value = false
    return
  }
  if (tutorialOpen.value && tutorialStep.value === 9 && item.key === 'benefits') {
    tutorialStep.value = 10
    if (window.innerWidth <= 820) mobileOpen.value = true
  }
}

function completeTutorialStep(step) {
  if (!tutorialOpen.value || tutorialStep.value !== step) return
  if (step === 2) {
    tutorialStep.value = 3
    if (window.innerWidth <= 820) mobileOpen.value = true
    return
  }
  if (step === 4) {
    tutorialStep.value = 5
    if (window.innerWidth <= 820) mobileOpen.value = true
    return
  }
  if (step === 6) {
    tutorialStep.value = 7
    if (window.innerWidth <= 820) mobileOpen.value = true
    return
  }
  if (step === 8) {
    tutorialStep.value = 9
    if (window.innerWidth <= 820) mobileOpen.value = true
    return
  }
  closeTutorial()
}

async function nextTutorialStep() {
  if (tutorialStep.value === 1) {
    tutorialStep.value = 2
    if (window.innerWidth <= 820) mobileOpen.value = false
    if (route.path !== '/training') await router.push('/training')
    return
  }
  if (tutorialStep.value === 2) {
    tutorialStep.value = 3
    if (window.innerWidth <= 820) mobileOpen.value = true
    return
  }
  if (tutorialStep.value === 3) {
    tutorialStep.value = 4
    if (window.innerWidth <= 820) mobileOpen.value = false
    if (route.path !== '/orchestration') await router.push('/orchestration')
    return
  }
  if (tutorialStep.value === 4) {
    tutorialStep.value = 5
    if (window.innerWidth <= 820) mobileOpen.value = true
    return
  }
  if (tutorialStep.value === 5) {
    tutorialStep.value = 6
    if (window.innerWidth <= 820) mobileOpen.value = false
    if (route.path !== '/knowledge') await router.push('/knowledge')
    return
  }
  if (tutorialStep.value === 6) {
    tutorialStep.value = 7
    if (window.innerWidth <= 820) mobileOpen.value = true
    return
  }
  if (tutorialStep.value === 7) {
    tutorialStep.value = 8
    if (window.innerWidth <= 820) mobileOpen.value = false
    if (route.path !== '/digital-humans') await router.push('/digital-humans')
    return
  }
  if (tutorialStep.value === 8) {
    tutorialStep.value = 9
    if (window.innerWidth <= 820) mobileOpen.value = true
    return
  }
  if (tutorialStep.value === 9) {
    tutorialStep.value = 10
    if (window.innerWidth <= 820) mobileOpen.value = true
    if (route.path !== '/benefits') await router.push('/benefits')
    return
  }
  closeTutorial()
}

async function previousTutorialStep() {
  if (tutorialStep.value <= 1) return
  if (tutorialStep.value === 10) {
    tutorialStep.value = 9
    if (window.innerWidth <= 820) mobileOpen.value = true
    if (route.path !== '/benefits') await router.push('/benefits')
    return
  }
  if (tutorialStep.value === 9) {
    tutorialStep.value = 8
    if (window.innerWidth <= 820) mobileOpen.value = false
    if (route.path !== '/digital-humans') await router.push('/digital-humans')
    return
  }
  if (tutorialStep.value === 8) {
    tutorialStep.value = 7
    if (window.innerWidth <= 820) mobileOpen.value = true
    if (route.path !== '/digital-humans') await router.push('/digital-humans')
    return
  }
  if (tutorialStep.value === 7) {
    tutorialStep.value = 6
    if (window.innerWidth <= 820) mobileOpen.value = false
    if (route.path !== '/knowledge') await router.push('/knowledge')
    return
  }
  if (tutorialStep.value === 6) {
    tutorialStep.value = 5
    if (window.innerWidth <= 820) mobileOpen.value = true
    if (route.path !== '/knowledge') await router.push('/knowledge')
    return
  }
  if (tutorialStep.value === 4) {
    tutorialStep.value = 3
    if (window.innerWidth <= 820) mobileOpen.value = true
    return
  }
  if (tutorialStep.value === 5) {
    tutorialStep.value = 4
    if (window.innerWidth <= 820) mobileOpen.value = false
    if (route.path !== '/orchestration') await router.push('/orchestration')
    return
  }
  if (tutorialStep.value === 3) {
    tutorialStep.value = 2
    if (window.innerWidth <= 820) mobileOpen.value = false
    if (route.path !== '/training') await router.push('/training')
    return
  }
  tutorialStep.value = 1
  if (window.innerWidth <= 820) mobileOpen.value = true
}

provide('platformTutorial', { tutorialOpen, tutorialStep, completeTutorialStep, closeTutorial })
</script>

<template>
  <div class="app-shell">
    <div v-if="mobileOpen" class="sidebar-mask" @click="mobileOpen = false" />

    <div v-if="tutorialIntroOpen || tutorialOpen" class="platform-tutorial-overlay" aria-hidden="true"></div>

    <Transition name="fade">
      <section v-if="tutorialIntroOpen" class="tutorial-intro-dialog" role="dialog" aria-modal="true" aria-label="平台使用指引">
        <div class="tutorial-intro-icon"><AppIcon name="sparkles" :size="29" /></div>
        <span>WELCOME TO DIGITAL HUMAN</span>
        <h1>平台使用指引</h1>
        <p>欢迎使用2D数字人平台，您可以按照以下流程快速完成专属数字人的创建与配置。</p>
        <ol>
          <li><strong>训练形象</strong><span>上传形象视频，训练2D在线版或2D本地版数字人形象。</span></li>
          <li><strong>编排动作</strong><span>为2D本地版播报形象关联多个动作形象。</span></li>
          <li><strong>创建知识库</strong><span>上传业务文档，为数字人智能体提供专业知识。</span></li>
          <li><strong>创建数字人应用</strong><span>配置智能体、交互模式、热词及查看设备部署配置参数。</span></li>
          <li><strong>查看与分配权益</strong><span>管理形象训练次数和设备授权。</span></li>
        </ol>
        <div class="tutorial-intro-actions">
          <button type="button" class="tutorial-intro-start" @click="startTutorial"><AppIcon name="chevron" :size="16" />开始指引</button>
          <button type="button" class="tutorial-intro-skip" @click="skipTutorialIntro">跳过指引</button>
        </div>
      </section>
    </Transition>

    <aside class="sidebar" :class="{ 'is-open': mobileOpen, 'tutorial-active': tutorialOpen && [1, 3, 5, 7, 9, 10].includes(tutorialStep) }">
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
        <RouterLink v-for="item in navItems" :key="item.key" :to="item.path" class="nav-item" :class="{ 'tutorial-target': tutorialOpen && ((tutorialStep === 1 && item.key === 'training') || (tutorialStep === 3 && item.key === 'orchestration') || (tutorialStep === 5 && item.key === 'knowledge') || (tutorialStep === 7 && item.key === 'digitalHumans') || (tutorialStep === 9 && item.key === 'benefits')) }" @click="handleTutorialNavClick(item)">
          <AppIcon :name="item.icon" :size="20" />
          <span>{{ item.label }}</span>
          <AppIcon class="nav-arrow" name="chevron" :size="15" />
        </RouterLink>
      </nav>

      <div class="sidebar-spacer" />
      <div class="sidebar-help" :class="{ 'tutorial-help-target': tutorialOpen && tutorialStep === 10 }" role="button" tabindex="0" @click="handleHelpClick" @keydown.enter="handleHelpClick">
        <div class="help-art"><AppIcon name="help" :size="28" /></div>
        <div>
          <strong>平台使用教程</strong>
          <p>查看平台功能与操作教程</p>
        </div>
        <AppIcon name="chevron" :size="16" />
      </div>
      <div class="sidebar-version">平台版本 v3.8.2</div>
    </aside>

    <Transition name="fade">
      <section v-if="tutorialOpen" class="platform-tutorial-popover" :class="`tutorial-popover-step-${tutorialStep}`" role="dialog" aria-modal="true" :aria-label="`平台使用教程第${tutorialStepName}步`">
        <button type="button" class="tutorial-close" aria-label="关闭教程" @click="closeTutorial"><AppIcon name="close" :size="17" /></button>
        <span class="tutorial-step">平台使用教程 · 第{{ tutorialStepName }}步</span>
        <template v-if="tutorialStep === 1">
          <h2>请点击“形象训练”</h2>
          <p>请先训练您的专属形象，我们的数字人分为2D在线版和2D本地版，2D本地版形象可以支持丰富动作！</p>
          <div class="tutorial-hint">
            <span><AppIcon name="chevron" :size="15" />点击左侧高亮模块继续</span>
            <div class="tutorial-hint-actions"><button type="button" class="tutorial-next" @click="nextTutorialStep">下一步</button><button type="button" class="tutorial-skip" @click="closeTutorial">跳过教程</button></div>
          </div>
        </template>
        <template v-else-if="tutorialStep === 2">
          <h2>请点击“新建训练”</h2>
          <p>请上传数字人的形象训练视频，推荐视频为 MP4 格式，若无形象训练次数请联系管理员进行授权。</p>
          <div class="tutorial-hint">
            <span><AppIcon name="chevron" :size="15" />点击右上角高亮按钮继续</span>
            <div class="tutorial-hint-actions"><button type="button" class="tutorial-previous" @click="previousTutorialStep">上一步</button><button type="button" class="tutorial-next" @click="nextTutorialStep">下一步</button><button type="button" class="tutorial-skip" @click="closeTutorial">跳过教程</button></div>
          </div>
        </template>
        <template v-else-if="tutorialStep === 3">
          <h2>请点击“动作编排”</h2>
          <p>形象训练完成后可以将播报形象和动作形象进行关联，动作编排暂时只支持2D本地版形象。</p>
          <div class="tutorial-hint">
            <span><AppIcon name="chevron" :size="15" />点击左侧高亮模块继续</span>
            <div class="tutorial-hint-actions"><button type="button" class="tutorial-previous" @click="previousTutorialStep">上一步</button><button type="button" class="tutorial-next" @click="nextTutorialStep">下一步</button><button type="button" class="tutorial-skip" @click="closeTutorial">跳过教程</button></div>
          </div>
        </template>
        <template v-else-if="tutorialStep === 4">
          <h2>请点击“新增编排”</h2>
          <p>为播报形象关联动作，一个播报形象可关联多个动作。</p>
          <div class="tutorial-hint">
            <span><AppIcon name="chevron" :size="15" />点击右上角高亮按钮继续</span>
            <div class="tutorial-hint-actions"><button type="button" class="tutorial-previous" @click="previousTutorialStep">上一步</button><button type="button" class="tutorial-next" @click="nextTutorialStep">下一步</button><button type="button" class="tutorial-skip" @click="closeTutorial">跳过教程</button></div>
          </div>
        </template>
        <template v-else-if="tutorialStep === 5">
          <h2>请点击“知识库”</h2>
          <p>请创建您的知识库，创建知识库后可在数字人的智能体配置中进行关联。</p>
          <div class="tutorial-hint">
            <span><AppIcon name="chevron" :size="15" />点击左侧高亮模块继续</span>
            <div class="tutorial-hint-actions"><button type="button" class="tutorial-previous" @click="previousTutorialStep">上一步</button><button type="button" class="tutorial-next" @click="nextTutorialStep">下一步</button><button type="button" class="tutorial-skip" @click="closeTutorial">跳过教程</button></div>
          </div>
        </template>
        <template v-else-if="tutorialStep === 6">
          <h2>请点击“新建知识库”</h2>
          <p>请上传 XLS、VTT、XLSX、MD、HTML、PROPERTIES、MARKDOWN、PDF、MDX、TXT、DOCX、HTM、CSV 格式的文档进行知识库训练。</p>
          <div class="tutorial-hint">
            <span><AppIcon name="chevron" :size="15" />点击右上角高亮按钮继续</span>
            <div class="tutorial-hint-actions"><button type="button" class="tutorial-previous" @click="previousTutorialStep">上一步</button><button type="button" class="tutorial-next" @click="nextTutorialStep">下一步</button><button type="button" class="tutorial-skip" @click="closeTutorial">跳过教程</button></div>
          </div>
        </template>
        <template v-else-if="tutorialStep === 7">
          <h2>请点击“数字人”</h2>
          <p>您可以创建数字人应用，在数字人应用中可以选择交互模式、配置智能体、配置热词以及查看数字人部署要求；下载数字人软件后需要绑定数字人应用码和授权码。</p>
          <div class="tutorial-hint">
            <span><AppIcon name="chevron" :size="15" />点击左侧高亮模块继续</span>
            <div class="tutorial-hint-actions"><button type="button" class="tutorial-previous" @click="previousTutorialStep">上一步</button><button type="button" class="tutorial-next" @click="nextTutorialStep">下一步</button><button type="button" class="tutorial-skip" @click="closeTutorial">跳过教程</button></div>
          </div>
        </template>
        <template v-else-if="tutorialStep === 8">
          <h2>请点击“创建数字人”</h2>
          <p>创建您的专属数字人，您也可以直接复制数字人应用模板进行使用。</p>
          <div class="tutorial-hint">
            <span><AppIcon name="chevron" :size="15" />点击右上角高亮按钮继续</span>
            <div class="tutorial-hint-actions"><button type="button" class="tutorial-previous" @click="previousTutorialStep">上一步</button><button type="button" class="tutorial-next" @click="nextTutorialStep">下一步</button><button type="button" class="tutorial-skip" @click="closeTutorial">跳过教程</button></div>
          </div>
        </template>
        <template v-else-if="tutorialStep === 9">
          <h2>请点击“权益管理”</h2>
          <p>您可以在权益管理页面查看账号的所有权益，数字人形象训练次数和数字人软件部署时的授权码都可以在这里查看；没有相关权益时可联系管理员进行授权。</p>
          <div class="tutorial-hint">
            <span><AppIcon name="chevron" :size="15" />点击左侧高亮模块继续</span>
            <div class="tutorial-hint-actions"><button type="button" class="tutorial-previous" @click="previousTutorialStep">上一步</button><button type="button" class="tutorial-next" @click="nextTutorialStep">下一步</button><button type="button" class="tutorial-skip" @click="closeTutorial">跳过教程</button></div>
          </div>
        </template>
        <template v-else>
          <h2>再次查看平台使用教程</h2>
          <p>以上就是数字人平台的相关操作步骤，后续也可以点击“平台使用教程”再次查看教程；有任何使用相关问题都可以向我们反馈！</p>
          <div class="tutorial-hint">
            <span><AppIcon name="chevron" :size="15" />点击左侧高亮入口完成教程</span>
            <div class="tutorial-hint-actions"><button type="button" class="tutorial-previous" @click="previousTutorialStep">上一步</button><button type="button" class="tutorial-next" @click="nextTutorialStep">完成教程</button><button type="button" class="tutorial-skip" @click="closeTutorial">关闭</button></div>
          </div>
        </template>
      </section>
    </Transition>

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
