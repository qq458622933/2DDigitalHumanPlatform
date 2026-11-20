<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { deviceMapNames, deviceRouteMapRows, deviceRoutePublicConfigs } from '../config/deviceRouteMaps'

const route = useRoute()
const router = useRouter()
const deviceName = computed(() => String(route.query.deviceName || route.params.sn || '当前设备'))
const selectedMap = ref('')
const routes = deviceRouteMapRows
const deviceRoutes = computed(() => routes.value.filter((item) => !item.deviceSn || item.deviceSn === route.params.sn))
const availableMaps = computed(() => [...new Set([...deviceMapNames, ...deviceRoutes.value.map((item) => item.mapName)])])
const visibleRoutes = computed(() => deviceRoutes.value.filter((item) => !selectedMap.value || item.mapName === selectedMap.value))
const publishedRoutes = computed(() => visibleRoutes.value.filter((item) => item.status === 'published'))
const draftRoutes = computed(() => visibleRoutes.value.filter((item) => item.status === 'draft'))

const modalMode = ref('')
const currentRoute = ref(null)
const formName = ref('')
const formMap = ref('')
const formType = ref('导览路线')
const defaultPublicConfig = {
  yieldPromptEnabled: true,
  yieldPrompt: '不好意思，正在任务中，请让一让',
  pauseCommand: '暂停',
  nextCommand: '前往下一站',
  endCommand: '结束',
  resumeCommand: '继续',
}
const publicConfig = ref({ ...defaultPublicConfig })
const publicConfigError = ref('')
const notice = ref('')
let noticeTimer

function showNotice(value) {
  notice.value = value
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => { notice.value = '' }, 3000)
}

function closeModal() {
  modalMode.value = ''
  currentRoute.value = null
}

function openCreate(type) {
  if (type === '导览路线') {
    router.push({ name: 'deviceRouteCreate', params: { sn: route.params.sn }, query: { deviceName: deviceName.value, mapName: selectedMap.value } })
    return
  }
  if (type === '点位引领') {
    router.push({ name: 'devicePointGuide', params: { sn: route.params.sn }, query: { deviceName: deviceName.value, mapName: selectedMap.value } })
    return
  }
  formType.value = type
  formName.value = ''
  formMap.value = selectedMap.value || availableMaps.value[0] || ''
  modalMode.value = 'create'
}

function createRoute() {
  if (!formName.value.trim() || !formMap.value) return
  routes.value.unshift({ id: `route-${Date.now()}`, deviceSn: route.params.sn, name: formName.value.trim(), mapName: formMap.value, type: formType.value, status: 'draft' })
  selectedMap.value = formMap.value
  closeModal()
  showNotice('路线已加入待发布列表')
}

function copyRoute(item) {
  routes.value.unshift({ ...item, id: `route-${Date.now()}`, deviceSn: route.params.sn, name: `${item.name}（副本）`, status: 'draft' })
  selectedMap.value = item.mapName
  showNotice('路线已复制到待发布列表')
}

function deleteRoute(item) {
  if (!window.confirm(`确定删除路线“${item.name}”吗？`)) return
  routes.value = routes.value.filter((row) => row.id !== item.id)
  if (currentRoute.value?.id === item.id) closeModal()
  showNotice('路线已删除')
}

function openRoute(item) {
  if (item.type === '导览路线') {
    router.push({ name: 'deviceRouteEdit', params: { sn: route.params.sn, routeId: item.id }, query: { deviceName: deviceName.value } })
    return
  }
  currentRoute.value = item
  modalMode.value = 'detail'
}

function togglePublish() {
  if (!currentRoute.value) return
  currentRoute.value.status = currentRoute.value.status === 'published' ? 'draft' : 'published'
  showNotice(currentRoute.value.status === 'published' ? '路线已发布' : '路线已移至待发布列表')
  closeModal()
}

function openPublicConfig() {
  publicConfig.value = { ...defaultPublicConfig, ...(deviceRoutePublicConfigs.value[String(route.params.sn)] || {}) }
  publicConfigError.value = ''
  modalMode.value = 'config'
}

function savePublicConfig() {
  if (publicConfig.value.yieldPromptEnabled && !publicConfig.value.yieldPrompt.trim()) {
    publicConfigError.value = '请输入让路提示语'
    return
  }
  deviceRoutePublicConfigs.value[String(route.params.sn)] = {
    yieldPromptEnabled: publicConfig.value.yieldPromptEnabled,
    yieldPrompt: publicConfig.value.yieldPrompt.trim(),
    pauseCommand: publicConfig.value.pauseCommand.trim(),
    nextCommand: publicConfig.value.nextCommand.trim(),
    endCommand: publicConfig.value.endCommand.trim(),
    resumeCommand: publicConfig.value.resumeCommand.trim(),
  }
  closeModal()
  showNotice('路线公共配置已保存')
}

