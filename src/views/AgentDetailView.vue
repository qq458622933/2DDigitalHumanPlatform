<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { moduleData } from '../config/modules'

const route = useRoute()
const router = useRouter()

const currentAgent = computed(() => (
  moduleData.agents.rows.find((row) => row.subtitle === route.params.agentId)
  || moduleData.agents.rows[0]
))

const activeSection = ref('智能体编排')
const activePanel = ref('调试预览')
const agentName = ref(currentAgent.value.name)
const agentDescription = ref('面向业务场景提供准确、自然且高效的智能问答服务。')
const selectedModel = ref('通用对话模型')
const temperature = ref(0.7)
const systemPrompt = ref(`你是${currentAgent.value.name}。请基于关联知识库准确回答用户问题，表达清晰、友好，无法确认的信息请如实说明。`)
const selectedRole = ref('AI虚拟导游')
const knowledgeEnabled = ref(true)
const memoryEnabled = ref(true)
const knowledgeBases = ref([currentAgent.value.extra])
const enabledCapabilities = ref(['知识库检索', '多轮对话', '意图识别'])
const knowledgeBase = ref(currentAgent.value.extra)
const debugInput = ref('')
const toastVisible = ref(false)
const toastMessage = ref('智能体设置已保存')
const qnaEnabled = ref(true)
const answerThreshold = ref(0.91)
const qnaSearch = ref('')
const qnaModalOpen = ref(false)
const editingQnaIndex = ref(-1)
const qnaQuestion = ref('')
const qnaAnswer = ref('')
const qnaSimilarQuestions = ref([''])
const actionPickerOpen = ref(false)
const activeActionAssetType = ref('通用动作')
const selectedAnswerActionId = ref('')
const qnaRows = ref([
  { question: '继续讲解', answer: '好的，现在为您继续讲解。', hits: 12, createdAt: '2026-07-16 05:53:58', updatedAt: '2026-08-03 10:26:18' },
  { question: '介绍一下产品功能', answer: '该产品提供数字人训练、智能体配置和内容生成能力。', hits: 28, createdAt: '2026-07-16 05:53:58', updatedAt: '2026-08-01 09:42:06' },
  { question: '如何创建数字人', answer: '进入形象训练页面，上传符合要求的视频素材并开始训练。', hits: 19, createdAt: '2026-07-16 05:53:58', updatedAt: '2026-07-30 15:12:44' },
  { question: '支持哪些视频格式', answer: '在线版和本地版支持的视频格式有所不同，请参考上传要求。', hits: 8, createdAt: '2026-07-16 05:53:58', updatedAt: '2026-07-28 14:08:22' },
  { question: '应用码是什么', answer: '应用码是数字人的唯一调用标识，可在数字人卡片中复制。', hits: 16, createdAt: '2026-07-16 05:53:58', updatedAt: '2026-07-26 11:36:09' },
  { question: '结束讲解', answer: '好的，本次讲解到这里，感谢您的观看。', hits: 6, createdAt: '2026-07-16 05:53:58', updatedAt: '2026-07-25 16:08:30' },
])
const logSearch = ref('')
const logStatus = ref('全部状态')
const logStartDate = ref('')
const logEndDate = ref('')
const conversationLogs = ref([
  { id: 1, title: '确认现下配置', createdAt: '2026-08-05 11:00:51', updatedAt: '2026-08-05 11:00:52', status: '成功' },
  { id: 2, title: '人形机器人商业化突破？ 🤖', createdAt: '2026-08-05 09:34:22', updatedAt: '2026-08-05 09:37:29', status: '成功' },
  { id: 3, title: '查询公司产品 🤔', createdAt: '2026-08-04 17:05:41', updatedAt: '2026-08-04 17:08:36', status: '成功' },
  { id: 4, title: '打招呼 👋', createdAt: '2026-08-04 16:22:35', updatedAt: '2026-08-04 16:23:04', status: '成功' },
  { id: 5, title: '咨询数字人训练进度', createdAt: '2026-08-04 16:05:38', updatedAt: '2026-08-04 16:09:37', status: '失败' },
])
const messages = ref([
  { role: 'assistant', content: `你好，我是${currentAgent.value.name}，有什么可以帮助你？` },
])

