<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import InteractionConfigPanel from '../components/InteractionConfigPanel.vue'
import HotwordConfigPanel from '../components/HotwordConfigPanel.vue'
import { moduleData } from '../config/modules'

const route = useRoute()
const router = useRouter()

const currentHuman = computed(() => (
  moduleData.digitalHumans.rows.find((row) => row.appCode === route.params.appCode)
  || moduleData.digitalHumans.rows[0]
))

const activeSection = ref('形象设置')
const activeSettingsTab = ref('角色')
const selectedCharacter = ref('默认')
const selectedPreview = ref(currentHuman.value.preview)
const selectedMotion = ref('自然待机')
const selectedVoice = ref('温柔女声')
const speechRate = ref(1)
const outputResolution = ref(currentHuman.value.resolution || '9:16')
const backgroundMode = ref('透明背景')
const customBackgroundInput = ref(null)
const customBackgroundUrl = ref('')
const webBackgroundError = ref('')
const backgroundItems = ref([
  { id: 'transparent-default', type: '透明背景', name: '默认透明背景' },
])
const activeBackgroundId = ref('transparent-default')
const interactionConfigKey = ref(0)
const toastVisible = ref(false)
const toastMessage = ref('')

let backgroundSequence = 0

const activeBackground = computed(() => (
  backgroundItems.value.find((item) => item.id === activeBackgroundId.value)
  || backgroundItems.value[0]
))

const previewBackgroundStyle = computed(() => (
  activeBackground.value?.type === '图片背景'
    ? { backgroundImage: `linear-gradient(rgba(20, 23, 40, .08), rgba(20, 23, 40, .08)), url("${activeBackground.value.source}")` }
    : undefined
))

const characterOptions = computed(() => {
  const rows = moduleData.digitalHumans.rows
  return [
    { name: '默认', preview: currentHuman.value.preview },
    { name: '友好讲解', preview: rows[0].preview },
    { name: '专业主持', preview: rows[1].preview },
    { name: '商务导师', preview: rows[3].preview },
    { name: '客服形象', preview: rows[2].preview },
    { name: '活力推荐', preview: rows[1].preview },
  ]
})

const detailNav = [
  { group: '数字人管理', icon: 'user', items: ['形象设置'] },
  { group: '对话管理', icon: 'message', items: ['交互配置', '智能体配置', '热词配置'] },
  { group: '接入管理', icon: 'logout', items: ['接入配置'] },
]

const motions = ['自然待机', '挥手问候', '右手指引', '双手展示', '点赞互动']

function selectCharacter(item) {
  selectedCharacter.value = item.name
  selectedPreview.value = item.preview
}

function handleSectionClick(item) {
  if (item === '智能体配置') {
    const relatedAgent = moduleData.agents.rows.find((agent) => agent.subtitle === currentHuman.value.linkedAgentId)
      || moduleData.agents.rows.find((agent) => agent.name === currentHuman.value.extra)
      || moduleData.agents.rows[0]
    router.push({
      name: 'digitalHumanAgentDetail',
      params: { digitalHumanCode: currentHuman.value.appCode, agentId: relatedAgent.subtitle },
      query: { digitalHumanType: currentHuman.value.type },
    })
    return
  }
  activeSection.value = item
}

function saveSettings() {
  toastMessage.value = `${activeSection.value}已保存`
  toastVisible.value = true
  window.setTimeout(() => { toastVisible.value = false }, 2600)
}

function handleAccessAction(action) {
  toastMessage.value = action === '查看使用文档' ? '正在打开数字人软件使用文档' : action === '查看更新日志' ? '正在打开数字人软件更新日志' : '数字人软件下载已开始'
  toastVisible.value = true
  window.setTimeout(() => { toastVisible.value = false }, 2600)
}

function resetInteractionConfig() {
  interactionConfigKey.value += 1
}

function handleCustomBackground(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  const type = backgroundMode.value
  const addedItems = files.map((file) => ({
    id: `custom-background-${Date.now()}-${backgroundSequence++}`,
    type,
    name: file.name,
    source: URL.createObjectURL(file),
    size: file.size,
  }))
  backgroundItems.value.push(...addedItems)
  selectBackground(addedItems.at(-1))
  event.target.value = ''
}

