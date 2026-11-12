<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'

const scripts = [
  { title: '自然介绍', text: '大家好，欢迎来到数字人平台。今天我将为您介绍我们的产品。' },
  { title: '服务引导', text: '您好，很高兴为您服务。请告诉我您想了解什么内容。' },
  { title: '产品讲解', text: '我们的数字人支持形象训练和智能问答，让讲解更加生动。' },
]

const mode = ref('upload')
const voiceName = ref('')
const audioFile = ref(null)
const audioUrl = ref('')
const audioValidationState = ref('idle')
const audioValidationMessage = ref('')
const transcript = ref('')
const recognitionState = ref('idle')
const confirmed = ref(false)
const confirmedTranscript = ref('')
const selectedScript = ref(0)
const message = ref('')
const tasks = ref([
  { id: 'demo-1', name: '晓冉 · 自然女声', file: 'xiaoran_original.wav', method: '自由上传', createdAt: '2026-08-06 14:28:16', status: '已完成', originalText: '您好，欢迎使用数字人平台。今天我将为您介绍产品的主要功能。', synthesisText: '', demo: true },
  { id: 'demo-2', name: '云泽 · 沉稳男声', file: 'yunze_original.mp3', method: '固定文案上传', createdAt: '2026-08-04 10:15:42', status: '已完成', originalText: '大家好，很高兴为您介绍我们的数字人服务。', synthesisText: '', demo: true },
  { id: 'demo-3', name: '清和 · 温柔女声', file: 'qinghe_original.flac', method: '自由上传', createdAt: '2026-07-30 16:42:09', status: '已完成', originalText: '您好，请问有什么可以帮您？我会为您提供清晰准确的解答。', synthesisText: '', demo: true },
])
const activeSpeech = ref('')
const taskPreviewMessage = ref('')
const canSubmitTraining = computed(() => Boolean(audioFile.value && audioValidationState.value === 'valid' && voiceName.value.trim()
  && confirmed.value && transcript.value.trim() === confirmedTranscript.value))
const submitBlockReason = computed(() => {
  if (!audioFile.value) return '请先上传音频'
  if (audioValidationState.value === 'checking') return '正在检查音频时长，请稍候'
  if (audioValidationState.value !== 'valid') return audioValidationMessage.value || '请上传有效音频'
  if (!voiceName.value.trim()) return '请填写音色名称'
  if (!confirmed.value || transcript.value.trim() !== confirmedTranscript.value) return '请核对并确认音频文案'
  return '已完成文案确认，可以提交训练'
})
let synthesisController = null
let fileSelectionSeq = 0

function stopSpeech() {
  window.speechSynthesis?.cancel()
  synthesisController?.abort()
  synthesisController = null
  activeSpeech.value = ''
}

function speakText(task, text, kind) {
  if (!window.speechSynthesis) { taskPreviewMessage.value = '当前浏览器不支持语音试听'; return }
  stopSpeech()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = 1
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('zh'))
  if (voices.length) utterance.voice = voices[task.id === 'demo-2' ? Math.min(1, voices.length - 1) : 0]
  const key = `${task.id}-${kind}`
  activeSpeech.value = key
  utterance.onend = () => { if (activeSpeech.value === key) activeSpeech.value = '' }
  utterance.onerror = () => { if (activeSpeech.value === key) activeSpeech.value = '' }
  window.speechSynthesis.speak(utterance)
}

function changeSynthesisText(task) {
  if (task.synthesizedUrl) {
    URL.revokeObjectURL(task.synthesizedUrl)
    task.synthesizedUrl = ''
  }
  if (activeSpeech.value === `${task.id}-synthesis`) stopSpeech()
  taskPreviewMessage.value = ''
}

