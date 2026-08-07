<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { moduleData } from '../config/modules'

const router = useRouter()
const fileInput = ref(null)
const files = ref([])
const dragActive = ref(false)
const errorMessage = ref('')
const toastVisible = ref(false)

const allowedExtensions = ['XLS', 'VTT', 'XLSX', 'MD', 'HTML', 'PROPERTIES', 'MARKDOWN', 'PDF', 'MDX', 'TXT', 'DOCX', 'HTM', 'CSV']
const allowedExtensionSet = new Set(allowedExtensions.map((item) => item.toLowerCase()))
const maxFileSize = 15 * 1024 * 1024
const maxFiles = 5
const accept = allowedExtensions.map((item) => `.${item.toLowerCase()}`).join(',')

const totalSize = computed(() => files.value.reduce((total, item) => total + item.file.size, 0))

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function addFiles(fileList) {
  errorMessage.value = ''
  const incoming = Array.from(fileList || [])
  if (!incoming.length) return

  const remaining = maxFiles - files.value.length
  if (remaining <= 0) {
    errorMessage.value = '每批最多上传 5 个文件，请先移除部分文件'
    return
  }

  const messages = []
  incoming.slice(0, remaining).forEach((file) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const duplicated = files.value.some((item) => item.file.name === file.name && item.file.size === file.size)
    if (!allowedExtensionSet.has(extension)) {
      messages.push(`${file.name}：文件格式不支持`)
    } else if (file.size > maxFileSize) {
      messages.push(`${file.name}：文件大小超过 15 MB`)
    } else if (duplicated) {
      messages.push(`${file.name}：文件已添加`)
    } else {
      files.value.push({ id: `${file.name}-${file.size}-${file.lastModified}`, file, status: '待上传' })
    }
  })
  if (incoming.length > remaining) messages.push(`本批仅可再添加 ${remaining} 个文件`)
  errorMessage.value = messages.join('；')
  if (fileInput.value) fileInput.value.value = ''
}

function handleDrop(event) {
  dragActive.value = false
  addFiles(event.dataTransfer.files)
}

function removeFile(id) {
  files.value = files.value.filter((item) => item.id !== id)
  errorMessage.value = ''
}

function startUpload() {
  if (!files.value.length) {
    errorMessage.value = '请先选择需要上传的知识库文档'
    return
  }
  files.value.forEach((item) => { item.status = '上传成功' })
  toastVisible.value = true
  const knowledgeId = `KB-${Date.now()}`
  const createdAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-')
  const documents = files.value.map((item, index) => ({
    id: `${knowledgeId}-${index + 1}`,
    name: item.file.name,
    segmentMode: '通用',
    characterCount: Math.max(1, Math.round(item.file.size / 2)),
    fileSize: item.file.size,
    recallCount: 0,
    uploadedAt: createdAt,
    enabled: true,
  }))
  const totalCharacters = documents.reduce((total, document) => total + document.characterCount, 0)
  moduleData.knowledge.rows.unshift({
    name: files.value[0].file.name.replace(/\.[^.]+$/, ''),
    subtitle: knowledgeId,
    type: '自定义',
    extra: `${documents.length} 文档`,
    documentCount: documents.length,
    characterCount: totalCharacters,
    linkedApp: '暂无',
    creator: '何文斌',
    createdAt,
    date: '刚刚',
    status: '已启用',
    tone: 'blue',
    documents,
  })
  window.setTimeout(() => router.push({ name: 'knowledgeDetail', params: { knowledgeId } }), 650)
}
</script>

<template>
  <div class="knowledge-upload-page" style="--accent: #0ea5e9">
    <header class="knowledge-upload-header">
      <div class="detail-title-wrap">
        <button class="detail-back-button" aria-label="返回知识库列表" @click="router.push('/knowledge')"><AppIcon name="chevron" :size="19" /></button>
        <div>
          <div class="detail-breadcrumb">知识库 / 新建知识库</div>
          <h1>知识库文档上传</h1>
          <p>上传需要解析的文档，系统将自动提取内容并建立知识索引。</p>
        </div>
      </div>
      <div class="knowledge-upload-step"><span class="active">1</span><i></i><span>2</span><em>上传文档</em><em>完成创建</em></div>
    </header>

    <section class="knowledge-upload-card">
      <div class="knowledge-upload-card-heading">
        <div><strong>上传文档</strong><span>每批最多 5 个文件，每个文件不超过 15 MB</span></div>
        <span>{{ files.length }}/{{ maxFiles }}</span>
      </div>

      <label
        class="knowledge-drop-zone"
        :class="{ active: dragActive }"
        @dragenter.prevent="dragActive = true"
        @dragover.prevent="dragActive = true"
        @dragleave.prevent="dragActive = false"
        @drop.prevent="handleDrop"
      >
        <input ref="fileInput" type="file" :accept="accept" multiple @change="addFiles($event.target.files)" />
        <span class="knowledge-upload-icon"><AppIcon name="upload" :size="30" /></span>
        <strong>拖拽文档到此处，或点击选择文件</strong>
        <p>支持一次选择多个文件，系统会自动校验格式和大小</p>
        <em>选择文件</em>
      </label>

      <div class="knowledge-format-section">
        <strong>支持的文档格式</strong>
        <div><span v-for="format in allowedExtensions" :key="format">{{ format }}</span></div>
      </div>

      <div v-if="errorMessage" class="knowledge-upload-error"><AppIcon name="info" :size="16" />{{ errorMessage }}</div>

      <section v-if="files.length" class="knowledge-upload-list">
        <div class="knowledge-upload-list-heading"><strong>已选择文件</strong><span>总大小 {{ formatSize(totalSize) }}</span></div>
        <article v-for="item in files" :key="item.id">
          <span class="knowledge-file-icon"><AppIcon name="file" :size="19" /></span>
          <div><strong>{{ item.file.name }}</strong><small>{{ formatSize(item.file.size) }} · {{ item.file.name.split('.').pop()?.toUpperCase() }}</small></div>
          <span class="knowledge-file-status" :class="{ success: item.status === '上传成功' }"><i></i>{{ item.status }}</span>
          <button type="button" :aria-label="`移除${item.file.name}`" @click="removeFile(item.id)"><AppIcon name="trash" :size="15" /></button>
        </article>
      </section>

      <footer class="knowledge-upload-actions">
        <button type="button" class="secondary-button" @click="router.push('/knowledge')">取消</button>
        <button type="button" class="primary-button" :disabled="!files.length" @click="startUpload"><AppIcon name="upload" :size="16" />开始上传</button>
      </footer>
    </section>

    <Transition name="toast"><div v-if="toastVisible" class="toast-message"><AppIcon name="check" :size="19" />文档上传成功，知识库已创建</div></Transition>
  </div>
</template>
