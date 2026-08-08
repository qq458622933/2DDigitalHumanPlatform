<script setup>
import { computed, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'

const digitalHumanEditions = ref(['2D在线版', '2D本地版', '数字人定制版'])
const activeDigitalHumanEdition = ref('2D在线版')

function createSoftwareList(versions = {}) {
  return [
    { key: 'guardian', name: '守护程序', subtitle: '负责进程守护、异常拉起与运行监控', version: versions.guardian || '待上传', updatedAt: versions.guardian ? '2026-08-05 10:28:16' : '尚未上传', updatedAgo: versions.guardian ? '3天前' : '尚未上传', icon: 'check', tone: 'blue' },
    { key: 'controller', name: '主控程序', subtitle: '负责数字人服务调度与设备控制', version: versions.controller || '待上传', updatedAt: versions.controller ? '2026-08-05 10:16:42' : '尚未上传', updatedAgo: versions.controller ? '3天前' : '尚未上传', icon: 'server', tone: 'cyan' },
    { key: 'frontend', name: '前端程序', subtitle: '负责本地数字人交互界面与内容展示', version: versions.frontend || '待上传', updatedAt: versions.frontend ? '2026-08-05 09:52:08' : '尚未上传', updatedAgo: versions.frontend ? '3天前' : '尚未上传', icon: 'layers', tone: 'violet' },
  ]
}

const editionSoftwareMap = ref({
  '2D在线版': createSoftwareList({ guardian: 'V1.0.8', controller: 'V2.3.1', frontend: 'V1.6.4' }),
  '2D本地版': createSoftwareList({ guardian: 'V1.0.5', controller: 'V2.1.8', frontend: 'V1.5.2' }),
  '数字人定制版': createSoftwareList({ guardian: 'V0.9.6', controller: 'V1.8.3', frontend: 'V1.2.7' }),
})

const softwareList = computed(() => editionSoftwareMap.value[activeDigitalHumanEdition.value] || [])

const updateRecords = ref([
  { id: 1, edition: '2D在线版', softwareKey: 'frontend', software: '前端程序', version: 'V1.6.4', time: '2026-08-05 09:52:08', file: 'digital-human-web-v1.6.4.zip', size: '46.8 MB', operator: 'admin', note: '优化数字人交互页面与资源加载速度。', published: true },
  { id: 2, edition: '2D在线版', softwareKey: 'controller', software: '主控程序', version: 'V2.3.1', time: '2026-08-05 10:16:42', file: 'digital-human-controller-v2.3.1.zip', size: '128.5 MB', operator: 'admin', note: '提升设备调度稳定性，新增资源状态检测。', published: true },
  { id: 3, edition: '2D在线版', softwareKey: 'guardian', software: '守护程序', version: 'V1.0.8', time: '2026-08-05 10:28:16', file: 'digital-human-guardian-v1.0.8.zip', size: '32.4 MB', operator: 'admin', note: '修复异常退出后未及时拉起的问题。', published: true },
  { id: 4, edition: '2D在线版', softwareKey: 'frontend', software: '前端程序', version: 'V1.6.3', time: '2026-07-28 14:22:36', file: 'digital-human-web-v1.6.3.zip', size: '45.9 MB', operator: 'admin', note: '更新交互配置页面。' },
])

const activeSoftware = ref('all')
const addEditionOpen = ref(false)
const newEditionName = ref('')
const publishOpen = ref(false)
const publishSoftwareKey = ref('')
const publishVersion = ref('')
const publishNote = ref('')
const uploadOpen = ref(false)
const uploadingSoftwareKey = ref('')
const uploadVersion = ref('')
const uploadFile = ref(null)
const uploadInput = ref(null)
const releaseNote = ref('')
const toastVisible = ref(false)
const toastMessage = ref('')

const uploadingSoftware = computed(() => softwareList.value.find((item) => item.key === uploadingSoftwareKey.value))
const uploadedSoftwareCount = computed(() => softwareList.value.filter((item) => item.version !== '待上传').length)
const publishVersionOptions = computed(() => [...new Set(updateRecords.value
  .filter((record) => record.edition === activeDigitalHumanEdition.value && record.softwareKey === publishSoftwareKey.value)
  .map((record) => record.version))])
const filteredRecords = computed(() => updateRecords.value.filter((record) => {
  const matchesEdition = record.edition === activeDigitalHumanEdition.value
  const matchesSoftware = activeSoftware.value === 'all' || record.softwareKey === activeSoftware.value
  return matchesEdition && matchesSoftware
}))

function openUpload(software = null) {
  uploadingSoftwareKey.value = software?.key || ''
  uploadVersion.value = ''
  uploadFile.value = null
  releaseNote.value = ''
  uploadOpen.value = true
}

function closeUpload() {
  uploadOpen.value = false
  uploadingSoftwareKey.value = ''
  uploadVersion.value = ''
  uploadFile.value = null
  releaseNote.value = ''
  if (uploadInput.value) uploadInput.value.value = ''
}

function handleUploadFile(event) {
  uploadFile.value = event.target.files?.[0] || null
}

function clearUploadFile() {
  uploadFile.value = null
  if (uploadInput.value) uploadInput.value.value = ''
}

function openAddEdition() {
  newEditionName.value = ''
  addEditionOpen.value = true
}

function closeAddEdition() {
  addEditionOpen.value = false
  newEditionName.value = ''
}

function submitAddEdition() {
  const name = newEditionName.value.trim()
  if (!name) return
  if (digitalHumanEditions.value.includes(name)) {
    showToast('该数字人版本已存在')
    return
  }
  digitalHumanEditions.value.push(name)
  editionSoftwareMap.value[name] = createSoftwareList()
  activeDigitalHumanEdition.value = name
  activeSoftware.value = 'all'
  closeAddEdition()
  showToast(`已新增“${name}”，请上传三个程序的软件包`)
}

function openPublish() {
  publishSoftwareKey.value = ''
  publishVersion.value = ''
  publishNote.value = ''
  publishOpen.value = true
}

function closePublish() {
  publishOpen.value = false
  publishSoftwareKey.value = ''
  publishVersion.value = ''
  publishNote.value = ''
}

function selectPublishSoftware() {
  publishVersion.value = ''
}

function submitPublish() {
  const software = softwareList.value.find((item) => item.key === publishSoftwareKey.value)
  if (!software || !publishVersion.value) return
  const version = publishVersion.value
  const publishedAt = formatNow()
  updateRecords.value.forEach((record) => {
    if (record.edition === activeDigitalHumanEdition.value && record.softwareKey === publishSoftwareKey.value) record.published = false
  })
  const record = updateRecords.value.find((item) => item.edition === activeDigitalHumanEdition.value && item.softwareKey === publishSoftwareKey.value && item.version === publishVersion.value)
  if (record) {
    record.published = true
    record.publishedAt = publishedAt
    record.publishNote = publishNote.value.trim()
  }
  closePublish()
  showToast(`${software.name} ${version} 已发布`)
}

function formatNow() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

function submitUpload() {
  const software = uploadingSoftware.value
  if (!software || !uploadFile.value) return
  const version = uploadVersion.value.trim().toUpperCase().startsWith('V')
    ? uploadVersion.value.trim().toUpperCase()
    : `V${uploadVersion.value.trim()}`
  const time = formatNow()
  software.version = version
  software.updatedAt = time
  software.updatedAgo = '刚刚'
  updateRecords.value.unshift({
    id: Date.now(),
    edition: activeDigitalHumanEdition.value,
    softwareKey: software.key,
    software: software.name,
    version,
    time,
    file: uploadFile.value.name,
    size: `${(uploadFile.value.size / 1024 / 1024).toFixed(1)} MB`,
    operator: 'admin',
    note: releaseNote.value.trim() || '版本更新。',
    published: false,
  })
  closeUpload()
  showToast(`${software.name} ${version} 上传成功`)
}

function showToast(message) {
  toastMessage.value = message
  toastVisible.value = true
  window.setTimeout(() => { toastVisible.value = false }, 2600)
}
</script>

<template>
  <div class="version-management-page">
    <section class="version-hero">
      <div>
        <div class="eyebrow"><span></span>VERSION CONTROL</div>
        <div class="version-title-row">
          <h1>版本管理概览</h1>
          <div class="digital-human-edition-controls">
            <label class="digital-human-edition-select">
              <AppIcon name="layers" :size="15" />
              <select v-model="activeDigitalHumanEdition" aria-label="数字人版本选择">
                <option v-for="edition in digitalHumanEditions" :key="edition">{{ edition }}</option>
              </select>
              <AppIcon name="chevron-down" :size="14" />
            </label>
            <button type="button" class="add-digital-human-edition-button" @click="openAddEdition"><AppIcon name="plus" :size="15" />添加数字人版本</button>
          </div>
        </div>
        <p>管理和部署系统各模块的软件版本更新</p>
      </div>
      <div class="version-hero-decoration"><AppIcon name="layers" :size="52" /></div>
    </section>

    <section class="software-version-grid" aria-label="软件版本概览">
      <article v-for="software in softwareList" :key="software.key" class="software-version-card" :class="software.tone">
        <div class="software-version-icon"><AppIcon :name="software.icon" :size="25" /></div>
        <div class="software-version-heading">
          <div><h2>{{ software.name }}</h2><p>{{ software.subtitle }}</p></div>
          <span>当前版本</span>
        </div>
        <strong class="software-current-version">{{ software.version }}</strong>
        <div class="software-version-meta">
          <span><AppIcon name="clock" :size="14" />最近更新：{{ software.updatedAgo }}</span>
          <span>{{ software.updatedAt }}</span>
        </div>
      </article>
    </section>

    <section class="version-package-progress" :class="{ complete: uploadedSoftwareCount === softwareList.length }">
      <AppIcon :name="uploadedSoftwareCount === softwareList.length ? 'check' : 'info'" :size="18" />
      <div><strong>{{ activeDigitalHumanEdition }} 软件包完整度：{{ uploadedSoftwareCount }}/{{ softwareList.length }}</strong><span>{{ uploadedSoftwareCount === softwareList.length ? '守护程序、主控程序和前端程序均已上传。' : '该数字人版本需要分别上传守护程序、主控程序和前端程序。' }}</span></div>
    </section>

    <section class="version-history-card">
      <div class="version-upload-toolbar">
        <button type="button" class="publish-version-button" @click="openPublish"><AppIcon name="check" :size="16" />版本发布</button>
        <button type="button" @click="openUpload()"><AppIcon name="upload" :size="16" />上传程序包</button>
      </div>
      <div class="version-history-header">
        <div><h2>最近更新记录</h2><p>查看三个软件的历史上传版本</p></div>
        <div class="version-software-filters" role="tablist" aria-label="软件类型筛选">
          <button v-for="item in [{ key: 'all', name: '全部软件' }, ...softwareList]" :key="item.key" type="button" :class="{ active: activeSoftware === item.key }" @click="activeSoftware = item.key">{{ item.name }}</button>
        </div>
      </div>
      <div class="version-timeline">
        <article v-for="record in filteredRecords" :key="record.id" class="version-timeline-item">
          <time>{{ record.time }}</time>
          <span class="version-timeline-node"></span>
          <div class="version-record-content">
            <div class="version-record-title"><span>{{ record.version }}</span><strong>{{ record.software }}</strong><em v-if="record.published">已发布</em></div>
            <p>{{ record.note }}</p>
            <div class="version-record-meta"><span><AppIcon name="file" :size="13" />{{ record.file }}</span><span>{{ record.size }}</span><span><AppIcon name="user" :size="13" />{{ record.operator }}</span></div>
          </div>
        </article>
        <div v-if="!filteredRecords.length" class="empty-state"><AppIcon name="layers" :size="30" /><strong>暂无更新记录</strong></div>
      </div>
    </section>

    <Transition name="fade">
      <div v-if="publishOpen" class="modal-backdrop" @click.self="closePublish">
        <div class="modal-card version-publish-modal" role="dialog" aria-modal="true" aria-label="版本发布">
          <button class="modal-close" aria-label="关闭" @click="closePublish"><AppIcon name="close" /></button>
          <div class="modal-icon"><AppIcon name="check" :size="25" /></div>
          <h3>版本发布</h3>
          <p>从 {{ activeDigitalHumanEdition }} 已上传的软件版本中选择需要发布的版本。</p>
          <form @submit.prevent="submitPublish">
            <label for="publish-software-type">程序类型</label>
            <select id="publish-software-type" v-model="publishSoftwareKey" required @change="selectPublishSoftware">
              <option value="" disabled>请选择程序类型</option>
              <option v-for="software in softwareList" :key="software.key" :value="software.key">{{ software.name }}</option>
            </select>
            <label for="publish-software-version">发布版本</label>
            <select id="publish-software-version" v-model="publishVersion" required :disabled="!publishSoftwareKey || !publishVersionOptions.length">
              <option value="" disabled>{{ publishSoftwareKey && !publishVersionOptions.length ? '该程序暂无已上传版本' : '请选择需要发布的版本' }}</option>
              <option v-for="version in publishVersionOptions" :key="version" :value="version">{{ version }}</option>
            </select>
            <label for="publish-version-note">发布说明 <span>选填</span></label>
            <textarea id="publish-version-note" v-model.trim="publishNote" rows="4" maxlength="300" placeholder="请输入发布范围或注意事项"></textarea>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="closePublish">取消</button><button type="submit" class="primary-button">确认发布</button></div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="addEditionOpen" class="modal-backdrop" @click.self="closeAddEdition">
        <div class="modal-card add-edition-modal" role="dialog" aria-modal="true" aria-label="添加数字人版本">
          <button class="modal-close" aria-label="关闭" @click="closeAddEdition"><AppIcon name="close" /></button>
          <div class="modal-icon"><AppIcon name="layers" :size="25" /></div>
          <h3>添加数字人版本</h3>
          <p>新增后将自动切换到该版本，三个程序的软件包均为待上传状态。</p>
          <form @submit.prevent="submitAddEdition">
            <label for="new-digital-human-edition">版本名称</label>
            <input id="new-digital-human-edition" v-model.trim="newEditionName" maxlength="30" required autofocus placeholder="请输入版本名称，例如 行业专用版" />
            <div class="modal-actions"><button type="button" class="secondary-button" @click="closeAddEdition">取消</button><button type="submit" class="primary-button">确认添加</button></div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="uploadOpen" class="modal-backdrop" @click.self="closeUpload">
        <div class="modal-card version-upload-modal" role="dialog" aria-modal="true" aria-label="上传程序包">
          <button class="modal-close" aria-label="关闭" @click="closeUpload"><AppIcon name="close" /></button>
          <div class="modal-icon"><AppIcon name="upload" :size="25" /></div>
          <h3>上传程序包</h3>
          <p>{{ uploadingSoftware ? `${uploadingSoftware.name}当前版本为 ${uploadingSoftware.version}，新版本仅更新当前软件。` : '选择需要更新的软件并上传对应的独立版本。' }}</p>
          <form @submit.prevent="submitUpload">
            <label for="software-upload-target">软件类型</label>
            <select id="software-upload-target" v-model="uploadingSoftwareKey" required>
              <option value="" disabled>请选择需要更新的软件</option>
              <option v-for="software in softwareList" :key="software.key" :value="software.key">{{ software.name }}（当前 {{ software.version }}）</option>
            </select>
            <label for="software-version-number">版本号</label>
            <input id="software-version-number" v-model.trim="uploadVersion" required pattern="[vV]?\d+(\.\d+){1,3}" placeholder="例如 V1.2.0" />
            <label>软件安装包</label>
            <label class="video-upload" :class="{ 'has-file': uploadFile }">
              <input ref="uploadInput" type="file" accept=".zip,application/zip" required @change="handleUploadFile" />
              <span class="upload-icon"><AppIcon :name="uploadFile ? 'check' : 'upload'" :size="22" /></span>
              <span class="upload-copy"><strong>{{ uploadFile ? uploadFile.name : '点击上传程序包安装包' }}</strong><small>{{ uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB` : '仅支持 ZIP 格式文件' }}</small></span>
              <button v-if="uploadFile" type="button" class="upload-remove" aria-label="移除安装包" @click.prevent="clearUploadFile"><AppIcon name="close" :size="16" /></button>
              <span v-else class="upload-action">选择文件</span>
            </label>
            <label for="software-release-note">更新说明</label>
            <textarea id="software-release-note" v-model.trim="releaseNote" rows="4" maxlength="300" required placeholder="请输入本次版本更新内容"></textarea>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="closeUpload">取消</button><button type="submit" class="primary-button">确认上传</button></div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="toast"><div v-if="toastVisible" class="toast-message"><AppIcon name="check" :size="19" />{{ toastMessage }}</div></Transition>
  </div>
</template>