async function synthesizeTask(task) {
  const text = task.synthesisText?.trim()
  if (!text) { taskPreviewMessage.value = '请先输入要合成的试听文案'; return }
  taskPreviewMessage.value = ''
  if (task.synthesizedUrl) { URL.revokeObjectURL(task.synthesizedUrl); task.synthesizedUrl = '' }
  const endpoint = import.meta.env.VITE_TTS_ENDPOINT
  if (!endpoint) {
    taskPreviewMessage.value = '当前为浏览器语音试听演示，接入 TTS 服务后可试听训练音色。'
    speakText(task, text, 'synthesis')
    return
  }
  stopSpeech()
  const controller = new AbortController()
  synthesisController = controller
  activeSpeech.value = `${task.id}-synthesis`
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName: task.name, voiceId: task.id }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error('合成请求失败')
    const blob = await response.blob()
    if (!blob.size || !blob.type.startsWith('audio/')) throw new Error('未返回音频')
    task.synthesizedUrl = URL.createObjectURL(blob)
    taskPreviewMessage.value = '音频已生成，点击播放器试听'
  } catch (error) {
    if (error.name !== 'AbortError') taskPreviewMessage.value = '合成失败，请检查服务配置后重试'
  } finally {
    if (synthesisController === controller) synthesisController = null
    if (activeSpeech.value === `${task.id}-synthesis`) activeSpeech.value = ''
  }
}

function clearAudio() {
  fileSelectionSeq += 1
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  audioUrl.value = ''
  audioFile.value = null
  audioValidationState.value = 'idle'
  audioValidationMessage.value = ''
  transcript.value = ''
  confirmed.value = false
  confirmedTranscript.value = ''
  recognitionState.value = 'idle'
}

function changeMode(nextMode) {
  if (nextMode === mode.value) return
  clearAudio()
  message.value = ''
  mode.value = nextMode
}

async function useAudioFile(file) {
  clearAudio()
  if (!file) return
  const supported = /\.(wav|flac|mp3)$/i.test(file.name)
  if (!supported) { message.value = '仅支持 WAV、FLAC、MP3 格式的音频'; return }
  if (file.size > 50 * 1024 * 1024) { message.value = '音频文件不能超过 50MB'; return }
  const selection = fileSelectionSeq
  const url = URL.createObjectURL(file)
  audioFile.value = file
  if (!voiceName.value.trim()) voiceName.value = file.name.replace(/\.[^.]+$/, '').slice(0, 50)
  audioUrl.value = url
  audioValidationState.value = 'checking'
  audioValidationMessage.value = '正在检查音频时长…'
  message.value = ''
  if (mode.value === 'upload') recognizeAudio()
  else { transcript.value = scripts[selectedScript.value].text; recognitionState.value = 'guided' }
  const duration = await new Promise((resolve) => {
    const probe = document.createElement('audio')
    probe.preload = 'metadata'
    let timer
    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      probe.onloadedmetadata = null
      probe.onerror = null
      probe.removeAttribute('src')
      probe.load()
      resolve(value)
    }
    probe.onloadedmetadata = () => finish(probe.duration)
    probe.onerror = () => finish(NaN)
    timer = window.setTimeout(() => finish(NaN), 8000)
    probe.src = url
  })
  if (selection !== fileSelectionSeq) return
  if (!Number.isFinite(duration)) {
    audioValidationState.value = 'invalid'
    audioValidationMessage.value = '无法读取音频时长，请检查文件是否可播放并重新上传'
    return
  }
  if (duration > 20) {
    audioValidationState.value = 'invalid'
    audioValidationMessage.value = `音频时长不能超过 20 秒，当前为 ${duration.toFixed(1)} 秒，请重新上传`
    return
  }
  audioValidationState.value = 'valid'
  audioValidationMessage.value = `音频时长 ${duration.toFixed(1)} 秒，符合训练要求`
}

function handleFileChange(event) {
  useAudioFile(event.target.files?.[0])
  event.target.value = ''
}

function recognizeAudio() {
  if (!audioFile.value) return
  confirmed.value = false
  confirmedTranscript.value = ''
  transcript.value = '大家好，欢迎来到数字人平台。今天我将为您介绍平台的核心功能与使用方式。'
  recognitionState.value = 'demo'
  message.value = ''
}

function confirmTranscript() {
  if (!transcript.value.trim()) { message.value = '请先核对并填写音频文案'; return }
  confirmedTranscript.value = transcript.value.trim()
  confirmed.value = true
  message.value = '文案已确认'
}

function handleTranscriptInput() {
  confirmed.value = false
  confirmedTranscript.value = ''
  message.value = ''
}

