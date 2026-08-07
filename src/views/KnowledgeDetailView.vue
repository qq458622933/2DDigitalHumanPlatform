<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { moduleData } from '../config/modules'

const route = useRoute()
const router = useRouter()
const importInput = ref(null)
const toastVisible = ref(false)
const toastMessage = ref('')

const knowledge = computed(() => (
  moduleData.knowledge.rows.find((item) => item.subtitle === route.params.knowledgeId)
  || moduleData.knowledge.rows[0]
))

if (!knowledge.value.documents) knowledge.value.documents = [{
  id: `${knowledge.value.subtitle}-1`,
  name: '产品介绍.docx',
  segmentMode: '通用',
  characterCount: knowledge.value.characterCount || 5593,
  fileSize: 15480,
  recallCount: 0,
  uploadedAt: knowledge.value.createdAt || '2026-08-06 14:03:47',
  enabled: true,
}]

const documents = ref(knowledge.value.documents)

const totalCharacters = computed(() => documents.value.reduce((total, document) => total + document.characterCount, 0))

function showToast(message) {
  toastMessage.value = message
  toastVisible.value = true
  window.setTimeout(() => { toastVisible.value = false }, 2400)
}

function importDocuments(event) {
  const files = Array.from(event.target.files || []).slice(0, 5)
  const createdAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-')
  files.forEach((file, index) => {
    documents.value.push({
      id: `${knowledge.value.subtitle}-${Date.now()}-${index}`,
      name: file.name,
      segmentMode: '通用',
      characterCount: Math.max(1, Math.round(file.size / 2)),
      fileSize: file.size,
      recallCount: 0,
      uploadedAt: createdAt,
      enabled: true,
    })
  })
  if (files.length) showToast(`已导入 ${files.length} 个文档`)
  event.target.value = ''
}

function toggleDocument(document) {
  document.enabled = !document.enabled
  showToast(document.enabled ? '文档已启用' : '文档已禁用')
}

function renameDocument(document) {
  const name = window.prompt('请输入新的文档名称', document.name)?.trim()
  if (!name) return
  document.name = name
  showToast('文档已重命名')
}

function removeDocument(id) {
  const index = documents.value.findIndex((document) => document.id === id)
  if (index !== -1) documents.value.splice(index, 1)
  showToast('文档已删除')
}

function openDocumentDetail(document) {
  router.push({ name: 'knowledgeDocumentDetail', params: { knowledgeId: knowledge.value.subtitle, documentId: document.id } })
}
</script>

<template>
  <div class="knowledge-detail-page" style="--accent: #0ea5e9">
    <aside class="knowledge-detail-sidebar">
      <button class="knowledge-detail-back" aria-label="返回知识库列表" @click="router.push('/knowledge')"><AppIcon name="chevron" :size="18" /></button>
      <section>
        <h2>知识库信息</h2>
        <dl>
          <div><dt>文档类型：</dt><dd>{{ knowledge.type || '自定义' }}</dd></div>
          <div><dt>文档总数：</dt><dd>{{ documents.length }}</dd></div>
          <div><dt>总字符数：</dt><dd>{{ totalCharacters }}字符</dd></div>
        </dl>
      </section>
      <section>
        <h2>关联数字人</h2>
        <p>{{ knowledge.linkedApp || '暂无' }}</p>
      </section>
    </aside>

    <main class="knowledge-detail-content">
      <header class="knowledge-detail-header">
        <div><div class="detail-breadcrumb">知识库 / {{ knowledge.subtitle }}</div><h1 :title="knowledge.name">{{ knowledge.name }}</h1><p>管理知识库文档和配置</p></div>
        <input ref="importInput" type="file" multiple hidden accept=".xls,.vtt,.xlsx,.md,.html,.properties,.markdown,.pdf,.mdx,.txt,.docx,.htm,.csv" @change="importDocuments" />
        <button class="primary-button" @click="importInput?.click()"><AppIcon name="upload" :size="16" />导入文档</button>
      </header>

      <section class="knowledge-document-card">
        <div class="knowledge-document-table-scroll">
          <table class="knowledge-document-table">
            <thead><tr><th>序号</th><th>名称</th><th>分段模式</th><th>字符数</th><th>召回次数</th><th>上传时间</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="(document, index) in documents" :key="document.id" class="knowledge-document-row" role="link" tabindex="0" @click="openDocumentDetail(document)" @keydown.enter="openDocumentDetail(document)">
                <td>{{ index + 1 }}</td>
                <td><strong :title="document.name">{{ document.name }}</strong></td>
                <td>{{ document.segmentMode }}</td>
                <td>{{ document.characterCount }}</td>
                <td>{{ document.recallCount }}</td>
                <td>{{ document.uploadedAt }}</td>
                <td><span class="document-status" :class="{ disabled: !document.enabled }"><i></i>{{ document.enabled ? '启用' : '禁用' }}</span></td>
                <td><div class="knowledge-document-actions"><button @click.stop="toggleDocument(document)">{{ document.enabled ? '禁用' : '启用' }}</button><button @click.stop="showToast('已打开分段设置')">分段设置</button><button @click.stop="renameDocument(document)">重命名</button><button class="danger" @click.stop="removeDocument(document.id)">删除</button></div></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!documents.length" class="empty-state"><AppIcon name="file" :size="30" /><strong>暂无文档</strong><span>点击右上角“导入文档”开始添加</span></div>
      </section>
    </main>

    <Transition name="toast"><div v-if="toastVisible" class="toast-message"><AppIcon name="check" :size="19" />{{ toastMessage }}</div></Transition>
  </div>
</template>