const navSections = [
  { group: '智能体管理', icon: 'bot', items: ['智能体编排', '问答管理', '本地问答', '对话日志'] },
]

const capabilities = ['知识库检索', '多轮对话', '意图识别', '联网搜索', '工具调用', '敏感词过滤']
const rolePresets = [
  '小王子', '小男孩医生', '探险家朱拉', '文旅明兰', '丛林探险家天天',
  '心理学家', 'AI虚拟导游', '历史教授', '家庭医生',
]
const answerTools = [
  { label: '图片', icon: 'image', tone: 'purple' },
  { label: '视频', icon: 'video', tone: 'blue' },
  { label: '网页', icon: 'workflow', tone: 'green' },
  { label: '动作', icon: 'sparkles', tone: 'orange' },
  { label: '背景图', icon: 'image', tone: 'violet' },
  { label: '背景视频', icon: 'video', tone: 'blue' },
  { label: '网页背景', icon: 'layers', tone: 'pink' },
  { label: '剧本', icon: 'file', tone: 'orange' },
  { label: '剧本恢复', icon: 'book', tone: 'cyan' },
  { label: '播控素材', icon: 'message', tone: 'blue' },
  { label: '前置视频', icon: 'video', tone: 'cyan' },
  { label: '停顿', icon: 'clock', tone: 'yellow' },
]
const answerActionAssets = [
  { id: 'xiaoran_00', name: '标准讲解', type: '通用动作', preview: moduleData.digitalHumans.rows[0].preview },
  { id: 'xiaoran_action03', name: '右手指引', type: '通用动作', preview: moduleData.digitalHumans.rows[1].preview },
  { id: 'xiaoran_action04', name: '双手展示', type: '通用动作', preview: moduleData.digitalHumans.rows[2].preview },
  { id: 'custom_wave_01', name: '欢迎挥手形象', type: '自定义动作', preview: moduleData.digitalHumans.rows[1].preview },
  { id: 'custom_like_02', name: '点赞互动形象', type: '自定义动作', preview: moduleData.digitalHumans.rows[0].preview },
  { id: 'custom_goodbye_03', name: '结束致意形象', type: '自定义动作', preview: moduleData.digitalHumans.rows[3].preview },
]
const linkedDigitalHumanType = computed(() => {
  if (route.query.digitalHumanType) return route.query.digitalHumanType
  return moduleData.digitalHumans.rows.find((human) => human.extra === currentAgent.value.name)?.type || ''
})
const visibleAnswerTools = computed(() => (
  linkedDigitalHumanType.value === '2D本地版'
    ? answerTools
    : answerTools.filter((tool) => tool.label !== '动作')
))
const filteredAnswerActionAssets = computed(() => answerActionAssets.filter((action) => action.type === activeActionAssetType.value))
const filteredQnaRows = computed(() => {
  const query = qnaSearch.value.trim().toLowerCase()
  return qnaRows.value.filter((row) => !query || `${row.question} ${row.answer}`.toLowerCase().includes(query))
})
const filteredConversationLogs = computed(() => {
  const query = logSearch.value.trim().toLowerCase()
  return conversationLogs.value.filter((log) => {
    const matchesKeyword = !query || log.title.toLowerCase().includes(query)
    const matchesStatus = logStatus.value === '全部状态' || log.status === logStatus.value
    const date = log.createdAt.slice(0, 10)
    const matchesStart = !logStartDate.value || date >= logStartDate.value
    const matchesEnd = !logEndDate.value || date <= logEndDate.value
    return matchesKeyword && matchesStatus && matchesStart && matchesEnd
  })
})

