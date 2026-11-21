<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { userAgentResources } from '../config/userResources'

const keyword = ref('')
const modalOpen = ref(false)
const editingId = ref('')
const showApiKey = ref(false)
const formError = ref('')
const notice = ref('')
const draft = ref(createEmptyDraft())
let noticeTimer

const filteredResources = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return userAgentResources.value
  return userAgentResources.value.filter((resource) =>
    [resource.name, resource.baseUrl, resource.model, resource.description]
      .some((value) => String(value || '').toLowerCase().includes(query)))
})

function createEmptyDraft() {
  return { name: '', baseUrl: '', apiKey: '', model: '', description: '' }
}

function showNotice(message) {
  notice.value = message
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => { notice.value = '' }, 3000)
}

function openCreate() {
  editingId.value = ''
  draft.value = createEmptyDraft()
  showApiKey.value = false
  formError.value = ''
  modalOpen.value = true
}

function openEdit(resource) {
  editingId.value = resource.id
  draft.value = {
    name: resource.name,
    baseUrl: resource.baseUrl,
    apiKey: resource.apiKey,
    model: resource.model,
    description: resource.description || '',
  }
  showApiKey.value = false
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingId.value = ''
  draft.value = createEmptyDraft()
  showApiKey.value = false
  formError.value = ''
}

function saveResource() {
  const values = Object.fromEntries(
    Object.entries(draft.value).map(([key, value]) => [key, value.trim()]),
  )
  let serviceUrl
  try {
    serviceUrl = new URL(values.baseUrl)
  } catch {
    formError.value = '请输入有效的 HTTP 或 HTTPS 服务地址'
    return
  }
  if (!['http:', 'https:'].includes(serviceUrl.protocol) || !serviceUrl.hostname) {
    formError.value = '服务地址必须以 http:// 或 https:// 开头'
    return
  }
  if (!values.name || !values.apiKey || !values.model) {
    formError.value = '请填写资源名称、API Key 和模型名称'
    return
  }

  if (editingId.value) {
    const index = userAgentResources.value.findIndex((resource) => resource.id === editingId.value)
    if (index < 0) return
    userAgentResources.value[index] = { ...userAgentResources.value[index], ...values }
    closeModal()
    showNotice('第三方智能体资源已更新')
    return
  }

  userAgentResources.value.unshift({
    id: globalThis.crypto?.randomUUID?.() || `agent-resource-${Date.now()}`,
    ...values,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  })
  closeModal()
  showNotice('第三方智能体资源已添加')
}

function deleteResource(resource) {
  if (!window.confirm(`确定删除资源“${resource.name}”吗？`)) return
  userAgentResources.value = userAgentResources.value.filter((item) => item.id !== resource.id)
  showNotice('第三方智能体资源已删除')
}

onBeforeUnmount(() => window.clearTimeout(noticeTimer))
</script>

