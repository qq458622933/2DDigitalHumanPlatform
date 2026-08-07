<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

const interactionMode = ref('直接打断')
const idleTimeout = ref(60)
const idleVideo = ref(null)
const commonQuestionsEnabled = ref(false)
const commonQuestions = ref([])
const newQuestion = ref('')
const questionInputVisible = ref(false)
const importInput = ref(null)
const wakeWords = ref(['你好'])
const newWakeWord = ref('')
const wakePrompt = ref('您可以说：你好+问题进行交互哦')
const interruptWords = ref(['等等', '打断', '停止'])
const newInterruptWord = ref('')
const interruptPrompt = ref('您可以说打断词来打断当前对话哦')

const modes = [
  { name: '直接打断', description: '用户可以随时直接提问打断数字人，适合快速互动、自然对话的场景' },
  { name: '唤醒词模式', description: '用户必须说“唤醒词 + 问题”才能与数字人交互，适合需要明确意图的场景' },
  { name: '打断词模式', description: '用户需等待数字人播报完成后交互，或说出打断词进行打断，适合需要完整信息传达的场景' },
]

function handleIdleVideo(event) {
  idleVideo.value = event.target.files?.[0] || null
}

function addQuestion() {
  const question = newQuestion.value.trim()
  if (!question) {
    questionInputVisible.value = true
    return
  }
  commonQuestions.value.push(question)
  newQuestion.value = ''
  questionInputVisible.value = false
}

function handleQuestionImport(event) {
  const file = event.target.files?.[0]
  if (!file) return
  commonQuestions.value.push(`已导入：${file.name}`)
  event.target.value = ''
}

function exportQuestions() {
  const content = commonQuestions.value.join('\n') || '暂无常见问题'
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = '常见问题.txt'
  link.click()
  URL.revokeObjectURL(url)
}

function addWakeWord() {
  const word = newWakeWord.value.trim()
  if (!word || wakeWords.value.includes(word)) return
  wakeWords.value.push(word)
  newWakeWord.value = ''
}

function addInterruptWord() {
  const word = newInterruptWord.value.trim()
  if (!word || interruptWords.value.includes(word)) return
  interruptWords.value.push(word)
  newInterruptWord.value = ''
}
</script>