function handleKeydown(event) {
  if (event.key === 'Escape' && modalMode.value) closeModal()
}

onBeforeUnmount(() => window.clearTimeout(noticeTimer))
</script>

<template>
  <div class="route-map-page" @keydown="handleKeydown">
    <header class="route-map-toolbar">
      <button type="button" class="route-back-button" aria-label="返回设备管理" @click="router.push('/devices')"><AppIcon name="chevron" :size="19" /></button>
      <span class="route-device-label">{{ deviceName }} · 路线地图</span>
      <div class="route-toolbar-actions">
        <select v-model="selectedMap" aria-label="地图名称筛选"><option value="">请输入地图名称</option><option v-for="name in availableMaps" :key="name" :value="name">{{ name }}</option></select>
        <button type="button" class="route-outline-button" @click="openCreate('导览路线')"><AppIcon name="plus" :size="16" />新增导览路线</button>
        <button type="button" class="route-primary-button" @click="openCreate('点位引领')"><AppIcon name="plus" :size="16" />点位引领</button>
        <button type="button" class="route-settings-button" @click="openPublicConfig"><AppIcon name="filter" :size="16" />路线公共配置</button>
      </div>
    </header>

    <div class="route-map-columns">
      <section class="route-map-panel published" aria-label="已发布的路线">
        <h2>已发布的路线</h2>
        <div class="route-card-grid">
          <article v-for="item in publishedRoutes" :key="item.id" class="route-card" role="button" tabindex="0" :aria-label="`编辑路线${item.name}`" @click="openRoute(item)" @keydown.enter.self="openRoute(item)" @keydown.space.prevent.self="openRoute(item)">
            <div class="route-card-art" aria-hidden="true"><svg viewBox="0 0 92 92" fill="none"><path d="M20 25h47a13 13 0 0 1 0 26H28a13 13 0 0 0 0 26h44" stroke="url(#routeLine)" stroke-width="6" stroke-linecap="round"/><circle cx="20" cy="25" r="9" fill="#f5fbff" stroke="#4dbbe7" stroke-width="6"/><circle cx="72" cy="77" r="7" fill="#f5fbff" stroke="#62d0e8" stroke-width="5"/><defs><linearGradient id="routeLine" x1="20" y1="25" x2="72" y2="77"><stop stop-color="#3eb4e9"/><stop offset="1" stop-color="#6bd8e7"/></linearGradient></defs></svg></div>
            <div class="route-card-copy"><strong>{{ item.name }}</strong><small>{{ item.mapName }}</small><div class="route-card-actions"><button type="button" class="delete" @click.stop="deleteRoute(item)"><AppIcon name="trash" :size="12" />删除</button><button type="button" @click.stop="copyRoute(item)"><AppIcon name="copy" :size="12" />复制</button></div></div>
          </article>
          <p v-if="!publishedRoutes.length" class="route-empty">暂无已发布的路线</p>
        </div>
      </section>
      <section class="route-map-panel draft" aria-label="待发布的路线">
        <h2>待发布的路线</h2>
        <div class="route-card-grid">
          <article v-for="item in draftRoutes" :key="item.id" class="route-card" role="button" tabindex="0" :aria-label="`编辑路线${item.name}`" @click="openRoute(item)" @keydown.enter.self="openRoute(item)" @keydown.space.prevent.self="openRoute(item)">
            <div class="route-card-art" aria-hidden="true"><svg viewBox="0 0 92 92" fill="none"><path d="M20 25h47a13 13 0 0 1 0 26H28a13 13 0 0 0 0 26h44" stroke="#80ccef" stroke-width="6" stroke-linecap="round"/><circle cx="20" cy="25" r="9" fill="#f5fbff" stroke="#4dbbe7" stroke-width="6"/><circle cx="72" cy="77" r="7" fill="#f5fbff" stroke="#62d0e8" stroke-width="5"/></svg></div>
            <div class="route-card-copy"><strong>{{ item.name }}</strong><small>{{ item.mapName }} · {{ item.type }}</small><div class="route-card-actions"><button type="button" class="delete" @click.stop="deleteRoute(item)"><AppIcon name="trash" :size="12" />删除</button><button type="button" @click.stop="copyRoute(item)"><AppIcon name="copy" :size="12" />复制</button></div></div>
          </article>
          <p v-if="!draftRoutes.length" class="route-empty">暂无待发布的路线</p>
        </div>
      </section>
    </div>

    <div v-if="modalMode" class="route-modal-backdrop" @click.self="closeModal">
      <div class="route-modal" :class="{ 'route-config-modal': modalMode === 'config' }" role="dialog" aria-modal="true" :aria-label="modalMode === 'create' ? `新增${formType}` : modalMode === 'config' ? '路线公共配置' : '路线详情'">
        <div class="route-modal-heading"><h3>{{ modalMode === 'create' ? `新增${formType}` : modalMode === 'config' ? '通用配置' : currentRoute?.name }}</h3><button type="button" aria-label="关闭" @click="closeModal"><AppIcon name="close" :size="19" /></button></div>
        <form v-if="modalMode === 'create'" class="route-modal-form" @submit.prevent="createRoute">
          <label>路线名称<input v-model.trim="formName" required maxlength="60" placeholder="请输入路线名称" /></label>
          <label>所属地图<select v-model="formMap" required><option v-for="name in availableMaps" :key="name">{{ name }}</option></select></label>
          <p>创建后路线进入「待发布的路线」，可在路线详情中发布。</p>
          <div class="route-modal-actions"><button type="button" @click="closeModal">取消</button><button type="submit" class="primary">确认创建</button></div>
        </form>
        <div v-else-if="modalMode === 'config'" class="route-public-config">
          <section class="route-config-section">
            <div class="route-config-label"><span>*</span>让路提示语</div>
            <div class="route-config-toggle-line">
              <label><input v-model="publicConfig.yieldPromptEnabled" type="radio" :value="true" />开</label>
              <label><input v-model="publicConfig.yieldPromptEnabled" type="radio" :value="false" />关</label>
              <small><AppIcon name="info" :size="13" />数字人遇到障碍时会提醒您</small>
            </div>
            <div class="route-config-prompt-wrap"><input v-model="publicConfig.yieldPrompt" type="text" maxlength="50" :disabled="!publicConfig.yieldPromptEnabled" aria-label="让路提示语文案" placeholder="请输入让路提示语" /><span>{{ publicConfig.yieldPrompt.length }} / 50</span></div>
          </section>
          <section class="route-config-section route-voice-section">
            <div class="route-config-label">语音指令 <small><AppIcon name="info" :size="13" />导览模式中，您可以通过指令、语音控制</small></div>
            <div class="route-config-voice-grid">
              <label>暂停<input v-model="publicConfig.pauseCommand" maxlength="30" placeholder="请输入暂停指令" /></label>
              <label>下一站<input v-model="publicConfig.nextCommand" maxlength="30" placeholder="请输入下一站指令" /></label>
              <label>结束<input v-model="publicConfig.endCommand" maxlength="30" placeholder="请输入结束指令" /></label>
              <label>继续<input v-model="publicConfig.resumeCommand" maxlength="30" placeholder="请输入继续指令" /></label>
            </div>
          </section>
          <p v-if="publicConfigError" class="route-config-error" role="alert">{{ publicConfigError }}</p>
          <div class="route-modal-actions"><button type="button" @click="closeModal">取消</button><button type="button" class="primary" @click="savePublicConfig">确认</button></div>
        </div>
        <div v-else-if="currentRoute" class="route-detail-content"><dl><div><dt>路线名称</dt><dd>{{ currentRoute.name }}</dd></div><div><dt>所属地图</dt><dd>{{ currentRoute.mapName }}</dd></div><div><dt>路线类型</dt><dd>{{ currentRoute.type }}</dd></div><div><dt>发布状态</dt><dd>{{ currentRoute.status === 'published' ? '已发布' : '待发布' }}</dd></div></dl><div class="route-modal-actions"><button type="button" @click="closeModal">关闭</button><button type="button" class="primary" @click="togglePublish">{{ currentRoute.status === 'published' ? '取消发布' : '发布路线' }}</button></div></div>
      </div>
    </div>
    <Transition name="fade"><div v-if="notice" class="route-notice" role="status"><AppIcon name="check" :size="16" />{{ notice }}</div></Transition>
  </div>
