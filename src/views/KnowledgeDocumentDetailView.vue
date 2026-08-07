<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { moduleData } from '../config/modules'

const route = useRoute()
const router = useRouter()
const toastVisible = ref(false)
const toastMessage = ref('')

const knowledge = computed(() => moduleData.knowledge.rows.find((item) => item.subtitle === route.params.knowledgeId) || moduleData.knowledge.rows[0])
const document = computed(() => knowledge.value.documents?.find((item) => item.id === route.params.documentId) || knowledge.value.documents?.[0] || {
  name: '产品介绍.docx', fileSize: 15480, characterCount: 5593, uploadedAt: '2026-08-06 14:03:47', enabled: true,
})

const segmentCount = Math.max(1, Math.min(6, Math.ceil(document.value.characterCount / 1024)))
const sampleContents = [
  '文档核心内容与基础信息说明，包含产品定位、主要功能、服务对象以及相关业务背景。',
  '本段介绍具体使用流程与操作方法，帮助用户快速了解业务步骤和注意事项。',
  '常见问题与处理建议，针对实际使用过程中可能遇到的情况提供清晰解答。',
  '功能特点与应用场景说明，可根据不同需求选择对应能力并完成相关配置。',
  '服务规范、交付标准及保障措施，确保内容准确、流程完整并持续稳定运行。',
  '补充资料与扩展说明，包含相关术语、示例内容及后续使用建议。',
]
const segments = ref(Array.from({ length: segmentCount }, (_, index) => {
  const remaining = Math.max(1, document.value.characterCount - index * 1024)
  return {
    id: `${document.value.id || 'document'}-segment-${index + 1}`,
    characterCount: Math.min(1024, remaining),
    recallCount: 0,
    content: `${document.value.name} · ${sampleContents[index % sampleContents.length]}`,
    enabled: document.value.enabled !== false,
  }
}))

const totalCharacters = computed(() => segments.value.reduce((total, segment) => total + segment.characterCount, 0))

function formatSize(bytes = 0) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function showToast(message) {
  toastMessage.value = message
  toastVisible.value = true
  window.setTimeout(() => { toastVisible.value = false }, 2400)
}

function editSegment(segment) {
  const content = window.prompt('编辑分段内容', segment.content)?.trim()
  if (!content) return
  segment.content = content
  segment.characterCount = content.length
  showToast('分段内容已更新')
}

function removeSegment(id) {
  const index = segments.value.findIndex((segment) => segment.id === id)
  if (index !== -1) segments.value.splice(index, 1)
  showToast('分段已删除')
}
</script>

<template>
  <div class="knowledge-document-detail-page" style="--accent: #0ea5e9">
    <aside class="document-detail-sidebar">
      <button class="knowledge-detail-back" aria-label="返回知识库详情" @click="router.push({ name: 'knowledgeDetail', params: { knowledgeId: knowledge.subtitle } })"><AppIcon name="chevron" :size="18" /></button>
      <section>
        <h2>文档信息</h2>
        <dl>
          <div><dt>原始文件名称：</dt><dd :title="document.name">{{ document.name }}</dd></div>
          <div><dt>原始文件大小：</dt><dd>{{ formatSize(document.fileSize) }}</dd></div>
          <div><dt>上传日期：</dt><dd>{{ document.uploadedAt }}</dd></div>
          <div><dt>最后更新日期：</dt><dd>—</dd></div>
        </dl>
      </section>
      <section>
        <h2>技术参数</h2>
        <dl>
          <div><dt>分段规则：</dt><dd>自定义</dd></div>
          <div><dt>段落数量：</dt><dd>{{ segments.length }}</dd></div>
          <div><dt>段落长度：</dt><dd>1024</dd></div>
        </dl>
      </section>
    </aside>

    <main class="document-segment-content">
      <header class="document-segment-header"><div><div class="detail-breadcrumb">{{ knowledge.name }} / {{ document.name }}</div><h1>{{ segments.length }}段</h1><p>共 {{ totalCharacters }} 个字符，管理文档解析后的知识分段。</p></div></header>
      <section class="document-segment-list">
        <article v-for="(segment, index) in segments" :key="segment.id" class="document-segment-card">
          <span class="segment-status-ribbon" :class="{ disabled: !segment.enabled }">{{ segment.enabled ? '已启用' : '已禁用' }}</span>
          <div class="segment-meta">分段{{ String(index + 1).padStart(2, '0') }} · {{ segment.characterCount }}字符 · {{ segment.recallCount }}召回次数</div>
          <p>{{ segment.content }}</p>
          <div class="segment-actions">
            <button class="danger" @click="removeSegment(segment.id)"><AppIcon name="trash" :size="13" />删除</button>
            <button @click="editSegment(segment)"><AppIcon name="edit" :size="13" />编辑</button>
            <button class="segment-toggle" :class="{ active: segment.enabled }" :aria-label="segment.enabled ? '禁用分段' : '启用分段'" @click="segment.enabled = !segment.enabled"><span></span></button>
          </div>
        </article>
        <div v-if="!segments.length" class="empty-state document-segment-empty"><AppIcon name="file" :size="30" /><strong>暂无知识分段</strong><span>请返回文档列表重新设置分段规则</span></div>
      </section>
      <footer class="document-segment-pagination"><span>共 {{ segments.length }} 条</span><select><option>10条/页</option><option>20条/页</option></select><button disabled><AppIcon name="chevron" :size="13" /></button><button class="active">1</button><button disabled><AppIcon name="chevron" :size="13" /></button><span>前往</span><input value="1" aria-label="前往页码" /><span>页</span></footer>
    </main>

    <Transition name="toast"><div v-if="toastVisible" class="toast-message"><AppIcon name="check" :size="19" />{{ toastMessage }}</div></Transition>
  </div>
</template>