function selectRole(role) {
  selectedRole.value = role
  systemPrompt.value = `一、基础身份信息\n名称：${role}\n性别：根据角色设定\n职业定位：专业智能讲解与问答助手\n\n二、核心性格与气质\n表达自然、耐心且富有亲和力，在保持专业性的同时主动理解用户意图。\n\n三、核心专业能力\n基于关联知识库准确回答问题，提供清晰、有条理且可信的内容；无法确认的信息请如实说明。`
}

function addKnowledgeBase() {
  if (!knowledgeBases.value.includes('企业资料库')) knowledgeBases.value.push('企业资料库')
}

function removeKnowledgeBase(item) {
  knowledgeBases.value = knowledgeBases.value.filter((knowledge) => knowledge !== item)
}

function openQnaModal(row = null) {
  editingQnaIndex.value = row ? qnaRows.value.indexOf(row) : -1
  qnaQuestion.value = row?.question || ''
  qnaAnswer.value = row?.answer || ''
  qnaSimilarQuestions.value = row?.similarQuestions?.length ? [...row.similarQuestions] : ['']
  qnaModalOpen.value = true
}

function closeQnaModal() {
  closeActionPicker()
  qnaModalOpen.value = false
  editingQnaIndex.value = -1
  qnaQuestion.value = ''
  qnaAnswer.value = ''
  qnaSimilarQuestions.value = ['']
}

function saveQna() {
  if (editingQnaIndex.value === -1) {
    qnaRows.value.unshift({ question: qnaQuestion.value, similarQuestions: qnaSimilarQuestions.value.filter(Boolean), answer: qnaAnswer.value, hits: 0, createdAt: '刚刚', updatedAt: '刚刚' })
  } else {
    qnaRows.value[editingQnaIndex.value] = { ...qnaRows.value[editingQnaIndex.value], question: qnaQuestion.value, similarQuestions: qnaSimilarQuestions.value.filter(Boolean), answer: qnaAnswer.value, updatedAt: '刚刚' }
  }
  const message = editingQnaIndex.value === -1 ? '问答已添加' : '问答已更新'
  closeQnaModal()
  showPageToast(message)
}

function addSimilarQuestion() {
  qnaSimilarQuestions.value.push('')
}

function removeSimilarQuestion(index) {
  if (qnaSimilarQuestions.value.length === 1) qnaSimilarQuestions.value[0] = ''
  else qnaSimilarQuestions.value.splice(index, 1)
}

function insertAnswerToken(label) {
  if (label === '动作') {
    openActionPicker()
    return
  }
  qnaAnswer.value += `${qnaAnswer.value ? '\n' : ''}[${label}]`
}

function openActionPicker() {
  activeActionAssetType.value = '通用动作'
  selectedAnswerActionId.value = ''
  actionPickerOpen.value = true
}

function closeActionPicker() {
  actionPickerOpen.value = false
  selectedAnswerActionId.value = ''
}

function confirmAnswerAction() {
  const action = answerActionAssets.find((item) => item.id === selectedAnswerActionId.value)
  if (!action) return
  const token = `![action](${action.id})`
  qnaAnswer.value = qnaAnswer.value ? `${token}${qnaAnswer.value}` : token
  closeActionPicker()
  showPageToast(`已插入动作“${action.name}”`)
}

function deleteQna(row) {
  if (!window.confirm(`确定删除问题“${row.question}”吗？`)) return
  qnaRows.value = qnaRows.value.filter((item) => item !== row)
  showPageToast('问答已删除')
}

function showPageToast(message) {
  toastMessage.value = message
  toastVisible.value = true
  window.setTimeout(() => { toastVisible.value = false }, 2600)
}

function syncLocalQna() {
  showPageToast('问答已同步到本地')
}

function sendDebugMessage() {
  const content = debugInput.value.trim()
  if (!content) return
  messages.value.push({ role: 'user', content })
  debugInput.value = ''
  window.setTimeout(() => {
    messages.value.push({ role: 'assistant', content: '已收到你的问题。这是调试环境中的示例回复，你可以继续调整提示词和模型参数。' })
  }, 350)
}