<template>
  <main class="interaction-config-page">
    <section class="interaction-mode-card">
      <div class="interaction-section-heading">
        <div><strong>交互模式</strong><AppIcon name="info" :size="15" /></div>
        <span>选择用户与数字人进行对话的方式</span>
      </div>
      <div class="interaction-mode-options">
        <button v-for="mode in modes" :key="mode.name" type="button" :class="{ active: interactionMode === mode.name }" @click="interactionMode = mode.name">
          <span><strong>{{ mode.name }}</strong><small>{{ mode.description }}</small></span>
          <i><b></b></i>
        </button>
      </div>
    </section>

    <div class="interaction-config-grid" :class="{ 'has-word-panel': interactionMode !== '直接打断' }">
      <section class="interaction-config-card idle-config-card">
        <div class="interaction-section-heading compact">
          <div><strong>静默状态配置</strong><AppIcon name="info" :size="15" /></div>
        </div>
        <label class="idle-timeout-field">
          <span>无交互超时时间 <AppIcon name="info" :size="14" /></span>
          <div><input v-model.number="idleTimeout" type="number" min="30" max="300" /><em>S</em></div>
          <small>建议设置为 30-300 秒之间</small>
        </label>

        <div class="idle-video-field">
          <label>静默状态视频 <AppIcon name="info" :size="14" /></label>
          <label class="idle-video-upload" :class="{ 'has-file': idleVideo }">
            <input type="file" accept="video/mp4,video/webm" @change="handleIdleVideo" />
            <AppIcon :name="idleVideo ? 'check' : 'video'" :size="23" />
            <span v-if="idleVideo"><strong>{{ idleVideo.name }}</strong><small>{{ (idleVideo.size / 1024 / 1024).toFixed(1) }} MB，点击可重新上传</small></span>
            <span v-else>将文件拖到此处，或 <strong>点击上传</strong></span>
          </label>
          <p>请上传大小不超过 <strong>1GB</strong>、格式为 <b>mp4/webm</b> 的文件</p>
          <small>建议上传展示数字人自然状态的循环视频，如呼吸、微笑等动作</small>
        </div>
      </section>

      <section class="interaction-config-card common-question-card">
        <div class="common-question-header">
          <div class="interaction-section-heading compact">
            <div><strong>常见问题</strong><AppIcon name="info" :size="15" /></div>
          </div>
          <button type="button" class="switch-control" :class="{ active: commonQuestionsEnabled }" :aria-pressed="commonQuestionsEnabled" @click="commonQuestionsEnabled = !commonQuestionsEnabled"><span></span></button>
        </div>
        <div class="common-question-actions">
          <button type="button" class="add-question-button" @click="questionInputVisible = true"><AppIcon name="plus" :size="14" />添加问题</button>
          <div>
            <input ref="importInput" type="file" accept=".csv,.txt" hidden @change="handleQuestionImport" />
            <button type="button" @click="importInput?.click()"><AppIcon name="file" :size="14" />导入</button>
            <button type="button" @click="exportQuestions"><AppIcon name="logout" :size="14" />导出</button>
          </div>
        </div>
        <div v-if="questionInputVisible" class="new-question-row">
          <input v-model="newQuestion" maxlength="20" placeholder="请输入常见问题，最多20个字符" @keyup.enter="addQuestion" />
          <button type="button" @click="addQuestion">确定</button>
        </div>
        <ul v-if="commonQuestions.length" class="common-question-list">
          <li v-for="(question, index) in commonQuestions" :key="`${question}-${index}`"><span>{{ question }}</span><button type="button" aria-label="删除问题" @click="commonQuestions.splice(index, 1)"><AppIcon name="close" :size="13" /></button></li>
        </ul>
        <div v-else class="common-question-empty">暂无常见问题，点击“添加问题”开始配置</div>
        <div class="common-question-tips">
          <p>每个问题最多20个字符，建议简洁明了</p>
          <p>常见问题将展示在交互界面，方便用户快速提问</p>
          <p>支持CSV批量导入导出，格式：问题（每行一个）</p>
        </div>
      </section>

      <section v-if="interactionMode === '唤醒词模式'" class="interaction-config-card word-config-card">
        <div class="interaction-section-heading compact">
          <div><strong>唤醒词配置</strong><AppIcon name="info" :size="15" /></div>
        </div>
        <div class="word-add-row">
          <input v-model.trim="newWakeWord" maxlength="12" aria-label="新增唤醒词" @keyup.enter="addWakeWord" />
          <button type="button" @click="addWakeWord">保存</button>
        </div>
        <ol class="configured-word-list">
          <li v-for="(word, index) in wakeWords" :key="`${word}-${index}`">
            <span>{{ word }}</span>
            <button type="button" :aria-label="`删除唤醒词${word}`" @click="wakeWords.splice(index, 1)"><AppIcon name="trash" :size="14" /></button>
          </li>
        </ol>
        <div class="word-config-tips">
          <p>建议使用简短、易识别的词语，如“小美”、“你好”等</p>
          <p>可以设置多个唤醒词，用户说出任意一个即可唤醒</p>
          <p>用户需要说：“[唤醒词] + 问题”，例如：“小美，今天天气怎么样？”</p>
        </div>
        <div class="interaction-prompt-field">
          <div class="interaction-section-heading compact">
            <div><strong>交互提示文字</strong><AppIcon name="info" :size="15" /></div>
          </div>
          <input v-model="wakePrompt" maxlength="50" />
          <small>提示文字会在数字人页面上显示，帮助用户了解交互方式</small>
        </div>
      </section>

      <section v-else-if="interactionMode === '打断词模式'" class="interaction-config-card word-config-card">
        <div class="interaction-section-heading compact">
          <div><strong>打断词配置</strong><AppIcon name="info" :size="15" /></div>
        </div>
        <div class="word-add-row">
          <input v-model.trim="newInterruptWord" maxlength="12" aria-label="新增打断词" @keyup.enter="addInterruptWord" />
          <button type="button" @click="addInterruptWord">保存</button>
        </div>
        <ol class="configured-word-list">
          <li v-for="(word, index) in interruptWords" :key="`${word}-${index}`">
            <span>{{ word }}</span>
            <button type="button" :aria-label="`删除打断词${word}`" @click="interruptWords.splice(index, 1)"><AppIcon name="trash" :size="14" /></button>
          </li>
        </ol>
        <div class="word-config-tips">
          <p>建议使用明确的打断词，如“等等”、“停止”、“打断”等</p>
          <p>用户必须等待数字人播报完成，或说出打断词才能交互</p>
          <p>说出打断词后，数字人将停止当前播报并等待新问题</p>
        </div>
        <div class="interaction-prompt-field">
          <div class="interaction-section-heading compact">
            <div><strong>交互提示文字</strong><AppIcon name="info" :size="15" /></div>
          </div>
          <input v-model="interruptPrompt" maxlength="50" />
          <small>提示文字会在数字人页面上显示，帮助用户了解交互方式</small>
        </div>
      </section>
    </div>
  </main>
</template>