function submitTraining() {
  if (!voiceName.value.trim()) { message.value = '请填写音色名称'; return }
  if (!audioFile.value) { message.value = '请先上传音频'; return }
  if (audioValidationState.value !== 'valid') { message.value = '请上传时长不超过 20 秒的有效音频'; return }
  if (!canSubmitTraining.value) { message.value = '请先确认音频文案'; return }
  tasks.value.unshift({ id: Date.now(), name: voiceName.value.trim(), file: audioFile.value.name, method: mode.value === 'upload' ? '自由上传' : '固定文案上传', createdAt: new Date().toLocaleString('zh-CN', { hour12: false }), status: '待训练（演示）', originalText: transcript.value.trim(), originalUrl: audioUrl.value, synthesisText: '', demo: false })
  audioUrl.value = ''
  voiceName.value = ''
  clearAudio()
  message.value = '训练任务已加入演示列表'
}

onBeforeUnmount(() => {
  stopSpeech()
  clearAudio()
  tasks.value.forEach((task) => {
    if (task.originalUrl) URL.revokeObjectURL(task.originalUrl)
    if (task.synthesizedUrl) URL.revokeObjectURL(task.synthesizedUrl)
  })
})
</script>

<template>
  <div class="voice-training-page" style="--accent: #7863e7">
    <header class="page-heading">
      <div>
        <div class="eyebrow"><span></span> VOICE TRAINING</div>
        <h1>音色训练</h1>
        <p>上传声音样本，核对音频文案，创建专属音色训练任务。</p>
      </div>
    </header>

    <section class="voice-flow-card" aria-label="音色训练流程">
      <div><b>01</b><strong>提供音频</strong><span>自由上传或按固定文案录制后上传</span></div>
      <div><b>02</b><strong>核对文案</strong><span>识别结果由用户确认</span></div>
      <div><b>03</b><strong>提交训练</strong><span>生成音色训练任务</span></div>
    </section>

    <div class="voice-training-layout">
      <section class="voice-training-card">
        <div class="voice-section-heading"><div><h2>新建音色训练</h2><p>可自由上传音频，也可参考固定文案录制后上传。</p></div><AppIcon name="mic" :size="24" /></div>
        <div class="voice-method-tabs" role="tablist" aria-label="音频提供方式">
          <button type="button" role="tab" :aria-selected="mode === 'upload'" :class="{ active: mode === 'upload' }" @click="changeMode('upload')"><AppIcon name="upload" :size="17" />自由上传音频 <small>主要方案</small></button>
          <button type="button" role="tab" :aria-selected="mode === 'guided'" :class="{ active: mode === 'guided' }" @click="changeMode('guided')"><AppIcon name="mic" :size="17" />固定文案引导录制 <small>辅助方案</small></button>
        </div>

        <div class="voice-form-field"><label for="voice-training-name">音色名称</label><input id="voice-training-name" v-model="voiceName" maxlength="50" placeholder="例如：品牌讲解员音色" /></div>

        <template v-if="mode === 'upload'">
          <div class="voice-form-field"><label for="voice-audio-input">上传音频素材</label>
            <label class="voice-upload-zone" for="voice-audio-input"><AppIcon name="upload" :size="24" /><strong>{{ audioFile ? audioFile.name : '点击选择音频文件' }}</strong><span>仅支持 WAV、FLAC、MP3；建议 5–10 秒，最长 20 秒；最大 50MB</span></label>
            <input id="voice-audio-input" class="voice-visually-hidden" type="file" accept=".wav,.flac,.mp3" @change="handleFileChange" />
          </div>
        </template>
        <template v-else>
          <div class="voice-form-field"><label for="voice-script-select">选择固定文案</label><select id="voice-script-select" v-model.number="selectedScript" @change="clearAudio"><option v-for="(item, index) in scripts" :key="item.title" :value="index">{{ item.title }}</option></select></div>
          <div class="voice-script-box"><strong>录制文案</strong><p>{{ scripts[selectedScript].text }}</p><span>请在安静环境中朗读并录制，建议 5–10 秒、最长 20 秒；上传后核对音频与文案是否一致。</span></div>
          <div class="voice-form-field voice-guided-upload"><label for="voice-guided-upload">上传按此文案录制的音频</label><label class="voice-upload-zone" for="voice-guided-upload"><AppIcon name="upload" :size="24" /><strong>{{ audioFile ? audioFile.name : '点击选择录制好的音频文件' }}</strong><span>仅支持 WAV、FLAC、MP3；建议 5–10 秒，最长 20 秒；最大 50MB</span></label><input id="voice-guided-upload" class="voice-visually-hidden" type="file" accept=".wav,.flac,.mp3" @change="handleFileChange" /></div>
        </template>

        <div v-if="audioUrl" class="voice-training-audio-preview"><div><AppIcon name="mic" :size="17" /><strong>音频试听</strong><span>{{ audioFile.name }}</span></div><audio :src="audioUrl" controls preload="metadata" /><p class="voice-audio-validation" :class="audioValidationState" role="status">{{ audioValidationMessage }}</p></div>

        <div v-if="audioFile" class="voice-transcript-panel"><div class="voice-transcript-heading"><strong>{{ mode === 'upload' ? '音频识别文案' : '固定文案确认' }}</strong><button v-if="mode === 'upload'" type="button" @click="recognizeAudio">恢复模拟文案</button><span>{{ mode === 'upload' ? '请对照原始音频核对内容，有误可直接修改' : '请核对录音与固定文案是否一致' }}</span></div>
          <p v-if="mode === 'upload' && recognitionState === 'demo'" class="voice-demo-note">以下为固定的模拟识别文案，请按实际音频核对并修改后确认。</p>
          <label class="voice-transcript-label" for="voice-recognized-text">{{ mode === 'upload' ? '识别结果（可编辑）' : '录音文案（可编辑）' }}</label>
          <textarea id="voice-recognized-text" v-model="transcript" rows="5" maxlength="2000" placeholder="音频文案将在这里显示，请核对并确认" @input="handleTranscriptInput" />
          <div class="voice-confirm-row"><span :class="{ confirmed }">{{ confirmed ? '文案已确认' : '请核对文案并确认；修改后需重新确认' }}</span><button type="button" :disabled="!transcript.trim()" @click="confirmTranscript">确认文案无误</button></div>
        </div>
        <p v-if="message" class="voice-form-message" role="status">{{ message }}</p>
        <div class="voice-submit-row"><span role="status">{{ submitBlockReason }}</span><button type="button" class="primary-button" :disabled="!canSubmitTraining" @click="submitTraining">正式提交训练</button></div>
      </section>

      <aside class="voice-tips-card"><h2>音频准备建议</h2><ul><li>训练音频仅支持 WAV、FLAC、MP3；建议 5–10 秒，最长不超过 20 秒。</li><li>在安静环境中录制，尽量减少回声、音乐和背景杂音。</li><li>只保留同一人的声音，语速自然，发音清晰。</li><li>上传后认真核对文案，确保文字与实际音频一致。</li></ul><div><AppIcon name="info" :size="18" /><p>当前页面演示音色训练交互。真实 ASR 识别与音色模型训练需要后端服务接入。</p></div></aside>
    </div>

    <section class="voice-task-card"><div class="voice-section-heading"><div><h2>训练任务</h2><p>查看音色、原始音频与文案合成试听</p></div><span>{{ tasks.length }} 条</span></div><div class="voice-task-list"><article v-for="task in tasks" :key="task.id" class="voice-task-detail"><div class="voice-task-heading"><span class="voice-task-icon"><AppIcon name="mic" :size="19" /></span><div><strong>{{ task.name }}</strong><small>训练时间：{{ task.createdAt }} · {{ task.method }}</small></div><em>{{ task.status }}</em></div><div class="voice-task-preview-grid"><div class="voice-task-original"><strong>原始音频试听</strong><small>{{ task.file }}</small><audio v-if="task.originalUrl" :src="task.originalUrl" controls preload="metadata" /><button v-else type="button" @click="speakText(task, task.originalText, 'original')">{{ activeSpeech === `${task.id}-original` ? '播放中，点击其他试听可切换' : '试听原始音频' }}</button><p v-if="task.demo">示例任务暂无原始文件，使用浏览器语音演示。</p></div><div class="voice-task-synthesis"><label :for="`voice-synthesis-${task.id}`">输入文案合成试听</label><textarea :id="`voice-synthesis-${task.id}`" v-model="task.synthesisText" rows="2" maxlength="500" placeholder="输入需要试听的文案" @input="changeSynthesisText(task)" /><div><button type="button" :disabled="!task.synthesisText?.trim()" @click="synthesizeTask(task)"><AppIcon name="video" :size="15" />{{ activeSpeech === `${task.id}-synthesis` ? '合成或播放中…' : '合成并试听' }}</button><span>最多 500 字</span></div><audio v-if="task.synthesizedUrl" :src="task.synthesizedUrl" controls autoplay preload="metadata" /></div></div></article></div><p v-if="taskPreviewMessage" class="voice-form-message" role="status">{{ taskPreviewMessage }}</p></section>
  </div>
</template>