function addWebBackground() {
  let url = customBackgroundUrl.value.trim()
  webBackgroundError.value = ''
  if (!url) {
    webBackgroundError.value = '请输入网页地址'
    return
  }
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`

  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'https:') throw new Error('protocol')
  } catch {
    webBackgroundError.value = '请输入有效的 HTTPS 网页地址'
    return
  }

  const item = {
    id: `custom-background-${Date.now()}-${backgroundSequence++}`,
    type: '网页背景',
    name: new URL(url).hostname,
    source: url,
  }
  backgroundItems.value.push(item)
  customBackgroundUrl.value = ''
  selectBackground(item)
}

function selectBackground(item) {
  activeBackgroundId.value = item.id
  backgroundMode.value = item.type
}

function removeBackground(item) {
  if (item.id === 'transparent-default') return
  if (item.source?.startsWith('blob:')) URL.revokeObjectURL(item.source)
  backgroundItems.value = backgroundItems.value.filter((background) => background.id !== item.id)
  if (activeBackgroundId.value === item.id) selectBackground(backgroundItems.value[0])
}
</script>

<template>
  <div class="digital-human-detail-page" style="--accent: #8b5cf6">
    <header class="detail-page-header">
      <div class="detail-title-wrap">
        <button class="detail-back-button" aria-label="返回数字人列表" @click="router.push('/digital-humans')">
          <AppIcon name="chevron" :size="19" />
        </button>
        <div>
          <div class="detail-breadcrumb">数字人 / {{ currentHuman.name }}</div>
          <h1>{{ activeSection }}</h1>
          <p>{{ activeSection === '交互配置' ? '设置数字人的交互模式、静默状态和常见问题。' : activeSection === '热词配置' ? '配置识别错误词汇的替换规则，提升语音识别准确度。' : activeSection === '接入配置' ? '查看数字人软件的设备部署要求、使用文档与下载入口。' : '配置数字人的外观形象、音色与输出效果。' }}</p>
        </div>
      </div>
      <div v-if="!['热词配置', '接入配置'].includes(activeSection)" class="detail-header-actions">
        <button v-if="activeSection === '交互配置'" class="secondary-button detail-reset-button" @click="resetInteractionConfig">重置配置</button>
        <button class="primary-button detail-save-button" @click="saveSettings">
          <AppIcon name="check" :size="17" />保存配置
        </button>
      </div>
    </header>

    <div class="digital-human-detail-layout">
      <aside class="detail-subnav">
        <div class="detail-human-summary">
          <img :src="currentHuman.preview" :alt="`${currentHuman.name}头像`" />
          <div><strong>{{ currentHuman.name }}</strong><small>{{ currentHuman.appCode }}</small></div>
        </div>
        <nav aria-label="数字人详情导航">
          <section v-for="section in detailNav" :key="section.group">
            <div class="detail-nav-group"><AppIcon :name="section.icon" :size="15" />{{ section.group }}</div>
            <button
              v-for="item in section.items"
              :key="item"
              :class="{ active: activeSection === item }"
              @click="handleSectionClick(item)"
            >
              {{ item }}
            </button>
          </section>
        </nav>
      </aside>

      <main v-if="activeSection === '形象设置'" class="detail-preview-column">
        <section
          class="detail-preview-stage"
          :class="{ 'transparent-preview-stage': activeBackground?.type === '透明背景', 'custom-image-preview-stage': activeBackground?.type === '图片背景' }"
          :style="previewBackgroundStyle"
        >
          <video v-if="activeBackground?.type === '视频背景'" class="preview-background-media" :src="activeBackground.source" autoplay muted loop playsinline></video>
          <iframe v-else-if="activeBackground?.type === '网页背景'" class="preview-background-media" :src="activeBackground.source" title="网页背景预览" tabindex="-1"></iframe>
          <span class="preview-stage-badge"><i></i>实时预览</span>
          <img class="preview-character-image" :src="selectedPreview" :alt="`${currentHuman.name}${selectedCharacter}形象`" />
          <div class="preview-stage-info">
            <span>{{ selectedCharacter }}</span>
            <small>{{ outputResolution }}</small>
          </div>
        </section>

        <section v-if="currentHuman.type === '2D本地版'" class="motion-preview-panel">
          <div class="motion-panel-heading">
            <div><strong>动作预览</strong><span>选择动作查看形象效果</span></div>
            <span>{{ motions.length }} 个动作</span>
          </div>
          <div class="motion-options">
            <button
              v-for="(motion, index) in motions"
              :key="motion"
              :class="{ active: selectedMotion === motion }"
              @click="selectedMotion = motion"
            >
              <span class="motion-thumb"><img :src="selectedPreview" alt="" :style="{ objectPosition: `${42 + index * 4}% top` }" /></span>
              <span>{{ motion }}</span>
            </button>
          </div>
        </section>
      </main>

      <aside v-if="activeSection === '形象设置'" class="detail-settings-panel">
        <div class="settings-tabs" :class="{ 'two-tabs': currentHuman.type === '2D在线版' }">
          <button v-for="tab in (currentHuman.type === '2D在线版' ? ['角色', '输出设置'] : ['角色', '音色', '输出设置'])" :key="tab" :class="{ active: activeSettingsTab === tab }" @click="activeSettingsTab = tab">
            {{ tab }}
          </button>
        </div>

        <div v-if="activeSettingsTab === '角色'" class="settings-tab-content">
          <div class="settings-section-title"><strong>选择角色形象</strong><span>当前：{{ selectedCharacter }}</span></div>
          <div class="character-option-grid">
            <button v-for="item in characterOptions" :key="item.name" :class="{ active: selectedCharacter === item.name }" @click="selectCharacter(item)">
              <span><img :src="item.preview" :alt="item.name" /><i><AppIcon name="check" :size="13" /></i></span>
              <strong>{{ item.name }}</strong>
            </button>
          </div>
        </div>

        <div v-else-if="activeSettingsTab === '音色'" class="settings-tab-content settings-form-content">
          <div class="settings-section-title"><strong>音色配置</strong><span>试听并选择适合的声音</span></div>
          <label for="voice-select">默认音色</label>
          <select id="voice-select" v-model="selectedVoice">
            <option>温柔女声</option>
            <option>知性女声</option>
            <option>沉稳男声</option>
            <option>活力青年</option>
          </select>
          <label for="speech-rate">语速 <span>{{ speechRate }}×</span></label>
          <input id="speech-rate" v-model="speechRate" type="range" min="0.5" max="1.5" step="0.1" />
          <button class="voice-preview-button"><AppIcon name="video" :size="16" />试听当前音色</button>
        </div>

        <div v-else class="settings-tab-content settings-form-content">
          <div class="settings-section-title"><strong>输出设置</strong><span>配置画面比例与背景</span></div>
          <label>画面比例</label>
          <div class="detail-resolution-options">
            <button v-for="resolution in ['16:9', '9:16']" :key="resolution" :class="{ active: outputResolution === resolution }" @click="outputResolution = resolution">
              <span :class="resolution === '16:9' ? 'landscape' : 'portrait'"></span>{{ resolution }}
            </button>
          </div>
          <label for="background-mode">背景模式</label>
          <select id="background-mode" v-model="backgroundMode">
            <option>透明背景</option>
            <option>图片背景</option>
            <option>视频背景</option>
            <option>网页背景</option>
          </select>
          <div v-if="backgroundMode === '透明背景'" class="transparent-background-note">
            <span></span><div><strong>透明背景</strong><small>透明背景已加入背景库，可随时切换使用</small></div>
          </div>
          <template v-else-if="['图片背景', '视频背景'].includes(backgroundMode)">
            <label>添加自定义{{ backgroundMode }}</label>
            <label class="custom-background-upload">
              <input
                ref="customBackgroundInput"
                type="file"
                multiple
                :accept="backgroundMode === '图片背景' ? 'image/png,image/jpeg,image/webp,image/gif' : 'video/mp4,video/webm,video/quicktime'"
                @change="handleCustomBackground"
              />
              <span><AppIcon :name="backgroundMode === '图片背景' ? 'image' : 'video'" :size="19" /></span>
              <div><strong>上传一个或多个{{ backgroundMode }}</strong><small>{{ backgroundMode === '图片背景' ? '支持 JPG、PNG、WEBP、GIF' : '支持 MP4、MOV、WEBM' }}</small></div>
              <em>选择文件</em>
            </label>
          </template>
          <template v-else>
            <label for="custom-background-url">添加自定义网页背景</label>
            <div class="web-background-entry">
              <input id="custom-background-url" v-model.trim="customBackgroundUrl" class="custom-background-url" type="url" placeholder="请输入网页地址" @keyup.enter="addWebBackground" />
              <button type="button" @click="addWebBackground"><AppIcon name="plus" :size="15" />添加</button>
            </div>
            <small v-if="webBackgroundError" class="custom-background-error">{{ webBackgroundError }}</small>
            <small class="custom-background-hint">网页需支持 HTTPS，并允许在嵌入式页面中访问</small>
          </template>
          <div class="background-library-heading">
            <label>背景列表</label><span>{{ backgroundItems.length }} 个</span>
          </div>
          <div class="background-library">
            <div v-for="item in backgroundItems" :key="item.id" class="background-library-item" :class="{ active: activeBackgroundId === item.id }">
              <button type="button" class="background-select-button" @click="selectBackground(item)">
                <span class="background-thumb" :class="{ transparent: item.type === '透明背景' }">
                  <img v-if="item.type === '图片背景'" :src="item.source" alt="" />
                  <video v-else-if="item.type === '视频背景'" :src="item.source" muted></video>
                  <AppIcon v-else-if="item.type === '网页背景'" name="link" :size="18" />
                </span>
                <span class="background-item-copy"><strong>{{ item.name }}</strong><small>{{ item.type }}</small></span>
                <AppIcon v-if="activeBackgroundId === item.id" class="background-active-icon" name="check" :size="17" />
              </button>
              <button v-if="item.id !== 'transparent-default'" type="button" class="background-remove-button" :aria-label="`删除${item.name}`" @click="removeBackground(item)"><AppIcon name="trash" :size="14" /></button>
            </div>
          </div>
        </div>
      </aside>

      <InteractionConfigPanel v-else-if="activeSection === '交互配置'" :key="interactionConfigKey" />
      <HotwordConfigPanel v-else-if="activeSection === '热词配置'" />
      <section v-else-if="activeSection === '接入配置'" class="access-config-panel">
        <div class="access-config-heading">
          <span class="access-config-icon"><AppIcon name="server" :size="23" /></span>
          <div><h2>数字人软件设备部署配置</h2><p>当前应用为 {{ currentHuman.type }}，请根据以下配置准备运行设备。</p></div>
          <span class="access-edition-badge">{{ currentHuman.type }}</span>
        </div>

        <div class="deployment-requirements">
          <div class="deployment-section-title"><div><strong>推荐配置参数</strong><span>保证数字人软件稳定运行</span></div><em>RECOMMENDED</em></div>
          <div class="deployment-spec-grid">
            <article>
              <span><AppIcon name="server" :size="21" /></span>
              <div><small>CPU</small><strong>Intel Core i7-12700</strong><p>12 核 20 线程或更高配置</p></div>
            </article>
            <article>
              <span><AppIcon name="database" :size="21" /></span>
              <div><small>内存</small><strong>32 GB</strong><p>建议预留充足运行内存</p></div>
            </article>
            <article v-if="currentHuman.type === '2D本地版'">
              <span><AppIcon name="video" :size="21" /></span>
              <div><small>显卡</small><strong>NVIDIA RTX 4070 / 5070</strong><p>本地渲染需要独立显卡支持</p></div>
            </article>
            <article v-else class="no-gpu-requirement">
              <span><AppIcon name="check" :size="21" /></span>
              <div><small>显卡</small><strong>无独立显卡要求</strong><p>2D在线版由云端完成数字人渲染</p></div>
            </article>
          </div>
        </div>

        <div class="deployment-access-note">
          <AppIcon name="info" :size="18" />
          <div><strong>部署提示</strong><p>下载数字人软件后，请使用当前数字人的应用码和有效设备授权码完成绑定。</p></div>
        </div>

        <div class="access-resource-section">
          <div><h3>文档与软件下载</h3><p>查看使用说明、版本更新内容或下载最新版数字人软件。</p></div>
          <div class="access-resource-actions">
            <button type="button" @click="handleAccessAction('查看使用文档')"><AppIcon name="file" :size="17" /><span><strong>查看数字人软件使用文档</strong><small>部署及操作说明</small></span><AppIcon name="chevron" :size="15" /></button>
            <button type="button" @click="handleAccessAction('查看更新日志')"><AppIcon name="clock" :size="17" /><span><strong>软件更新日志</strong><small>查看版本更新内容</small></span><AppIcon name="chevron" :size="15" /></button>
            <button type="button" class="download-software-button" @click="handleAccessAction('下载数字人软件')"><AppIcon name="download" :size="17" /><span><strong>下载数字人软件</strong><small>获取最新安装包</small></span><AppIcon name="chevron" :size="15" /></button>
          </div>
        </div>
      </section>
    </div>

    <Transition name="toast">
      <div v-if="toastVisible" class="toast-message"><AppIcon name="check" :size="19" />{{ toastMessage }}</div>
    </Transition>
  </div>
</template>