function backToSource() {
  if (route.params.digitalHumanCode) {
    router.push({ name: 'digitalHumanDetail', params: { appCode: route.params.digitalHumanCode } })
    return
  }
  router.push('/digital-humans')
}

function saveSettings() {
  toastMessage.value = '智能体设置已保存'
  toastVisible.value = true
  window.setTimeout(() => { toastVisible.value = false }, 2600)
}
</script>

<template>
  <div class="agent-detail-page" style="--accent: #3877f5">
    <header class="detail-page-header">
      <div class="detail-title-wrap">
        <button class="detail-back-button agent-back-button" aria-label="返回数字人详情" @click="backToSource">
          <AppIcon name="chevron" :size="19" />
        </button>
        <div>
          <div class="detail-breadcrumb">智能体 / {{ currentAgent.name }}</div>
          <h1>智能体设置</h1>
          <p>配置智能体的模型、提示词、知识库与业务能力。</p>
        </div>
      </div>
      <button class="primary-button detail-save-button" @click="saveSettings">
        <AppIcon name="check" :size="17" />保存设置
      </button>
    </header>

    <div class="agent-detail-layout" :class="{ 'content-wide': activeSection !== '智能体编排' }">
      <aside class="detail-subnav agent-detail-subnav">
        <div class="agent-detail-summary">
          <span class="agent-summary-icon" :class="currentAgent.tone"><AppIcon name="bot" :size="21" /></span>
          <div><strong>{{ currentAgent.name }}</strong><small>{{ currentAgent.subtitle }}</small></div>
        </div>
        <nav aria-label="智能体详情导航">
          <section v-for="section in navSections" :key="section.group">
            <div class="detail-nav-group"><AppIcon :name="section.icon" :size="15" />{{ section.group }}</div>
            <button v-for="item in section.items" :key="item" :class="{ active: activeSection === item }" @click="activeSection = item">
              {{ item }}
            </button>
          </section>
        </nav>
      </aside>

      <main class="agent-config-column">
        <section v-if="activeSection === '智能体编排'" class="agent-orchestration-panel">
          <div class="orchestration-config-section">
            <div class="orchestration-section-title">
              <div><strong>系统提示词</strong><AppIcon name="info" :size="16" /></div>
              <span>定义智能体的身份、性格和回复规则</span>
            </div>
            <div class="role-preset-row">
              <strong>角色：</strong>
              <button v-for="role in rolePresets" :key="role" :class="{ active: selectedRole === role }" @click="selectRole(role)">{{ role }}</button>
            </div>
            <div class="system-prompt-editor">
              <textarea v-model="systemPrompt" maxlength="10000" aria-label="系统提示词"></textarea>
              <span>{{ systemPrompt.length }} / 10000</span>
            </div>
          </div>

          <div class="orchestration-config-section knowledge-config-section">
            <div class="orchestration-section-title toggle-title">
              <div><strong>知识库配置</strong><AppIcon name="info" :size="16" /></div>
              <label class="config-switch"><input v-model="knowledgeEnabled" type="checkbox" /><span></span></label>
            </div>
            <div v-if="knowledgeEnabled" class="knowledge-config-card">
              <div class="knowledge-tags">
                <span v-for="knowledge in knowledgeBases" :key="knowledge"><AppIcon name="book" :size="14" />{{ knowledge }}<button aria-label="移除知识库" @click="removeKnowledgeBase(knowledge)"><AppIcon name="close" :size="12" /></button></span>
              </div>
              <button class="add-knowledge-button" @click="addKnowledgeBase"><AppIcon name="plus" :size="16" />添加知识库</button>
            </div>
          </div>

          <div class="orchestration-config-section memory-config-section">
            <div class="orchestration-section-title toggle-title">
              <div><strong>多轮对话记忆</strong><AppIcon name="info" :size="16" /></div>
              <label class="config-switch"><input v-model="memoryEnabled" type="checkbox" /><span></span></label>
            </div>
            <div class="memory-description">
              <strong>{{ memoryEnabled ? '已启用多轮对话记忆' : '多轮对话记忆已关闭' }}</strong>
              <span>{{ memoryEnabled ? '智能体会记住当前会话上下文，提供更加连贯的交互体验。' : '每次提问将作为独立会话处理。' }}</span>
            </div>
          </div>
        </section>

        <section v-else-if="['问答管理', '本地问答'].includes(activeSection)" class="qna-management-panel">
          <div class="qna-toolbar-top">
            <div class="qna-title"><strong>{{ activeSection }}</strong><span>回复问答</span><label class="config-switch"><input v-model="qnaEnabled" type="checkbox" /><span></span></label></div>
            <div class="qna-file-actions"><button @click="showPageToast('请选择需要导入的问答文件')">↓ 导入</button><button @click="showPageToast('问答数据已导出')">↑ 导出</button></div>
          </div>

          <div class="qna-control-row">
            <div v-if="activeSection === '问答管理'" class="threshold-control">
              <label for="answer-threshold">回答分数阈值</label>
              <div><span>0.8</span><input id="answer-threshold" v-model="answerThreshold" type="range" min="0.8" max="1" step="0.01" /><span>1.0</span><strong>匹配度: {{ Math.round(answerThreshold * 100) }}%</strong></div>
            </div>
            <button
              v-else
              class="local-qna-sync-button"
              data-tooltip="将问答管理内的所有问答都同步到本地提升回复速度，但是需要问题完全一致才能触发。"
              @click="syncLocalQna"
            >
              <AppIcon name="database" :size="17" />一键同步问答
            </button>
            <div class="qna-search-actions">
              <label><AppIcon name="search" :size="17" /><input v-model="qnaSearch" placeholder="搜索问题、回答内容或关键词" /></label>
              <button class="primary-button" @click="openQnaModal()"><AppIcon name="plus" :size="17" />添加问答</button>
            </div>
          </div>

          <div class="qna-table-scroll">
            <table class="qna-table">
              <thead><tr><th>问题</th><th>回答</th><th>命中次数</th><th>创建时间</th><th>更新时间</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="row in filteredQnaRows" :key="`${row.question}-${row.createdAt}`">
                  <td><strong>{{ row.question }}</strong></td>
                  <td><p :title="row.answer">{{ row.answer }}</p></td>
                  <td>{{ row.hits }}</td>
                  <td>{{ row.createdAt }}</td>
                  <td>{{ row.updatedAt }}</td>
                  <td><div class="qna-row-actions"><button @click="openQnaModal(row)"><AppIcon name="edit" :size="14" />编辑</button><button @click="deleteQna(row)"><AppIcon name="close" :size="14" />删除</button></div></td>
                </tr>
              </tbody>
            </table>
            <div v-if="filteredQnaRows.length === 0" class="empty-state"><AppIcon name="search" :size="28" /><strong>没有找到匹配问答</strong><span>请调整搜索内容</span></div>
          </div>
          <div class="qna-pagination"><span>共 {{ filteredQnaRows.length }} 条</span><button disabled>‹</button><button class="active">1</button><button disabled>›</button><span>前往</span><input value="1" /><span>页</span></div>
        </section>

        <section v-else-if="activeSection === '对话日志'" class="conversation-log-panel">
          <h2>对话日志</h2>
          <div class="conversation-log-filters">
            <label class="conversation-search"><AppIcon name="search" :size="17" /><input v-model="logSearch" placeholder="搜索对话内容" /></label>
            <div class="conversation-filter-right">
              <label class="date-range-filter"><AppIcon name="clock" :size="16" /><input v-model="logStartDate" type="date" aria-label="开始时间" /><span>至</span><input v-model="logEndDate" type="date" aria-label="结束时间" /></label>
              <select v-model="logStatus" aria-label="选择状态"><option>全部状态</option><option>成功</option><option>失败</option></select>
            </div>
          </div>

          <div class="conversation-log-list">
            <article v-for="(log, index) in filteredConversationLogs" :key="log.id" class="conversation-log-card">
              <span class="conversation-index">{{ index + 1 }}</span>
              <div class="conversation-log-copy">
                <h3><span>会话名称：</span>{{ log.title }}</h3>
                <div><span>创建：<strong>{{ log.createdAt }}</strong></span><i></i><span>更新：<strong>{{ log.updatedAt }}</strong></span></div>
              </div>
              <span class="conversation-status" :class="log.status === '成功' ? 'success' : 'failed'">{{ log.status }}</span>
            </article>
            <div v-if="filteredConversationLogs.length === 0" class="empty-state conversation-log-empty"><AppIcon name="search" :size="29" /><strong>没有找到对话日志</strong><span>请调整搜索或筛选条件</span></div>
          </div>

          <div class="conversation-pagination">
            <span>共 {{ filteredConversationLogs.length }} 条</span>
            <select aria-label="每页数量"><option>5条/页</option><option>10条/页</option></select>
            <button disabled>‹</button><button class="active">1</button><button>2</button><button>3</button><button>…</button><button>17</button><button>›</button>
            <span>前往</span><input value="1" /><span>页</span>
          </div>
        </section>

        <section v-else class="agent-section-placeholder">
          <AppIcon name="book" :size="34" />
          <strong>{{ activeSection }}</strong>
          <span>该模块内容将在此处展示</span>
        </section>
      </main>

      <aside v-if="activeSection === '智能体编排'" class="agent-debug-panel">
        <div class="settings-tabs single-tab">
          <button class="active">调试预览</button>
        </div>
        <template v-if="activePanel === '调试预览'">
          <div class="debug-status"><span><i></i>调试环境</span><button @click="messages = []">清空</button></div>
          <div class="debug-messages">
            <div v-if="messages.length === 0" class="debug-empty"><AppIcon name="message" :size="28" /><span>发送消息开始调试</span></div>
            <div v-for="(message, index) in messages" :key="index" :class="['debug-message', message.role]">
              <span v-if="message.role === 'assistant'"><AppIcon name="bot" :size="14" /></span>
              <p>{{ message.content }}</p>
            </div>
          </div>
          <form class="debug-input-wrap" @submit.prevent="sendDebugMessage">
            <textarea v-model="debugInput" rows="2" placeholder="输入调试消息..." @keydown.enter.exact.prevent="sendDebugMessage"></textarea>
            <button type="submit" aria-label="发送消息"><AppIcon name="chevron" :size="18" /></button>
          </form>
        </template>
        <div v-else class="run-records">
          <div><span class="success-dot"></span><p><strong>对话测试完成</strong><small>今天 10:26 · 响应 0.82s</small></p></div>
          <div><span class="success-dot"></span><p><strong>知识库检索成功</strong><small>昨天 18:40 · 命中 3 条</small></p></div>
          <div><span class="neutral-dot"></span><p><strong>配置已更新</strong><small>07-30 15:12 · admin</small></p></div>
        </div>
      </aside>
    </div>

    <Transition name="fade">
      <div v-if="qnaModalOpen" class="modal-backdrop" @click.self="closeQnaModal">
        <div class="modal-card qna-modal">
          <button class="modal-close" aria-label="关闭" @click="closeQnaModal"><AppIcon name="close" /></button>
          <h3>{{ editingQnaIndex === -1 ? '添加固定问答' : '修改固定问答' }}</h3>
          <form class="qna-detail-form" @submit.prevent="saveQna">
            <label for="qna-question">标准问</label>
            <div class="counted-textarea">
              <textarea id="qna-question" v-model.trim="qnaQuestion" maxlength="500" required placeholder="请输入标准问题"></textarea>
              <span>{{ qnaQuestion.length }} / 500</span>
            </div>

            <label>相似问</label>
            <div v-for="(_, index) in qnaSimilarQuestions" :key="index" class="similar-question-row">
              <div class="counted-textarea">
                <textarea v-model.trim="qnaSimilarQuestions[index]" maxlength="500" placeholder="请输入相似问题..."></textarea>
                <span>{{ qnaSimilarQuestions[index].length }} / 500</span>
              </div>
              <button v-if="qnaSimilarQuestions.length > 1" type="button" aria-label="删除相似问" @click="removeSimilarQuestion(index)"><AppIcon name="close" :size="15" /></button>
            </div>
            <button type="button" class="add-similar-button" @click="addSimilarQuestion"><AppIcon name="plus" :size="14" />添加相似问</button>

            <label>回答</label>
            <div class="answer-tool-list">
              <button
                v-for="tool in visibleAnswerTools"
                :key="tool.label"
                type="button"
                :class="[tool.tone, { 'has-tool-tooltip': tool.label === '动作' }]"
                :data-tooltip="tool.label === '动作' ? '只有2D本地版数字人支持动作，动作标签使用时至少需要有两句话，并且只能插入在句首。' : null"
                @click="insertAnswerToken(tool.label)"
              >
                <AppIcon :name="tool.icon" :size="13" />{{ tool.label }}
              </button>
            </div>

            <label for="qna-answer" class="preview-label">回答预览效果：</label>
            <div class="answer-preview-editor">
              <textarea id="qna-answer" v-model.trim="qnaAnswer" required placeholder="请输入标准回答内容"></textarea>
              <button v-if="qnaAnswer" type="button" @click="qnaAnswer = ''"><AppIcon name="book" :size="14" />恢复剧本</button>
            </div>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="closeQnaModal">取消</button><button type="submit" class="primary-button">确认</button></div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="actionPickerOpen" class="modal-backdrop action-picker-backdrop" @click.self="closeActionPicker">
        <div class="modal-card answer-action-picker-modal" role="dialog" aria-modal="true" aria-label="选择可用动作">
          <button class="modal-close" aria-label="关闭动作选择" @click="closeActionPicker"><AppIcon name="close" /></button>
          <div class="modal-icon"><AppIcon name="sparkles" :size="24" /></div>
          <h3>选择可用动作</h3>
          <p>选择需要插入回答内容的动作，确认后将自动生成对应动作标签。</p>

          <div class="answer-action-type-tabs" role="tablist" aria-label="动作资产类型">
            <button v-for="type in ['通用动作', '自定义动作']" :key="type" type="button" role="tab" :aria-selected="activeActionAssetType === type" :class="{ active: activeActionAssetType === type }" @click="activeActionAssetType = type">
              {{ type }}
              <span>{{ answerActionAssets.filter((action) => action.type === type).length }}</span>
            </button>
          </div>

          <div class="answer-action-card-grid">
            <button v-for="action in filteredAnswerActionAssets" :key="action.id" type="button" class="answer-action-card" :class="{ selected: selectedAnswerActionId === action.id }" @click="selectedAnswerActionId = action.id">
              <span class="answer-action-preview"><img :src="action.preview" :alt="`${action.name}动作预览图`" /><span><AppIcon name="check" :size="14" /></span></span>
              <span class="answer-action-card-copy"><strong>{{ action.name }}</strong><small>{{ action.id }}</small></span>
              <em>{{ action.type }}</em>
            </button>
          </div>

          <div class="answer-action-picker-hint"><AppIcon name="info" :size="14" />动作标签只能插入句首，使用动作标签时回答内容至少需要有两句话。</div>
          <div class="modal-actions">
            <button type="button" class="secondary-button" @click="closeActionPicker">取消</button>
            <button type="button" class="primary-button" :disabled="!selectedAnswerActionId" @click="confirmAnswerAction">确认插入动作</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="toastVisible" class="toast-message"><AppIcon name="check" :size="19" />{{ toastMessage }}</div>
    </Transition>
  </div>
</template>