</template>

<style scoped>
.route-map-page { min-width: 0; margin: -36px; padding: 22px 18px 28px; color: #173052; background: #fff; min-height: calc(100vh - 72px); }
.route-map-toolbar, .route-toolbar-actions, .route-card-actions, .route-modal-heading, .route-modal-actions { display: flex; align-items: center; }
.route-map-toolbar { gap: 14px; margin-bottom: 20px; }
.route-back-button { display: grid; place-items: center; flex: 0 0 34px; width: 34px; height: 34px; border: 0; border-radius: 50%; color: #fff; background: #3267fb; cursor: pointer; transform: rotate(180deg); }
.route-device-label { min-width: 0; color: #8292ab; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.route-toolbar-actions { gap: 9px; margin-left: auto; }
.route-toolbar-actions select { width: 245px; height: 34px; padding: 0 11px; color: #9aa8bd; border: 1px solid #d8deeb; border-radius: 5px; background: #fff; font-size: 12px; }
.route-toolbar-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; height: 34px; padding: 0 12px; border-radius: 5px; white-space: nowrap; font-size: 12px; font-weight: 600; cursor: pointer; }
.route-outline-button { color: #3568fa; border: 1px solid #89a4ff; background: #f2f6ff; }
.route-primary-button { color: #fff; border: 1px solid #3568fa; background: #3568fa; }
.route-settings-button { color: #fff; border: 1px solid #8e929b; background: #8e929b; }
.route-map-columns { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 26px; }
.route-map-panel { position: relative; min-width: 0; min-height: 755px; padding: 23px 24px; overflow: hidden; border-radius: 17px 17px 0 0; background: #f6fbff; }
.route-map-panel::before { content: ''; position: absolute; inset: 0 0 auto; height: 168px; pointer-events: none; background: repeating-radial-gradient(ellipse 115% 120% at 58% -55%, transparent 0, transparent 17px, #ffffff7d 18px, transparent 22px); opacity: .8; }
.route-map-panel.published { background: linear-gradient(180deg, #e9f3ff 0, #f6fbff 230px, #f7fbff 100%); }
.route-map-panel.draft { background: linear-gradient(180deg, #e7e8ff 0, #f6f8ff 230px, #f7faff 100%); }
.route-map-panel h2 { position: relative; margin: 0 0 20px; font-size: 15px; font-weight: 500; }
.route-card-grid { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-content: start; gap: 17px 14px; }
.route-card { display: grid; grid-template-columns: 108px minmax(0, 1fr); min-height: 104px; border: 1px solid #e2edff; border-radius: 15px; background: #ffffffd9; cursor: pointer; transition: transform .2s, box-shadow .2s; }
.route-card:hover { transform: translateY(-2px); box-shadow: 0 8px 18px #9fc5ec35; }
.route-card:focus-visible { outline: 2px solid #3568fa; outline-offset: 2px; }
.route-card-art { display: grid; place-items: center; margin: -1px 0 -1px -1px; border: 1px solid #e2edff; border-radius: 15px; background: #f8fcff; box-shadow: 0 3px 8px #b5cce770; }
.route-card-art svg { width: 78px; height: 78px; }
.route-card-copy { display: flex; flex-direction: column; justify-content: center; min-width: 0; padding: 11px 11px 10px 16px; }
.route-card-copy strong { color: #143052; font-size: 13px; font-weight: 500; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.route-card-copy small { margin-top: 5px; color: #a0b0c8; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.route-card-actions { gap: 5px; margin-top: 7px; }
.route-card-actions button { display: inline-flex; align-items: center; gap: 4px; height: 24px; padding: 0 8px; color: #316afc; border: 1px solid #d6e2ff; border-radius: 99px; background: #fff; font-size: 11px; cursor: pointer; }
.route-card-actions button.delete { color: #f17a67; border-color: #ffddd8; }
.route-empty { grid-column: 1 / -1; margin: 15px 0; color: #a7b4c9; font-size: 13px; }
.route-modal-backdrop { position: fixed; z-index: 130; inset: 0; display: grid; place-items: center; padding: 20px; background: #14234191; }
.route-modal { width: min(500px, 100%); max-height: calc(100vh - 40px); overflow-y: auto; padding: 25px; border-radius: 15px; background: #fff; box-shadow: 0 25px 70px #10203c5c; }
.route-config-modal { width: min(575px, 100%); padding: 15px 16px 20px; border-radius: 5px; }
.route-modal-heading { justify-content: space-between; margin-bottom: 20px; }
.route-modal-heading h3 { margin: 0; font-size: 19px; }
.route-modal-heading button { padding: 5px; color: #8c99ac; border: 0; background: transparent; cursor: pointer; }
.route-config-modal .route-modal-heading { margin-bottom: 36px; }
.route-config-modal .route-modal-heading h3 { font-size: 17px; font-weight: 500; }
.route-public-config { padding: 0 20px; }
.route-config-section { margin-bottom: 30px; }
.route-config-label { display: flex; align-items: center; gap: 2px; margin-bottom: 12px; color: #5d6169; font-size: 12px; }
.route-config-label > span { color: #eb6361; }
.route-config-label small, .route-config-toggle-line small { display: inline-flex; align-items: center; gap: 4px; color: #f3a500; font-size: 11px; font-weight: 500; }
.route-config-label small { margin-left: 10px; }
.route-config-toggle-line { display: flex; align-items: center; gap: 28px; min-height: 20px; margin-bottom: 18px; }
.route-config-toggle-line label { display: inline-flex; align-items: center; gap: 7px; color: #5c606a; font-size: 12px; cursor: pointer; }
.route-config-toggle-line label:has(input:checked) { color: #3568fa; }
.route-config-toggle-line input { margin: 0; accent-color: #3568fa; }
.route-config-toggle-line small { margin-left: -8px; }
.route-config-prompt-wrap { position: relative; }
.route-config-prompt-wrap input, .route-config-voice-grid input { width: 100%; height: 33px; padding: 0 11px; border: 1px solid #d8e0ec; border-radius: 4px; outline: 0; background: #fff; color: #5f6672; font-size: 12px; }
.route-config-prompt-wrap input { padding-right: 66px; }
.route-config-prompt-wrap input:disabled { background: #f4f6fa; color: #9ba7b6; }
.route-config-prompt-wrap span { position: absolute; top: 50%; right: 10px; color: #9ca9ba; font-size: 11px; transform: translateY(-50%); }
.route-config-voice-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px 24px; }
.route-config-voice-grid label { display: grid; gap: 11px; color: #5d6169; font-size: 12px; }
.route-config-error { margin: -10px 0 15px; color: #d65359; font-size: 12px; }
.route-public-config .route-modal-actions { margin-top: 64px; }
.route-modal-form { display: grid; gap: 15px; }
.route-modal-form label { display: grid; gap: 7px; color: #586b86; font-size: 12px; font-weight: 600; }
.route-modal-form input:not([type=checkbox]), .route-modal-form select { height: 40px; padding: 0 11px; border: 1px solid #dae4f3; border-radius: 8px; background: #fbfdff; color: #263c5e; font: inherit; font-weight: 400; }
.route-modal-form p { margin: 0; color: #93a3b9; font-size: 12px; line-height: 1.6; }
.route-modal-form label.route-check-option { display: flex; align-items: center; gap: 9px; }
.route-check-option input { accent-color: #3568fa; }
.route-detail-content dl { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 0; }
.route-detail-content dt { color: #99a8bc; font-size: 11px; }
.route-detail-content dd { margin: 5px 0 0; color: #2b4163; font-size: 13px; }
.route-modal-actions { justify-content: flex-end; gap: 9px; margin-top: 12px; }
.route-modal-actions button { min-height: 36px; padding: 0 14px; color: #5b6d89; border: 1px solid #dce5f2; border-radius: 7px; background: #fff; font-size: 12px; cursor: pointer; }
.route-modal-actions button.primary { color: #fff; border-color: #3568fa; background: #3568fa; }
.route-notice { position: fixed; z-index: 150; right: 28px; bottom: 28px; display: flex; align-items: center; gap: 8px; padding: 12px 15px; border-radius: 9px; color: #fff; background: #354765; box-shadow: 0 10px 25px #14234140; font-size: 12px; }
@media (max-width: 1180px) { .route-card-grid { grid-template-columns: 1fr; } .route-map-panel { min-height: 650px; } }
@media (max-width: 1000px) { .route-map-toolbar { flex-wrap: wrap; } .route-toolbar-actions { width: 100%; flex-wrap: wrap; margin-left: 0; } .route-map-columns { grid-template-columns: 1fr; } .route-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .route-map-panel { min-height: 330px; } }
@media (max-width: 650px) { .route-map-page { margin: -20px; padding: 18px 12px; } .route-toolbar-actions select { width: 100%; } .route-card-grid { grid-template-columns: 1fr; } .route-map-panel { padding: 18px 14px; } }
@media (max-width: 650px) { .route-public-config { padding: 0 6px; } .route-config-voice-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; } .route-config-toggle-line { flex-wrap: wrap; gap: 12px; } .route-config-toggle-line small { margin-left: 0; } }
</style>