<template>
  <div class="user-resources-page" style="--accent: #5f73e8">
    <header class="user-resources-heading">
      <div>
        <div class="user-resources-eyebrow"><span></span> USER RESOURCES</div>
        <h1>用户资源</h1>
        <p>管理第三方智能体的服务地址、访问密钥和模型配置。</p>
      </div>
      <button type="button" class="user-resources-primary" @click="openCreate">
        <AppIcon name="plus" :size="17" />添加资源
      </button>
    </header>

    <section class="user-resources-card">
      <div class="user-resources-toolbar">
        <div><h2>第三方智能体资源</h2><p>共 {{ userAgentResources.length }} 条资源</p></div>
        <label class="user-resources-search">
          <AppIcon name="search" :size="17" />
          <input v-model="keyword" type="search" aria-label="搜索用户资源" placeholder="搜索资源名称、地址或模型" />
        </label>
      </div>
      <div v-if="filteredResources.length" class="user-resources-table-scroll">
        <table class="user-resources-table">
          <thead><tr><th>资源名称</th><th>服务地址</th><th>模型</th><th>API Key</th><th>创建时间</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="resource in filteredResources" :key="resource.id">
              <td><strong>{{ resource.name }} <em v-if="resource.isMock" class="user-resources-demo-tag">演示</em></strong><small v-if="resource.description">{{ resource.description }}</small></td>
              <td><span class="user-resources-url" :title="resource.baseUrl">{{ resource.baseUrl }}</span></td>
              <td>{{ resource.model }}</td>
              <td><span class="user-resources-masked">••••••••</span></td>
              <td>{{ resource.createdAt }}</td>
              <td><div class="user-resources-actions"><button type="button" @click="openEdit(resource)">编辑</button><button type="button" class="danger" @click="deleteResource(resource)">删除</button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="user-resources-empty">
        <AppIcon :name="keyword ? 'search' : 'bot'" :size="30" />
        <strong>{{ keyword ? '没有找到匹配的资源' : '还没有第三方智能体资源' }}</strong>
        <span>{{ keyword ? '试试其他搜索关键词' : '添加资源后即可在这里查看和管理' }}</span>
        <button v-if="!keyword" type="button" @click="openCreate">添加第一个资源</button>
      </div>
    </section>

    <p class="user-resources-note">当前为前端演示：初始包含 3 条模拟资源；新增和修改仅在本次页面会话中保留，刷新后恢复演示数据；尚未连接第三方服务。</p>
    <div v-if="notice" class="user-resources-notice" role="status">{{ notice }}</div>

    <div v-if="modalOpen" class="user-resources-backdrop" @click.self="closeModal">
      <div class="user-resources-modal" role="dialog" aria-modal="true" :aria-label="editingId ? '编辑第三方智能体资源' : '添加第三方智能体资源'" @keydown.esc="closeModal">
        <div class="user-resources-modal-heading">
          <div><span class="user-resources-modal-icon"><AppIcon name="bot" :size="21" /></span><div><h2>{{ editingId ? '编辑第三方智能体资源' : '添加第三方智能体资源' }}</h2><p>填写 Open API 服务的连接信息</p></div></div>
          <button type="button" aria-label="关闭" @click="closeModal"><AppIcon name="close" :size="19" /></button>
        </div>
        <form @submit.prevent="saveResource">
          <label for="user-resource-name">资源名称</label>
          <input id="user-resource-name" v-model="draft.name" autofocus required maxlength="50" placeholder="例如：客服智能体服务" />

          <label for="user-resource-url">服务地址 <span>HTTP 或 HTTPS</span></label>
          <input id="user-resource-url" v-model="draft.baseUrl" type="url" required pattern="https?://.+" placeholder="例如：https://api.example.com/v1" />

          <label for="user-resource-key">API Key</label>
          <div class="user-resources-key-field">
            <input id="user-resource-key" v-model="draft.apiKey" :type="showApiKey ? 'text' : 'password'" required autocomplete="off" placeholder="请输入第三方服务密钥" />
            <button type="button" :aria-label="showApiKey ? '隐藏密钥' : '显示密钥'" @click="showApiKey = !showApiKey"><AppIcon :name="showApiKey ? 'eye-off' : 'eye'" :size="17" /></button>
          </div>

          <label for="user-resource-model">模型名称</label>
          <input id="user-resource-model" v-model="draft.model" required placeholder="例如：qwen-plus" />

          <label for="user-resource-description">备注 <span>选填</span></label>
          <textarea id="user-resource-description" v-model="draft.description" rows="3" maxlength="200" placeholder="描述该资源的用途"></textarea>

          <p v-if="formError" class="user-resources-error" role="alert">{{ formError }}</p>
          <div class="user-resources-modal-actions"><button type="button" @click="closeModal">取消</button><button type="submit" class="primary">{{ editingId ? '保存修改' : '确认添加' }}</button></div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-resources-page { min-width: 0; padding-bottom: 14px; color: #353a4e; }
.user-resources-heading, .user-resources-toolbar, .user-resources-modal-heading, .user-resources-modal-heading > div, .user-resources-actions, .user-resources-modal-actions { display: flex; align-items: center; }
.user-resources-heading { justify-content: space-between; gap: 22px; margin-bottom: 27px; }
.user-resources-eyebrow { color: #6379d7; font-size: 10px; font-weight: 750; letter-spacing: .16em; }
.user-resources-eyebrow span { display: inline-block; width: 7px; height: 7px; margin-right: 7px; border-radius: 50%; background: #6f83e9; }
.user-resources-heading h1 { margin: 10px 0 7px; color: #252c40; font-size: 28px; }
.user-resources-heading p, .user-resources-toolbar p { margin: 0; color: #9199aa; font-size: 13px; }
.user-resources-primary, .user-resources-empty button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 40px; padding: 0 16px; border: 0; border-radius: 9px; background: #6379e7; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
.user-resources-card { overflow: hidden; border: 1px solid #e9edf4; border-radius: 16px; background: #fff; box-shadow: 0 12px 34px #283d660a; }
.user-resources-toolbar { justify-content: space-between; gap: 18px; padding: 20px 22px; border-bottom: 1px solid #edf0f5; }
.user-resources-toolbar h2 { margin: 0 0 4px; color: #30384e; font-size: 16px; }
.user-resources-search { display: flex; align-items: center; gap: 8px; width: min(300px, 100%); padding: 0 12px; border: 1px solid #e2e7ef; border-radius: 8px; color: #9aa5b5; }
.user-resources-search input { width: 100%; height: 38px; border: 0; outline: 0; background: transparent; color: #394254; font-size: 12px; }
.user-resources-table-scroll { overflow-x: auto; }
.user-resources-table { width: 100%; border-collapse: collapse; min-width: 840px; text-align: left; }
.user-resources-table th { padding: 13px 18px; background: #fafbfe; color: #8d97a7; font-size: 11px; font-weight: 650; white-space: nowrap; }
.user-resources-table td { padding: 17px 18px; border-top: 1px solid #f0f2f6; color: #667185; font-size: 12px; }
.user-resources-table td:first-child { min-width: 150px; }
.user-resources-table td strong, .user-resources-table td small { display: block; }
.user-resources-table td strong { color: #354158; font-size: 12px; }
.user-resources-demo-tag { margin-left: 5px; padding: 2px 5px; border-radius: 4px; background: #eef1ff; color: #6879c8; font-size: 10px; font-style: normal; font-weight: 600; }
.user-resources-table td small { max-width: 230px; margin-top: 4px; color: #a2aab8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-resources-url { display: block; max-width: 290px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-resources-masked { color: #8b92a2; letter-spacing: .12em; }
.user-resources-actions { gap: 9px; white-space: nowrap; }
.user-resources-actions button { padding: 6px 9px; border: 0; border-radius: 6px; background: #eff2ff; color: #6276d6; font-size: 11px; cursor: pointer; }
.user-resources-actions button.danger { background: #fff2f2; color: #d76a6a; }
.user-resources-empty { display: grid; justify-items: center; gap: 10px; padding: 74px 20px; color: #9aa6bb; }
.user-resources-empty strong { color: #4b5770; font-size: 14px; }
.user-resources-empty span { font-size: 12px; }
.user-resources-empty button { margin-top: 10px; }
.user-resources-note { margin: 14px 2px 0; color: #a0a8b6; font-size: 11px; }
.user-resources-notice { position: fixed; right: 28px; bottom: 28px; z-index: 140; padding: 12px 17px; border-radius: 9px; background: #333d54; color: #fff; box-shadow: 0 12px 32px #1b263c38; font-size: 12px; }
.user-resources-backdrop { position: fixed; z-index: 120; inset: 0; display: grid; place-items: center; padding: 20px; background: #17243a91; }
.user-resources-modal { width: min(530px, 100%); max-height: calc(100vh - 40px); overflow-y: auto; padding: 26px; border-radius: 16px; background: #fff; box-shadow: 0 26px 80px #101d3652; }
.user-resources-modal-heading { justify-content: space-between; margin-bottom: 22px; }
.user-resources-modal-heading > div { gap: 11px; }
.user-resources-modal-icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px; color: #6379e7; background: #eef1ff; }
.user-resources-modal-heading h2 { margin: 0 0 4px; color: #30384e; font-size: 18px; }
.user-resources-modal-heading p { margin: 0; color: #9da6b5; font-size: 11px; }
.user-resources-modal-heading > button { padding: 5px; border: 0; background: transparent; color: #919bab; cursor: pointer; }
.user-resources-modal form { display: grid; }
.user-resources-modal form > label { margin: 0 0 7px; color: #556075; font-size: 12px; font-weight: 650; }
.user-resources-modal form > label span { color: #a4acba; font-size: 11px; font-weight: 400; }
.user-resources-modal input, .user-resources-modal textarea { width: 100%; margin-bottom: 17px; padding: 10px 12px; border: 1px solid #e0e5ee; border-radius: 8px; outline: 0; background: #fbfcff; color: #354158; font: inherit; font-size: 12px; }
.user-resources-modal input:focus, .user-resources-modal textarea:focus { border-color: #8091ed; box-shadow: 0 0 0 3px #6379e719; }
.user-resources-key-field { position: relative; }
.user-resources-key-field input { padding-right: 42px; }
.user-resources-key-field button { position: absolute; top: 7px; right: 7px; display: grid; place-items: center; width: 28px; height: 28px; border: 0; background: transparent; color: #8b94a6; cursor: pointer; }
.user-resources-error { margin: -3px 0 15px; color: #cf565d; font-size: 11px; }
.user-resources-modal-actions { justify-content: flex-end; gap: 9px; margin-top: 3px; }
.user-resources-modal-actions button { min-height: 38px; padding: 0 16px; border: 1px solid #e2e7ef; border-radius: 8px; background: #fff; color: #667287; font-size: 12px; font-weight: 650; cursor: pointer; }
.user-resources-modal-actions button.primary { border-color: #6379e7; background: #6379e7; color: #fff; }
@media (max-width: 720px) {
  .user-resources-heading, .user-resources-toolbar { align-items: flex-start; flex-direction: column; }
  .user-resources-search { width: 100%; }
}
</style>
