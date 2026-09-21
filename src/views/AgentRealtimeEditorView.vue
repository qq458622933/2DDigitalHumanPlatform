<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { moduleData } from '../config/modules'
import backgroundPreview from '../assets/avatar-previews/background-tech-blue.svg'
import silentAvatarPreview from '../assets/0静默.webp'
import actionSilentPreview from '../assets/actions/0静默.webp'
import actionHandsOpenPreview from '../assets/actions/1双手摊开.webp'
import actionRightHandPreview from '../assets/actions/2右手摊开.webp'
import actionLeftHandPreview from '../assets/actions/3左手摊开.webp'
import actionRestCrossedPreview from '../assets/actions/4双手交叠稍息.webp'
import actionRestPreview from '../assets/actions/5稍息.webp'
import actionHandsCrossedPreview from '../assets/actions/6双手交叠.webp'
import walkRightPreview from '../assets/zoudongActions/3向右走2k.webp'
import walkLeftPreview from '../assets/zoudongActions/3向左走2k.webp'

const route = useRoute()
const router = useRouter()

const currentAgent = computed(() => (
  moduleData.agents.rows.find((row) => row.subtitle === route.params.agentId)
  || moduleData.agents.rows[0]
))
const linkedDigitalHuman = computed(() => (
  moduleData.digitalHumans.rows.find((row) => row.extra === currentAgent.value.name)
  || moduleData.digitalHumans.rows[0]
))

const pages = ref([
  { id: 1, name: '页面 1', narration: String(route.query.answer || '欢迎来到2D数字人平台，现在为您介绍平台的核心功能与使用方式。') },
  { id: 2, name: '页面 2', narration: '通过形象训练、知识库和智能体配置，快速创建您的专属数字人应用。' },
  { id: 3, name: '页面 3', narration: '完成配置后，即可预览内容并发布到目标设备。' },
])
const activePageId = ref(1)
const selectedMenu = ref('数字人')
const canvasRef = ref(null)
const narrationEditor = ref(null)
const selectedNarrationTagId = ref(null)
const pageNarrationTags = ref({ 1: [], 2: [], 3: [] })
const pageNarrationHtml = ref({
  1: pages.value[0].narration,
  2: pages.value[1].narration,
  3: pages.value[2].narration,
})
const canvasRenderedWidth = ref(0)
const defaultAvatarSettings = { x: 72, y: 55, scale: 40, opacity: 100, rotation: 0 }
const avatarX = ref(defaultAvatarSettings.x)
const avatarY = ref(defaultAvatarSettings.y)
const avatarScale = ref(defaultAvatarSettings.scale)
const avatarOpacity = ref(defaultAvatarSettings.opacity)
const avatarRotation = ref(defaultAvatarSettings.rotation)
const pageAvatarSettings = ref({
  1: { ...defaultAvatarSettings },
  2: { ...defaultAvatarSettings },
  3: { ...defaultAvatarSettings },
})
const canvasZoom = ref(100)
const canvasWidth = ref(1920)
const canvasHeight = ref(1080)
const canvasSizePreset = ref('1920x1080')
const canvasApplicationScope = ref('global')
const globalCanvasSettings = ref({ width: 1920, height: 1080, preset: '1920x1080' })
const pageCanvasSettings = ref({
  1: { width: 1920, height: 1080, preset: '1920x1080' },
  2: { width: 1920, height: 1080, preset: '1920x1080' },
  3: { width: 1920, height: 1080, preset: '1920x1080' },
})
const pageContentHidden = ref(false)
const pageContentApplicationScope = ref('global')
const externalScreenType = ref('link')
const externalScreenUrl = ref('')
const externalScreenFileName = ref('')
const externalScreenFileUrl = ref('')
const externalScreenObjectUrls = new Set()
const globalPageContentSettings = ref({ hidden: false, screenType: 'link', url: '', fileName: '', fileUrl: '' })
const pageContentSettings = ref({
  1: { ...globalPageContentSettings.value },
  2: { ...globalPageContentSettings.value },
  3: { ...globalPageContentSettings.value },
})
const subtitleEnabled = ref(true)
const subtitleHidden = ref(false)
const subtitleApplicationScope = ref('global')
const subtitlePosition = ref('bottom')
const subtitleX = ref(50)
const subtitleY = ref(90)
const subtitleSize = ref(22)
const subtitleColor = ref('#ffffff')
const subtitleStyle = ref('bar')
const globalSubtitleSettings = ref({ enabled: true, hidden: false, position: 'bottom', x: 50, y: 90, size: 22, color: '#ffffff', style: 'bar' })
const pageSubtitleSettings = ref({
  1: { ...globalSubtitleSettings.value },
  2: { ...globalSubtitleSettings.value },
  3: { ...globalSubtitleSettings.value },
})
const popupComponentApplicationScope = ref('global')
const popupComponentPosition = ref('center')
const popupComponentX = ref(50)
const popupComponentY = ref(50)
const popupComponentSize = ref(58)
const popupComponentRatio = ref('16:9')
const globalPopupComponentSettings = ref({ position: 'center', x: 50, y: 50, size: 58, ratio: '16:9' })
const pagePopupComponentSettings = ref({
  1: { ...globalPopupComponentSettings.value },
  2: { ...globalPopupComponentSettings.value },
  3: { ...globalPopupComponentSettings.value },
})
const pageTransition = ref('none')
const toastVisible = ref(false)
const toastMessage = ref('')
const popupConfigModalOpen = ref(false)
const pauseConfigModalOpen = ref(false)
const pauseSeconds = ref(1)
const actionPickerOpen = ref(false)
const actionPickerMode = ref('action')
const activeActionAssetType = ref('通用动作')
const selectedActionId = ref('')
const popupContentType = ref('web')
const popupContentUrl = ref('')
const popupContentFileName = ref('')
const popupVideoAudioEnabled = ref(false)
const qnaInfoModalOpen = ref(false)
const qnaQuestion = ref(String(route.query.question || ''))
const initialSimilarQuestions = String(route.query.similarQuestions || '').split('\n').map((item) => item.trim()).filter(Boolean)
const qnaSimilarQuestions = ref(initialSimilarQuestions.length ? initialSimilarQuestions : [''])
let dragState = null
let subtitleDragState = null
let popupComponentDragState = null
let toastTimer = null
let narrationTagSequence = 0
let savedNarrationRange = null

const activePage = computed(() => pages.value.find((page) => page.id === activePageId.value) || pages.value[0])
const activeNarrationTags = computed(() => pageNarrationTags.value[activePageId.value] || [])
const activeNarrationHtml = computed(() => pageNarrationHtml.value[activePageId.value] || '')
const selectedNarrationTag = computed(() => activeNarrationTags.value.find((tag) => tag.id === selectedNarrationTagId.value) || null)
const selectedNarrationTagDescription = computed(() => ({
  剧本: '标记剧本开始位置，被打断后可通过剧本恢复标签继续播报。',
  弹窗: '播报到此标签时展示已配置的网页、图片或视频内容。',
  停顿: '播报到此标签时按照标签指令设置的时长暂停。',
  人物动作: '播报到此标签时触发数字人的普通人物动作。',
  人物走动: '播报到此标签时触发数字人的走动动作。',
  剧本恢复: '恢复此前被打断的剧本内容并继续播报。',
}[selectedNarrationTag.value?.label] || '用于控制数字人解说流程。'))
const selectedPopupTag = computed(() => selectedNarrationTag.value?.label === '弹窗' ? selectedNarrationTag.value : null)
const selectedActionTag = computed(() => selectedNarrationTag.value?.label === '人物动作' ? selectedNarrationTag.value : null)
const selectedWalkingTag = computed(() => selectedNarrationTag.value?.label === '人物走动' ? selectedNarrationTag.value : null)
const walkingPreviewX = computed(() => {
  if (!selectedWalkingTag.value) return avatarX.value
  const walksLeft = /left|向左/i.test(`${selectedWalkingTag.value.actionId || ''}${selectedWalkingTag.value.detail || ''}`)
  const direction = walksLeft ? -1 : 1
  const distance = Math.max(24, Math.min(34, Number(avatarScale.value) * 0.75))
  const preferredPosition = Number(avatarX.value) + direction * distance
  return Math.round(Math.min(92, Math.max(8, preferredPosition)) * 10) / 10
})
const walkingPreviewDistance = computed(() => Math.round(Math.abs(Number(walkingPreviewX.value) - Number(avatarX.value)) * 10) / 10)
const walkingDistanceGuideStyle = computed(() => ({
  left: `${Math.min(Number(avatarX.value), Number(walkingPreviewX.value))}%`,
  top: `${avatarY.value}%`,
  width: `${walkingPreviewDistance.value}%`,
}))
const popupComponentAspectRatio = computed(() => ({ '16:9': '16 / 9', '4:3': '4 / 3', '1:1': '1 / 1', '9:16': '9 / 16' }[popupComponentRatio.value] || '16 / 9'))
const popupComponentDisplaySize = computed(() => popupComponentSize.value * ({ '16:9': 1, '4:3': 0.88, '1:1': 0.68, '9:16': 0.4 }[popupComponentRatio.value] || 1))
const selectedMenuDescription = computed(() => ({
  比例大小: '设置当前页面的背景尺寸和画布显示比例',
  页面内容: '配置页面内容的预览状态和外部大屏素材',
  数字人: '调整数字人在画布中的位置、大小和显示效果',
  字幕: '设置数字人解说字幕的显示方式和视觉样式',
  弹窗: '设置弹窗组件的位置、大小和画面比例',
  解说标签: '查看和编辑当前选中的解说词标签',
}[selectedMenu.value]))
const narrationTools = [
  { label: '剧本', icon: 'file', token: '![script](script_01)', insertAtStart: true, tooltip: '添加剧本标签后可通过剧本恢复标签恢复被打断的剧本内容' },
  { label: '弹窗', icon: 'message', token: '![popup](popup_01)' },
  { label: '停顿', icon: 'clock', token: '![pause](1000)' },
  { label: '人物动作', icon: 'sparkles', token: '![action](action_01)' },
  { label: '人物走动', icon: 'workflow', token: '![walk](walk_01)' },
  { label: '剧本恢复', icon: 'book', token: '![script_resume]' },
]
const actionAssetTypes = ['通用动作', '自定义动作']
const walkingAssetTypes = ['通用走动动作', '走动动作']
const defaultActionAssets = [
  { id: 'xiaoran_00', name: '静默', type: '通用动作', preview: actionSilentPreview },
  { id: 'xiaoran_action01', name: '双手摊开', type: '通用动作', preview: actionHandsOpenPreview },
  { id: 'xiaoran_action02', name: '右手摊开', type: '通用动作', preview: actionRightHandPreview },
  { id: 'xiaoran_action03', name: '左手摊开', type: '通用动作', preview: actionLeftHandPreview },
  { id: 'xiaoran_action04', name: '双手交叠稍息', type: '通用动作', preview: actionRestCrossedPreview },
  { id: 'xiaoran_action05', name: '稍息', type: '通用动作', preview: actionRestPreview },
  { id: 'xiaoran_action06', name: '双手交叠', type: '通用动作', preview: actionHandsCrossedPreview },
  { id: 'custom_wave_01', name: '欢迎挥手形象', type: '自定义动作', preview: moduleData.digitalHumans.rows[1].preview },
  { id: 'custom_like_02', name: '点赞互动形象', type: '自定义动作', preview: moduleData.digitalHumans.rows[0].preview },
  { id: 'custom_goodbye_03', name: '结束致意形象', type: '自定义动作', preview: moduleData.digitalHumans.rows[3].preview },
]
const actionAssets = computed(() => {
  const managedActions = moduleData.assets.rows
    .filter((row) => row.category === '动作管理' && actionAssetTypes.includes(row.actionAssetType) && row.actionId)
    .map((row, index) => ({
      id: row.actionId,
      name: row.name,
      type: row.actionAssetType,
      preview: row.preview || moduleData.digitalHumans.rows[index % moduleData.digitalHumans.rows.length].preview,
    }))
  return [...new Map([...managedActions, ...defaultActionAssets].map((action) => [action.id, action])).values()]
})
const defaultWalkingAssets = [
  { id: 'walk_common_right', name: '向右走', type: '通用走动动作', preview: walkRightPreview },
  { id: 'walk_common_left', name: '向左走', type: '通用走动动作', preview: walkLeftPreview },
  { id: 'walk_exhibition_01', name: '展厅引导走动', type: '走动动作', preview: moduleData.digitalHumans.rows[0].preview },
  { id: 'walk_stage_02', name: '舞台横向走动', type: '走动动作', preview: moduleData.digitalHumans.rows[1].preview },
]
const walkingAssets = computed(() => {
  const managedWalkingActions = moduleData.assets.rows
    .filter((row) => row.category === '动作管理' && walkingAssetTypes.includes(row.actionAssetType) && row.actionId)
    .map((row, index) => ({
      id: row.actionId,
      name: row.name,
      type: row.actionAssetType,
      preview: row.preview || moduleData.digitalHumans.rows[index % moduleData.digitalHumans.rows.length].preview,
    }))
  return [...new Map([...managedWalkingActions, ...defaultWalkingAssets].map((action) => [action.id, action])).values()]
})
const pickerAssetTypes = computed(() => actionPickerMode.value === 'walk' ? walkingAssetTypes : actionAssetTypes)
const pickerAssets = computed(() => actionPickerMode.value === 'walk' ? walkingAssets.value : actionAssets.value)
const filteredActionAssets = computed(() => pickerAssets.value.filter((action) => action.type === activeActionAssetType.value))
const narrationTagSymbols = {
  剧本: '▤',
  弹窗: '▣',
  停顿: '◷',
  人物动作: '✦',
  人物走动: '◇',
  剧本恢复: '↺',
}
const narrationTagTones = {
  剧本: 'violet',
  弹窗: 'blue',
  停顿: 'yellow',
  人物动作: 'orange',
  人物走动: 'orange',
  剧本恢复: 'violet',
}
const canvasDisplayWidth = computed(() => {
  const ratio = Number(canvasWidth.value) / Math.max(1, Number(canvasHeight.value))
  if (ratio < 0.8) return canvasZoom.value * 0.48
  if (ratio < 1.2) return canvasZoom.value * 0.72
  return canvasZoom.value
})
const embeddedPageScale = computed(() => canvasRenderedWidth.value / Math.max(1, Number(canvasWidth.value)))
const pageTransitionName = computed(() => ({
  horizontal: 'canvas-slide-horizontal',
  vertical: 'canvas-slide-vertical',
  none: 'canvas-no-transition',
}[pageTransition.value] || 'canvas-no-transition'))

function showToast(message) {
  toastMessage.value = message
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 1800)
}

async function previewAllPages() {
  if (pages.value.length && activePageId.value !== pages.value[0].id) await switchPage(pages.value[0].id)
  showToast(`开始按顺序预览全部 ${pages.value.length} 个页面`)
}

function addPage() {
  const id = Math.max(...pages.value.map((page) => page.id), 0) + 1
  pages.value.push({ id, name: `页面 ${pages.value.length + 1}`, narration: '请输入本页面的解说词内容。' })
  pageCanvasSettings.value[id] = { ...globalCanvasSettings.value }
  pageContentSettings.value[id] = { ...globalPageContentSettings.value }
  pageSubtitleSettings.value[id] = { ...globalSubtitleSettings.value }
  pagePopupComponentSettings.value[id] = { ...globalPopupComponentSettings.value }
  pageAvatarSettings.value[id] = { ...defaultAvatarSettings }
  pageNarrationTags.value[id] = []
  pageNarrationHtml.value[id] = '请输入本页面的解说词内容。'
  activePageId.value = id
  loadCanvasSettings(id)
  loadPageContentSettings(id)
  loadSubtitleSettings(id)
  loadPopupComponentSettings(id)
  loadAvatarSettings(id)
  nextTick(renderNarrationEditor)
}

function duplicatePage(page) {
  syncNarrationEditor()
  const id = Math.max(...pages.value.map((item) => item.id), 0) + 1
  pages.value.push({ id, name: `页面 ${pages.value.length + 1}`, narration: page.narration })
  pageCanvasSettings.value[id] = { ...(pageCanvasSettings.value[page.id] || globalCanvasSettings.value) }
  pageContentSettings.value[id] = { ...(pageContentSettings.value[page.id] || globalPageContentSettings.value) }
  pageSubtitleSettings.value[id] = { ...(pageSubtitleSettings.value[page.id] || globalSubtitleSettings.value) }
  pagePopupComponentSettings.value[id] = { ...(pagePopupComponentSettings.value[page.id] || globalPopupComponentSettings.value) }
  pageAvatarSettings.value[id] = { ...(pageAvatarSettings.value[page.id] || defaultAvatarSettings) }
  pageNarrationTags.value[id] = (pageNarrationTags.value[page.id] || []).map((tag) => ({ ...tag }))
  pageNarrationHtml.value[id] = pageNarrationHtml.value[page.id] || page.narration
  activePageId.value = id
  loadCanvasSettings(id)
  loadPageContentSettings(id)
  loadSubtitleSettings(id)
  loadPopupComponentSettings(id)
  loadAvatarSettings(id)
  nextTick(renderNarrationEditor)
  showToast('页面已复制')
}

function removePage(page) {
  if (pages.value.length === 1) return showToast('至少需要保留一个页面')
  const index = pages.value.findIndex((item) => item.id === page.id)
  pages.value.splice(index, 1)
  delete pageCanvasSettings.value[page.id]
  delete pageContentSettings.value[page.id]
  delete pageSubtitleSettings.value[page.id]
  delete pagePopupComponentSettings.value[page.id]
  delete pageAvatarSettings.value[page.id]
  delete pageNarrationTags.value[page.id]
  delete pageNarrationHtml.value[page.id]
  if (activePageId.value === page.id) activePageId.value = pages.value[Math.max(0, index - 1)].id
  loadCanvasSettings(activePageId.value)
  loadPageContentSettings(activePageId.value)
  loadSubtitleSettings(activePageId.value)
  loadPopupComponentSettings(activePageId.value)
  loadAvatarSettings(activePageId.value)
  nextTick(renderNarrationEditor)
}

function selectMenu(menu) {
  if (menu !== '解说标签') selectedNarrationTagId.value = null
  selectedMenu.value = menu
}

async function switchPage(pageId) {
  if (activePageId.value === pageId) return
  syncNarrationEditor()
  activePageId.value = pageId
  savedNarrationRange = null
  loadCanvasSettings(pageId)
  loadPageContentSettings(pageId)
  loadSubtitleSettings(pageId)
  loadPopupComponentSettings(pageId)
  loadAvatarSettings(pageId)
  await nextTick()
  renderNarrationEditor()
  observeCanvasSize()
}

function saveAvatarSettings() {
  pageAvatarSettings.value[activePageId.value] = {
    x: Number(avatarX.value),
    y: Number(avatarY.value),
    scale: Number(avatarScale.value),
    opacity: Number(avatarOpacity.value),
    rotation: Number(avatarRotation.value),
  }
}

function loadAvatarSettings(pageId) {
  const settings = pageAvatarSettings.value[pageId] || defaultAvatarSettings
  avatarX.value = settings.x
  avatarY.value = settings.y
  avatarScale.value = settings.scale
  avatarOpacity.value = settings.opacity
  avatarRotation.value = settings.rotation
}

function setAvatarHorizontalPosition(position) {
  avatarX.value = position
  saveAvatarSettings()
}

function startAvatarDrag(event) {
  if (!canvasRef.value) return
  selectedMenu.value = '数字人'
  const rect = canvasRef.value.getBoundingClientRect()
  dragState = {
    startX: event.clientX,
    startY: event.clientY,
    originX: avatarX.value,
    originY: avatarY.value,
    width: rect.width,
    height: rect.height,
  }
  window.addEventListener('pointermove', moveAvatar)
  window.addEventListener('pointerup', stopAvatarDrag, { once: true })
}

function moveAvatar(event) {
  if (!dragState) return
  const nextX = dragState.originX + ((event.clientX - dragState.startX) / dragState.width) * 100
  const nextY = dragState.originY + ((event.clientY - dragState.startY) / dragState.height) * 100
  avatarX.value = Math.min(96, Math.max(4, Math.round(nextX * 10) / 10))
  avatarY.value = Math.min(96, Math.max(4, Math.round(nextY * 10) / 10))
}

function stopAvatarDrag() {
  if (dragState) saveAvatarSettings()
  dragState = null
  window.removeEventListener('pointermove', moveAvatar)
}

function startSubtitleDrag(event) {
  if (!canvasRef.value) return
  selectedMenu.value = '字幕'
  const rect = canvasRef.value.getBoundingClientRect()
  subtitleDragState = {
    startX: event.clientX,
    startY: event.clientY,
    originX: subtitleX.value,
    originY: subtitleY.value,
    width: rect.width,
    height: rect.height,
  }
  window.addEventListener('pointermove', moveSubtitle)
  window.addEventListener('pointerup', stopSubtitleDrag, { once: true })
}

function moveSubtitle(event) {
  if (!subtitleDragState) return
  const nextX = subtitleDragState.originX + ((event.clientX - subtitleDragState.startX) / subtitleDragState.width) * 100
  const nextY = subtitleDragState.originY + ((event.clientY - subtitleDragState.startY) / subtitleDragState.height) * 100
  subtitleX.value = Math.min(94, Math.max(6, Math.round(nextX * 10) / 10))
  subtitleY.value = Math.min(94, Math.max(6, Math.round(nextY * 10) / 10))
  subtitlePosition.value = 'custom'
}

function stopSubtitleDrag() {
  if (subtitleDragState) saveSubtitleSettings()
  subtitleDragState = null
  window.removeEventListener('pointermove', moveSubtitle)
}

function startPopupComponentDrag(event) {
  if (!canvasRef.value) return
  selectedMenu.value = '弹窗'
  const rect = canvasRef.value.getBoundingClientRect()
  popupComponentDragState = {
    startX: event.clientX,
    startY: event.clientY,
    originX: popupComponentX.value,
    originY: popupComponentY.value,
    width: rect.width,
    height: rect.height,
  }
  window.addEventListener('pointermove', movePopupComponent)
  window.addEventListener('pointerup', stopPopupComponentDrag, { once: true })
}

function movePopupComponent(event) {
  if (!popupComponentDragState) return
  const nextX = popupComponentDragState.originX + ((event.clientX - popupComponentDragState.startX) / popupComponentDragState.width) * 100
  const nextY = popupComponentDragState.originY + ((event.clientY - popupComponentDragState.startY) / popupComponentDragState.height) * 100
  popupComponentX.value = Math.min(94, Math.max(6, Math.round(nextX * 10) / 10))
  popupComponentY.value = Math.min(94, Math.max(6, Math.round(nextY * 10) / 10))
  popupComponentPosition.value = 'custom'
}

function stopPopupComponentDrag() {
  if (popupComponentDragState) savePopupComponentSettings()
  popupComponentDragState = null
  window.removeEventListener('pointermove', movePopupComponent)
}

function resizePopupComponentByWheel(event) {
  if (selectedMenu.value !== '弹窗') return
  event.preventDefault()
  const delta = event.deltaY > 0 ? -2 : 2
  popupComponentSize.value = Math.min(88, Math.max(25, popupComponentSize.value + delta))
  savePopupComponentSettings()
}

function resizeAvatarByWheel(event) {
  selectedMenu.value = '数字人'
  const delta = event.deltaY > 0 ? -2 : 2
  avatarScale.value = Math.min(70, Math.max(18, avatarScale.value + delta))
  saveAvatarSettings()
}

let canvasResizeObserver = null

function observeCanvasSize() {
  canvasResizeObserver?.disconnect()
  if (!canvasRef.value) return
  const updateSize = () => { canvasRenderedWidth.value = canvasRef.value?.getBoundingClientRect().width || 0 }
  updateSize()
  canvasResizeObserver = new ResizeObserver(updateSize)
  canvasResizeObserver.observe(canvasRef.value)
}

function adjustCanvasZoom(delta) {
  canvasZoom.value = Math.min(130, Math.max(60, canvasZoom.value + delta))
}

function applyCanvasSize() {
  if (canvasSizePreset.value === 'custom') return
  const [width, height] = canvasSizePreset.value.split('x').map(Number)
  canvasWidth.value = width
  canvasHeight.value = height
  saveCanvasSettings()
}

function useCustomCanvasSize() {
  canvasSizePreset.value = 'custom'
  saveCanvasSettings()
}

function saveCanvasSettings() {
  const settings = {
    width: Number(canvasWidth.value),
    height: Number(canvasHeight.value),
    preset: canvasSizePreset.value,
  }
  if (canvasApplicationScope.value === 'global') {
    globalCanvasSettings.value = { ...settings }
    pages.value.forEach((page) => { pageCanvasSettings.value[page.id] = { ...settings } })
    return
  }
  pageCanvasSettings.value[activePageId.value] = { ...settings }
}

function loadCanvasSettings(pageId) {
  const settings = canvasApplicationScope.value === 'global'
    ? globalCanvasSettings.value
    : pageCanvasSettings.value[pageId] || globalCanvasSettings.value
  canvasWidth.value = settings.width
  canvasHeight.value = settings.height
  canvasSizePreset.value = settings.preset
}

function changeCanvasApplicationScope(scope) {
  canvasApplicationScope.value = scope
  loadCanvasSettings(activePageId.value)
}

function savePageContentSettings() {
  const settings = {
    hidden: pageContentHidden.value,
    screenType: externalScreenType.value,
    url: externalScreenUrl.value,
    fileName: externalScreenFileName.value,
    fileUrl: externalScreenFileUrl.value,
  }
  if (pageContentApplicationScope.value === 'global') {
    globalPageContentSettings.value = { ...settings }
    pages.value.forEach((page) => { pageContentSettings.value[page.id] = { ...settings } })
    return
  }
  pageContentSettings.value[activePageId.value] = { ...settings }
}

function loadPageContentSettings(pageId) {
  const settings = pageContentApplicationScope.value === 'global'
    ? globalPageContentSettings.value
    : pageContentSettings.value[pageId] || globalPageContentSettings.value
  pageContentHidden.value = settings.hidden
  externalScreenType.value = settings.screenType
  externalScreenUrl.value = settings.url
  externalScreenFileName.value = settings.fileName
  externalScreenFileUrl.value = settings.fileUrl || ''
}

function changePageContentApplicationScope(scope) {
  pageContentApplicationScope.value = scope
  loadPageContentSettings(activePageId.value)
}

function togglePageContentHidden() {
  pageContentHidden.value = !pageContentHidden.value
  savePageContentSettings()
}

function changeExternalScreenType(type) {
  externalScreenType.value = type
  externalScreenFileName.value = ''
  externalScreenFileUrl.value = ''
  savePageContentSettings()
}

function handleExternalScreenFile(event) {
  const file = event.target.files?.[0]
  externalScreenFileName.value = file?.name || ''
  externalScreenFileUrl.value = file ? URL.createObjectURL(file) : ''
  if (externalScreenFileUrl.value) externalScreenObjectUrls.add(externalScreenFileUrl.value)
  savePageContentSettings()
}

function saveSubtitleSettings() {
  const settings = {
    enabled: subtitleEnabled.value,
    hidden: subtitleHidden.value,
    position: subtitlePosition.value,
    x: Number(subtitleX.value),
    y: Number(subtitleY.value),
    size: Number(subtitleSize.value),
    color: subtitleColor.value,
    style: subtitleStyle.value,
  }
  if (subtitleApplicationScope.value === 'global') {
    globalSubtitleSettings.value = { ...settings }
    pages.value.forEach((page) => { pageSubtitleSettings.value[page.id] = { ...settings } })
    return
  }
  pageSubtitleSettings.value[activePageId.value] = { ...settings }
}

function loadSubtitleSettings(pageId) {
  const settings = subtitleApplicationScope.value === 'global'
    ? globalSubtitleSettings.value
    : pageSubtitleSettings.value[pageId] || globalSubtitleSettings.value
  subtitleEnabled.value = settings.enabled
  subtitleHidden.value = settings.hidden
  subtitlePosition.value = settings.position
  subtitleX.value = settings.x ?? 50
  subtitleY.value = settings.y ?? ({ top: 10, center: 50, bottom: 90 }[settings.position] || 90)
  subtitleSize.value = settings.size
  subtitleColor.value = settings.color
  subtitleStyle.value = settings.style
}

function changeSubtitleApplicationScope(scope) {
  subtitleApplicationScope.value = scope
  loadSubtitleSettings(activePageId.value)
}

function toggleSubtitleEnabled() {
  subtitleEnabled.value = !subtitleEnabled.value
  saveSubtitleSettings()
}

function toggleSubtitleHidden() {
  subtitleHidden.value = !subtitleHidden.value
  saveSubtitleSettings()
}

function setSubtitlePosition(position) {
  subtitlePosition.value = position
  subtitleX.value = 50
  subtitleY.value = { top: 10, center: 50, bottom: 90 }[position]
  saveSubtitleSettings()
}

function setSubtitleStyle(style) {
  subtitleStyle.value = style
  saveSubtitleSettings()
}

function savePopupComponentSettings() {
  const settings = {
    position: popupComponentPosition.value,
    x: Number(popupComponentX.value),
    y: Number(popupComponentY.value),
    size: Number(popupComponentSize.value),
    ratio: popupComponentRatio.value,
  }
  if (popupComponentApplicationScope.value === 'global') {
    globalPopupComponentSettings.value = { ...settings }
    pages.value.forEach((page) => { pagePopupComponentSettings.value[page.id] = { ...settings } })
    return
  }
  pagePopupComponentSettings.value[activePageId.value] = { ...settings }
}

function loadPopupComponentSettings(pageId) {
  const settings = popupComponentApplicationScope.value === 'global'
    ? globalPopupComponentSettings.value
    : pagePopupComponentSettings.value[pageId] || globalPopupComponentSettings.value
  popupComponentPosition.value = settings.position
  popupComponentX.value = settings.x ?? 50
  popupComponentY.value = settings.y ?? ({ top: 15, center: 50, bottom: 85 }[settings.position] || 50)
  popupComponentSize.value = settings.size
  popupComponentRatio.value = settings.ratio
}

function changePopupComponentApplicationScope(scope) {
  popupComponentApplicationScope.value = scope
  loadPopupComponentSettings(activePageId.value)
}

function setPopupComponentPosition(position) {
  popupComponentPosition.value = position
  popupComponentX.value = 50
  popupComponentY.value = { top: 15, center: 50, bottom: 85 }[position]
  savePopupComponentSettings()
}

function updatePopupComponentCoordinates() {
  popupComponentPosition.value = 'custom'
  popupComponentX.value = Math.min(94, Math.max(6, Number(popupComponentX.value)))
  popupComponentY.value = Math.min(94, Math.max(6, Number(popupComponentY.value)))
  savePopupComponentSettings()
}

function setPopupComponentRatio(ratio) {
  popupComponentRatio.value = ratio
  savePopupComponentSettings()
}

function saveEditor() {
  syncNarrationEditor()
  showToast('实时编辑内容已保存')
}

function addQnaSimilarQuestion() {
  qnaSimilarQuestions.value.push('')
}

function removeQnaSimilarQuestion(index) {
  if (qnaSimilarQuestions.value.length === 1) qnaSimilarQuestions.value[0] = ''
  else qnaSimilarQuestions.value.splice(index, 1)
}

function saveQnaInfo() {
  qnaQuestion.value = qnaQuestion.value.trim()
  if (!qnaQuestion.value) return
  const similarQuestions = qnaSimilarQuestions.value.map((item) => item.trim()).filter(Boolean)
  qnaSimilarQuestions.value = similarQuestions.length ? similarQuestions : ['']
  qnaInfoModalOpen.value = false
  showToast('问题和相似问已保存')
}

function insertNarrationTool(tool) {
  captureNarrationSelection()
  if (tool.label === '弹窗') {
    popupContentType.value = 'web'
    popupContentUrl.value = ''
    popupContentFileName.value = ''
    popupVideoAudioEnabled.value = false
    popupConfigModalOpen.value = true
    return
  }
  if (tool.label === '停顿') {
    pauseSeconds.value = 1
    pauseConfigModalOpen.value = true
    return
  }
  if (tool.label === '人物动作') {
    openActionPicker('action')
    return
  }
  if (tool.label === '人物走动') {
    openActionPicker('walk')
    return
  }
  appendNarrationTag(tool)
}

function appendNarrationTag(tool, detail = '') {
  const tag = { ...tool, id: ++narrationTagSequence, detail }
  if (!pageNarrationTags.value[activePageId.value]) pageNarrationTags.value[activePageId.value] = []
  if (tool.insertAtStart) pageNarrationTags.value[activePageId.value].unshift(tag)
  else pageNarrationTags.value[activePageId.value].push(tag)
  nextTick(() => insertNarrationTagElement(tag, tool.insertAtStart))
  showToast(tool.insertAtStart ? `${tool.label}标签已插入到解说词开头` : `${tool.label}标签已插入`)
}

function removeNarrationTag(tagId) {
  pageNarrationTags.value[activePageId.value] = activeNarrationTags.value.filter((tag) => tag.id !== tagId)
  narrationEditor.value?.querySelector(`[data-tag-id="${tagId}"]`)?.remove()
  if (selectedNarrationTagId.value === tagId) {
    selectedNarrationTagId.value = null
    selectedMenu.value = '数字人'
  }
  syncNarrationEditor()
}

function renderNarrationEditor() {
  const editor = narrationEditor.value
  if (!editor) return
  editor.innerHTML = pageNarrationHtml.value[activePageId.value] || activePage.value.narration || ''
  savedNarrationRange = null
}

function syncNarrationEditor() {
  const editor = narrationEditor.value
  if (!editor) return
  pageNarrationHtml.value[activePageId.value] = editor.innerHTML
  const plainContent = editor.cloneNode(true)
  plainContent.querySelectorAll('.narration-inline-tag').forEach((tag) => tag.remove())
  activePage.value.narration = (plainContent.textContent || '').replace(/\u00a0/g, ' ').trim()
}

function captureNarrationSelection() {
  const editor = narrationEditor.value
  const selection = window.getSelection()
  if (!editor || !selection?.rangeCount) return
  const range = selection.getRangeAt(0)
  if (editor.contains(range.commonAncestorContainer)) savedNarrationRange = range.cloneRange()
}

function createNarrationTagElement(tag) {
  const element = document.createElement('span')
  element.className = 'narration-inline-tag'
  element.contentEditable = 'false'
  element.dataset.tagId = String(tag.id)
  element.dataset.icon = narrationTagSymbols[tag.label] || '◆'
  element.dataset.tone = narrationTagTones[tag.label] || 'violet'
  element.dataset.token = tag.token
  element.title = tag.detail || tag.label

  const label = document.createElement('strong')
  label.textContent = tag.label
  element.appendChild(label)

  if (tag.detail) {
    const detail = document.createElement('small')
    detail.textContent = tag.detail
    element.appendChild(detail)
  }

  const removeButton = document.createElement('button')
  removeButton.type = 'button'
  removeButton.dataset.removeTag = String(tag.id)
  removeButton.setAttribute('aria-label', `删除${tag.label}标签`)
  removeButton.textContent = '×'
  element.appendChild(removeButton)
  return element
}

function insertNarrationTagElement(tag, insertAtStart = false) {
  const editor = narrationEditor.value
  if (!editor) return
  editor.focus()
  const tagElement = createNarrationTagElement(tag)
  const spacer = document.createTextNode('\u00a0')
  let range

  if (insertAtStart) {
    editor.insertBefore(tagElement, editor.firstChild)
    editor.insertBefore(spacer, tagElement.nextSibling)
    range = document.createRange()
    range.setStartAfter(spacer)
  } else {
    range = savedNarrationRange?.cloneRange()
    if (!range || !editor.contains(range.commonAncestorContainer)) {
      range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
    }
    range.deleteContents()
    range.insertNode(spacer)
    range.insertNode(tagElement)
    range.setStartAfter(spacer)
  }

  range.collapse(true)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  savedNarrationRange = range.cloneRange()
  syncNarrationEditor()
}

function handleNarrationEditorClick(event) {
  const removeButton = event.target.closest('[data-remove-tag]')
  if (removeButton) {
    event.preventDefault()
    event.stopPropagation()
    removeNarrationTag(Number(removeButton.dataset.removeTag))
    return
  }

  const tagElement = event.target.closest('.narration-inline-tag')
  if (tagElement) {
    const tagId = Number(tagElement.dataset.tagId)
    if (selectedNarrationTagId.value === tagId && selectedMenu.value === '解说标签') {
      cancelNarrationTagSelection()
      return
    }
    selectedNarrationTagId.value = tagId
    selectedMenu.value = '解说标签'
    updateNarrationTagSelectionStyles()
    return
  }

  if (selectedMenu.value === '解说标签') cancelNarrationTagSelection()
  captureNarrationSelection()
}

function cancelNarrationTagSelection(nextMenu = '数字人') {
  selectedNarrationTagId.value = null
  if (selectedMenu.value === '解说标签') selectedMenu.value = nextMenu
  updateNarrationTagSelectionStyles()
}

function updateNarrationTagSelectionStyles() {
  narrationEditor.value?.querySelectorAll('.narration-inline-tag').forEach((element) => {
    const isSelected = Number(element.dataset.tagId) === selectedNarrationTagId.value && selectedMenu.value === '解说标签'
    element.classList.toggle('selected', isSelected)
  })
}

function updateSelectedNarrationTag() {
  const tag = selectedNarrationTag.value
  const editor = narrationEditor.value
  if (!tag || !editor) return
  const element = editor.querySelector(`[data-tag-id="${tag.id}"]`)
  if (!element) return
  element.dataset.token = tag.token
  element.title = tag.detail || tag.label
  let detailElement = element.querySelector('small')
  if (tag.detail) {
    if (!detailElement) {
      detailElement = document.createElement('small')
      element.insertBefore(detailElement, element.querySelector('button'))
    }
    detailElement.textContent = tag.detail
  } else {
    detailElement?.remove()
  }
  syncNarrationEditor()
}

function deleteSelectedNarrationTag() {
  if (!selectedNarrationTag.value) return
  removeNarrationTag(selectedNarrationTag.value.id)
  selectedNarrationTagId.value = null
  selectedMenu.value = '数字人'
  showToast('解说标签已删除')
}

function changePopupContentType(type) {
  popupContentType.value = type
  popupContentUrl.value = ''
  popupContentFileName.value = ''
  popupVideoAudioEnabled.value = false
}

function handlePopupContentFile(event) {
  popupContentFileName.value = event.target.files?.[0]?.name || ''
}

function closePopupConfigModal() {
  popupConfigModalOpen.value = false
}

function confirmPopupConfig() {
  const tool = narrationTools.find((item) => item.label === '弹窗')
  const typeLabel = { web: '网页', image: '图片', video: '视频' }[popupContentType.value]
  const source = popupContentType.value === 'web' ? popupContentUrl.value : popupContentFileName.value
  const popupTool = {
    ...tool,
    contentType: popupContentType.value,
    source,
    videoAudioEnabled: popupContentType.value === 'video' && popupVideoAudioEnabled.value,
  }
  const audioDescription = popupContentType.value === 'video' ? ` · 音频${popupVideoAudioEnabled.value ? '开启' : '关闭'}` : ''
  appendNarrationTag(popupTool, `${typeLabel} · ${source}${audioDescription}`)
  closePopupConfigModal()
}

function closePauseConfigModal() {
  pauseConfigModalOpen.value = false
}

function confirmPauseConfig() {
  const seconds = Math.min(60, Math.max(0.1, Number(pauseSeconds.value) || 1))
  const normalizedSeconds = Math.round(seconds * 10) / 10
  const baseTool = narrationTools.find((item) => item.label === '停顿')
  const pauseTool = { ...baseTool, token: `![pause](${Math.round(normalizedSeconds * 1000)})` }
  pauseSeconds.value = normalizedSeconds
  appendNarrationTag(pauseTool, `${normalizedSeconds} 秒`)
  closePauseConfigModal()
}

function openActionPicker(mode) {
  actionPickerMode.value = mode
  activeActionAssetType.value = mode === 'walk' ? '通用走动动作' : '通用动作'
  selectedActionId.value = ''
  actionPickerOpen.value = true
}

function closeActionPicker() {
  actionPickerOpen.value = false
  selectedActionId.value = ''
}

function selectActionAssetType(type) {
  activeActionAssetType.value = type
  selectedActionId.value = ''
}

function confirmActionSelection() {
  const action = pickerAssets.value.find((item) => item.id === selectedActionId.value)
  if (!action) return
  const isWalking = actionPickerMode.value === 'walk'
  const baseTool = narrationTools.find((item) => item.label === (isWalking ? '人物走动' : '人物动作'))
  const actionTool = {
    ...baseTool,
    token: `![${isWalking ? 'walk' : 'action'}](${action.id})`,
    actionId: action.id,
    actionType: action.type,
    preview: action.preview,
  }
  appendNarrationTag(actionTool, action.name)
  closeActionPicker()
}

onMounted(() => nextTick(() => {
  observeCanvasSize()
  renderNarrationEditor()
}))

watch([activePageId, canvasWidth, canvasHeight, canvasZoom], () => nextTick(observeCanvasSize))
watch(activePageId, () => {
  selectedNarrationTagId.value = null
  if (selectedMenu.value === '解说标签') selectedMenu.value = '数字人'
})
watch(selectedMenu, (menu) => {
  if (menu !== '解说标签') selectedNarrationTagId.value = null
  nextTick(updateNarrationTagSelectionStyles)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', moveAvatar)
  window.removeEventListener('pointermove', moveSubtitle)
  window.removeEventListener('pointermove', movePopupComponent)
  canvasResizeObserver?.disconnect()
  clearTimeout(toastTimer)
  externalScreenObjectUrls.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<template>
  <div class="realtime-editor-page">
    <header class="realtime-editor-header">
      <div class="realtime-editor-title">
        <button type="button" aria-label="返回智能体问答" @click="router.back()"><AppIcon name="chevron" :size="18" /></button>
        <div>
          <span>问答内容 · 实时编辑</span>
          <h1>{{ currentAgent.name }}场景画面</h1>
        </div>
        <em>自动保存</em>
      </div>
      <div class="realtime-editor-header-actions">
        <button type="button" class="editor-question-button" @click="qnaInfoModalOpen = true"><AppIcon name="edit" :size="16" />问答信息</button>
        <button type="button" class="editor-preview-button" @click="showToast('正在预览当前页面')"><AppIcon name="eye" :size="16" />预览</button>
        <button type="button" class="editor-save-button" @click="saveEditor"><AppIcon name="check" :size="16" />保存编辑</button>
      </div>
    </header>

    <div class="realtime-editor-workspace">
      <aside class="editor-page-panel">
        <div class="editor-panel-heading">
          <div><strong>页面列表</strong><span>{{ pages.length }} 个页面</span></div>
          <button type="button" aria-label="新增页面" @click="addPage"><AppIcon name="plus" :size="15" /></button>
        </div>
        <div class="editor-page-list">
          <article v-for="(page, index) in pages" :key="page.id" class="editor-page-item" :class="{ active: page.id === activePageId }" @click="switchPage(page.id)">
            <span class="editor-page-index">{{ index + 1 }}</span>
            <div class="editor-page-thumbnail">
              <img :src="backgroundPreview" alt="页面背景缩略图" />
              <img class="thumbnail-avatar" :src="silentAvatarPreview" alt="数字人缩略图" />
              <span>{{ page.name }}</span>
            </div>
            <div class="editor-page-actions">
              <button type="button" title="复制页面" @click.stop="duplicatePage(page)"><AppIcon name="copy" :size="12" /></button>
              <button type="button" title="删除页面" @click.stop="removePage(page)"><AppIcon name="trash" :size="12" /></button>
            </div>
          </article>
        </div>
        <div class="editor-page-footer-actions">
          <button type="button" class="editor-preview-all-pages" @click="previewAllPages"><AppIcon name="eye" :size="14" />预览所有页面</button>
          <button type="button" class="editor-add-page" @click="addPage"><AppIcon name="plus" :size="14" />新增页面</button>
        </div>
      </aside>

      <main class="editor-center-panel">
        <nav class="editor-material-toolbar" aria-label="画布素材菜单">
          <div class="editor-material-tools">
            <button v-for="menu in ['比例大小', '页面内容', '数字人', '字幕', '弹窗']" :key="menu" type="button" :class="{ active: selectedMenu === menu }" @click="selectMenu(menu)">
              <AppIcon :name="menu === '比例大小' ? 'video' : menu === '页面内容' ? 'file' : menu === '数字人' ? 'user' : menu === '字幕' ? 'message' : 'layers'" :size="15" />{{ menu }}
            </button>
          </div>
          <div class="editor-canvas-zoom">
            <button type="button" aria-label="缩小画布" @click="adjustCanvasZoom(-10)">−</button>
            <span>{{ canvasZoom }}%</span>
            <button type="button" aria-label="放大画布" @click="adjustCanvasZoom(10)">＋</button>
          </div>
        </nav>

        <section class="editor-canvas-shell">
          <div class="editor-canvas-scroll">
            <Transition :name="pageTransitionName" mode="out-in" @after-enter="observeCanvasSize">
            <div
              :key="activePageId"
              ref="canvasRef"
              class="editor-canvas"
              :style="{ backgroundImage: `url(${backgroundPreview})`, width: `${canvasDisplayWidth}%`, aspectRatio: `${canvasWidth} / ${canvasHeight}` }"
              @click="selectedMenu = '页面内容'"
            >
              <div v-if="!pageContentHidden && externalScreenType === 'link' && externalScreenUrl" class="external-screen-canvas-background">
                <iframe
                  :src="externalScreenUrl"
                  title="外部大屏网页预览"
                  loading="lazy"
                  :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px`, transform: `scale(${embeddedPageScale})` }"
                ></iframe>
              </div>
              <div v-else-if="!pageContentHidden && externalScreenType === 'image' && externalScreenFileUrl" class="external-screen-canvas-background">
                <img :src="externalScreenFileUrl" alt="外部大屏图片背景" />
              </div>
              <div v-else-if="!pageContentHidden && externalScreenType === 'video' && externalScreenFileUrl" class="external-screen-canvas-background">
                <video :src="externalScreenFileUrl" autoplay muted loop playsinline></video>
              </div>
              <div
                class="editor-avatar-layer"
                :class="{ selected: selectedMenu === '数字人' }"
                :style="{ left: `${selectedWalkingTag ? walkingPreviewX : avatarX}%`, top: `${avatarY}%`, width: `${avatarScale}%`, opacity: avatarOpacity / 100, transform: `translate(-50%, -50%) rotate(${avatarRotation}deg)` }"
                title="拖动调整位置，滚轮缩放"
                @click.stop="selectedMenu = '数字人'"
                @pointerdown.stop.prevent="startAvatarDrag"
                @wheel.stop.prevent="resizeAvatarByWheel"
              >
                <img :src="selectedActionTag?.preview || silentAvatarPreview" :alt="selectedActionTag ? `${selectedActionTag.detail}动作预览` : `${linkedDigitalHuman.name}数字人预览`" draggable="false" />
                <span v-if="selectedActionTag" class="canvas-action-preview-badge"><AppIcon name="sparkles" :size="11" />{{ selectedActionTag.detail }}</span>
                <span v-if="selectedWalkingTag" class="canvas-position-badge current">走动后位置</span>
                <span v-if="selectedMenu === '数字人'" class="avatar-selection-label">拖动移动 · 滚轮缩放</span>
                <i v-if="selectedMenu === '数字人'" v-for="corner in ['nw', 'ne', 'sw', 'se']" :key="corner" :class="corner"></i>
              </div>
              <div
                v-if="selectedWalkingTag"
                class="editor-avatar-layer editor-walking-preview-layer"
                :style="{ left: `${avatarX}%`, top: `${avatarY}%`, width: `${avatarScale}%`, opacity: avatarOpacity / 100, transform: `translate(-50%, -50%) rotate(${avatarRotation}deg)` }"
                aria-label="走动动作初始位置预览"
              >
                <img :src="selectedWalkingTag.preview" :alt="`${selectedWalkingTag.detail}走动动作预览`" draggable="false" />
                <span class="canvas-action-preview-badge walking"><AppIcon name="workflow" :size="11" />{{ selectedWalkingTag.detail }}</span>
              </div>
              <div v-if="selectedWalkingTag" class="walking-distance-guide" :style="walkingDistanceGuideStyle" aria-label="走动距离辅助线">
                <i class="start"></i><span>距离 {{ walkingPreviewDistance }}%</span><i class="end"></i>
              </div>
              <div
                v-if="subtitleEnabled && !subtitleHidden"
                class="editor-subtitle-layer"
                :class="[subtitleStyle, subtitlePosition, { selected: selectedMenu === '字幕' }]"
                :style="{ left: `${subtitleX}%`, top: `${subtitleY}%`, color: subtitleColor, fontSize: `${subtitleSize}px` }"
                @click.stop="selectedMenu = '字幕'"
                @pointerdown.stop.prevent="startSubtitleDrag"
              >
                <p>{{ activePage.narration || '请输入字幕内容' }}</p>
              </div>
              <div
                v-if="selectedMenu === '弹窗' || selectedPopupTag"
                class="editor-popup-component"
                :class="[popupComponentPosition, { selected: selectedMenu === '弹窗' }]"
                :style="{ left: `${popupComponentX}%`, top: `${popupComponentY}%`, width: `${popupComponentDisplaySize}%`, aspectRatio: popupComponentAspectRatio }"
                title="拖动调整位置，选中后使用滚轮调整大小"
                @click.stop="selectedMenu = '弹窗'"
                @pointerdown.stop.prevent="startPopupComponentDrag"
                @wheel.stop="resizePopupComponentByWheel"
              >
                <header><span><AppIcon name="layers" :size="12" />弹窗内容</span><AppIcon name="close" :size="12" /></header>
                <div><AppIcon name="message" :size="24" /><strong>{{ selectedPopupTag?.detail || '弹窗内容预览' }}</strong><small>{{ selectedPopupTag ? '当前选中标签的关联内容' : '添加弹窗标签后展示对应内容' }}</small></div>
              </div>
            </div>
            </Transition>
          </div>
        </section>

        <section class="narration-editor">
          <div class="narration-editor-heading">
            <div><AppIcon name="message" :size="17" /><span><strong>解说词编辑</strong><small>页面内容将按顺序驱动数字人播报</small></span></div>
            <span>{{ activePage.narration.length }} 字</span>
          </div>
          <div class="narration-tool-list" aria-label="解说词快捷工具">
            <button v-for="tool in narrationTools" :key="tool.label" type="button" :class="{ 'has-narration-tooltip': tool.tooltip }" :data-tooltip="tool.tooltip || null" @mousedown.prevent @click="insertNarrationTool(tool)"><AppIcon :name="tool.icon" :size="14" />{{ tool.label }}</button>
          </div>
          <div
            :key="`narration-editor-${activePageId}`"
            ref="narrationEditor"
            class="narration-contenteditable"
            contenteditable="true"
            role="textbox"
            aria-multiline="true"
            data-placeholder="请输入当前页面的数字人解说词"
            @input="syncNarrationEditor"
            @keyup="captureNarrationSelection"
            @mouseup="captureNarrationSelection"
            @focus="captureNarrationSelection"
            @click="handleNarrationEditorClick"
          ></div>
          <div class="narration-editor-footer">
            <button type="button" @click="showToast('开始预览当前解说词')"><AppIcon name="video" :size="14" />预览解说词</button>
          </div>
        </section>
      </main>

      <aside class="editor-property-panel">
        <div class="property-panel-heading">
          <div><strong>{{ selectedMenu }}属性</strong><span>{{ selectedMenuDescription }}</span></div>
          <button v-if="selectedMenu === '解说标签'" type="button" class="property-panel-close" aria-label="关闭标签属性" @click="cancelNarrationTagSelection"><AppIcon name="close" :size="14" /></button>
          <em v-else>{{ selectedMenu }}</em>
        </div>

        <template v-if="selectedMenu === '比例大小'">
          <section class="property-section canvas-application-scope">
            <h2>应用范围</h2>
            <div class="canvas-scope-options" role="radiogroup" aria-label="背景尺寸应用范围">
              <button type="button" role="radio" :aria-checked="canvasApplicationScope === 'global'" :class="{ active: canvasApplicationScope === 'global' }" @click="changeCanvasApplicationScope('global')">
                <AppIcon name="layers" :size="15" /><span><strong>全局</strong><small>应用到所有页面</small></span>
              </button>
              <button type="button" role="radio" :aria-checked="canvasApplicationScope === 'single'" :class="{ active: canvasApplicationScope === 'single' }" @click="changeCanvasApplicationScope('single')">
                <AppIcon name="file" :size="15" /><span><strong>单独</strong><small>仅当前页面</small></span>
              </button>
            </div>
            <p class="canvas-scope-description">
              <AppIcon name="info" :size="13" />
              {{ canvasApplicationScope === 'global' ? '此组件的修改将同步应用到所有页面的相同组件中。' : '仅修改当前页面的此组件，不影响其他页面。' }}
            </p>
          </section>
          <section class="property-section canvas-size-property">
            <h2>背景尺寸</h2>
            <label class="property-field">尺寸规格
              <select v-model="canvasSizePreset" @change="applyCanvasSize">
                <optgroup label="网页">
                  <option value="1920x1080">1920 × 1080</option>
                  <option value="1680x1050">1680 × 1050</option>
                  <option value="1600x900">1600 × 900</option>
                  <option value="1440x900">1440 × 900</option>
                </optgroup>
                <optgroup label="竖屏">
                  <option value="1080x1920">1080 × 1920</option>
                  <option value="1050x1680">1050 × 1680</option>
                </optgroup>
                <option value="custom">自定义尺寸</option>
              </select>
            </label>
            <div class="canvas-size-category">
              <span>{{ canvasWidth > canvasHeight ? '网页横屏' : canvasWidth < canvasHeight ? '竖屏' : '方形画布' }}</span>
              <strong>{{ canvasWidth }} × {{ canvasHeight }}</strong>
            </div>
          </section>
          <section v-if="canvasSizePreset === 'custom'" class="property-section">
            <h2>自定义尺寸</h2>
            <div class="property-input-grid canvas-custom-size-grid">
              <label>宽度<input v-model.number="canvasWidth" type="number" min="320" max="7680" step="1" @input="useCustomCanvasSize" /><span>px</span></label>
              <label>高度<input v-model.number="canvasHeight" type="number" min="320" max="7680" step="1" @input="useCustomCanvasSize" /><span>px</span></label>
            </div>
            <small class="canvas-size-hint">支持 320–7680 px，修改后画布将实时更新。</small>
          </section>
          <section class="property-section">
            <h2>页面切换动画</h2>
            <div class="page-transition-options" role="radiogroup" aria-label="页面切换动画">
              <button type="button" role="radio" :aria-checked="pageTransition === 'horizontal'" :class="{ active: pageTransition === 'horizontal' }" @click="pageTransition = 'horizontal'">
                <span class="transition-direction horizontal"><AppIcon name="chevron" :size="12" /><AppIcon name="chevron" :size="12" /></span>
                <strong>左右滑动</strong>
              </button>
              <button type="button" role="radio" :aria-checked="pageTransition === 'vertical'" :class="{ active: pageTransition === 'vertical' }" @click="pageTransition = 'vertical'">
                <span class="transition-direction vertical"><AppIcon name="chevron" :size="12" /><AppIcon name="chevron" :size="12" /></span>
                <strong>上下滑动</strong>
              </button>
              <button type="button" role="radio" :aria-checked="pageTransition === 'none'" :class="{ active: pageTransition === 'none' }" @click="pageTransition = 'none'">
                <span class="transition-none-icon">—</span>
                <strong>无动画</strong>
              </button>
            </div>
          </section>
        </template>

        <template v-else-if="selectedMenu === '页面内容'">
          <section class="property-section page-content-visibility-section">
            <h2>组件显示</h2>
            <button type="button" class="page-content-hide-button" :class="{ active: pageContentHidden }" @click="togglePageContentHidden">
              <AppIcon :name="pageContentHidden ? 'eye-off' : 'eye'" :size="16" />
              <span><strong>{{ pageContentHidden ? '已隐藏' : '隐藏' }}</strong><small>预览时隐藏页面内容</small></span>
              <i></i>
            </button>
            <p class="page-content-help"><AppIcon name="info" :size="13" />仅在预览时隐藏此组件，方便您查看其他组件，不影响实际功能。</p>
          </section>

          <section class="property-section">
            <h2>应用范围</h2>
            <div class="canvas-scope-options" role="radiogroup" aria-label="页面内容应用范围">
              <button type="button" role="radio" :aria-checked="pageContentApplicationScope === 'global'" :class="{ active: pageContentApplicationScope === 'global' }" @click="changePageContentApplicationScope('global')">
                <AppIcon name="layers" :size="15" /><span><strong>全局</strong><small>应用到所有页面</small></span>
              </button>
              <button type="button" role="radio" :aria-checked="pageContentApplicationScope === 'single'" :class="{ active: pageContentApplicationScope === 'single' }" @click="changePageContentApplicationScope('single')">
                <AppIcon name="file" :size="15" /><span><strong>单独</strong><small>仅当前页面</small></span>
              </button>
            </div>
            <p class="canvas-scope-description"><AppIcon name="info" :size="13" />{{ pageContentApplicationScope === 'global' ? '此组件的修改将同步应用到所有页面的相同组件中。' : '仅修改当前页面的此组件，不影响其他页面。' }}</p>
          </section>

          <section class="property-section external-screen-section">
            <h2>外部大屏</h2>
            <div class="external-screen-source-tabs" role="tablist" aria-label="外部大屏内容来源">
              <button type="button" role="tab" :aria-selected="externalScreenType === 'link'" :class="{ active: externalScreenType === 'link' }" @click="changeExternalScreenType('link')">地址链接<em>推荐</em></button>
              <button type="button" role="tab" :aria-selected="externalScreenType === 'image'" :class="{ active: externalScreenType === 'image' }" @click="changeExternalScreenType('image')">图片</button>
              <button type="button" role="tab" :aria-selected="externalScreenType === 'video'" :class="{ active: externalScreenType === 'video' }" @click="changeExternalScreenType('video')">视频</button>
            </div>
            <label v-if="externalScreenType === 'link'" class="property-field external-screen-link">大屏地址
              <div><AppIcon name="link" :size="14" /><input v-model.trim="externalScreenUrl" type="url" placeholder="请输入外部大屏地址链接" @input="savePageContentSettings" /></div>
            </label>
            <label v-else class="external-screen-upload" :class="{ 'has-file': externalScreenFileName }">
              <input type="file" :accept="externalScreenType === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'video/mp4,video/webm,video/quicktime'" @change="handleExternalScreenFile" />
              <span><AppIcon :name="externalScreenFileName ? 'check' : externalScreenType === 'image' ? 'image' : 'video'" :size="21" /></span>
              <strong>{{ externalScreenFileName || `点击上传${externalScreenType === 'image' ? '图片' : '视频'}` }}</strong>
              <small>{{ externalScreenFileName ? '文件已选择，可重新点击替换' : externalScreenType === 'image' ? '支持 JPG、PNG、WEBP、GIF' : '支持 MP4、WEBM、MOV' }}</small>
            </label>
          </section>
        </template>

        <template v-else-if="selectedMenu === '数字人'">
          <section class="property-section">
            <h2>数字人形象</h2>
            <div class="property-avatar-card"><img :src="silentAvatarPreview" alt="当前数字人形象" /><span><strong>{{ linkedDigitalHuman.name }}</strong><small>{{ linkedDigitalHuman.type }}</small></span><AppIcon name="check" :size="15" /></div>
          </section>
          <section class="property-section">
            <h2>位置与尺寸</h2>
            <div class="property-input-grid"><label>X<input v-model.number="avatarX" type="number" min="0" max="100" @input="saveAvatarSettings" /><span>%</span></label><label>Y<input v-model.number="avatarY" type="number" min="0" max="100" @input="saveAvatarSettings" /><span>%</span></label></div>
            <label class="property-range"><span>缩放<strong>{{ avatarScale }}%</strong></span><input v-model.number="avatarScale" type="range" min="18" max="70" @input="saveAvatarSettings" /></label>
            <label class="property-range"><span>透明度<strong>{{ avatarOpacity }}%</strong></span><input v-model.number="avatarOpacity" type="range" min="10" max="100" @input="saveAvatarSettings" /></label>
            <label class="property-field">旋转角度<div><input v-model.number="avatarRotation" type="number" min="-180" max="180" @input="saveAvatarSettings" /><span>°</span></div></label>
          </section>
          <section class="property-section"><h2>快捷布局</h2><div class="property-layout-buttons"><button type="button" @click="setAvatarHorizontalPosition(25)">居左</button><button type="button" @click="setAvatarHorizontalPosition(50)">居中</button><button type="button" @click="setAvatarHorizontalPosition(75)">居右</button></div></section>
        </template>

        <template v-else-if="selectedMenu === '字幕'">
          <section class="property-section">
            <h2>字幕开关</h2>
            <button type="button" class="page-content-hide-button subtitle-setting-toggle" :class="{ active: subtitleEnabled }" @click="toggleSubtitleEnabled">
              <AppIcon name="message" :size="16" />
              <span><strong>{{ subtitleEnabled ? '字幕已开启' : '字幕已关闭' }}</strong><small>控制字幕实际显示功能</small></span>
              <i></i>
            </button>
          </section>
          <section class="property-section">
            <h2>预览隐藏</h2>
            <button type="button" class="page-content-hide-button" :class="{ active: subtitleHidden }" :disabled="!subtitleEnabled" @click="toggleSubtitleHidden">
              <AppIcon :name="subtitleHidden ? 'eye-off' : 'eye'" :size="16" />
              <span><strong>{{ subtitleHidden ? '已隐藏' : '隐藏' }}</strong><small>仅在编辑预览中隐藏</small></span>
              <i></i>
            </button>
            <p class="page-content-help"><AppIcon name="info" :size="13" />仅在预览时隐藏字幕，方便您查看其他组件，不影响字幕实际功能。</p>
          </section>
          <section class="property-section">
            <h2>应用范围</h2>
            <div class="canvas-scope-options" role="radiogroup" aria-label="字幕应用范围">
              <button type="button" role="radio" :aria-checked="subtitleApplicationScope === 'global'" :class="{ active: subtitleApplicationScope === 'global' }" @click="changeSubtitleApplicationScope('global')"><AppIcon name="layers" :size="15" /><span><strong>全局</strong><small>应用到所有页面</small></span></button>
              <button type="button" role="radio" :aria-checked="subtitleApplicationScope === 'single'" :class="{ active: subtitleApplicationScope === 'single' }" @click="changeSubtitleApplicationScope('single')"><AppIcon name="file" :size="15" /><span><strong>单独</strong><small>仅当前页面</small></span></button>
            </div>
            <p class="canvas-scope-description"><AppIcon name="info" :size="13" />{{ subtitleApplicationScope === 'global' ? '字幕修改将同步应用到所有页面。' : '字幕修改仅应用到当前页面。' }}</p>
          </section>
          <section class="property-section">
            <h2>位置</h2>
            <div class="subtitle-position-options">
              <button v-for="position in [{ value: 'top', label: '顶部' }, { value: 'center', label: '居中' }, { value: 'bottom', label: '底部' }]" :key="position.value" type="button" :class="{ active: subtitlePosition === position.value }" @click="setSubtitlePosition(position.value)">{{ position.label }}</button>
            </div>
            <small class="subtitle-drag-hint">也可以直接在画布中拖动字幕调整位置，当前坐标：{{ subtitleX }}%, {{ subtitleY }}%</small>
          </section>
          <section class="property-section">
            <h2>文字设置</h2>
            <label class="property-range"><span>字幕大小<strong>{{ subtitleSize }}px</strong></span><input v-model.number="subtitleSize" type="range" min="12" max="48" step="1" @input="saveSubtitleSettings" /></label>
            <label class="property-field subtitle-color-field">字幕颜色<div><input v-model="subtitleColor" type="color" @input="saveSubtitleSettings" /><span>{{ subtitleColor.toUpperCase() }}</span></div></label>
          </section>
          <section class="property-section">
            <h2>字幕样式</h2>
            <div class="subtitle-style-options">
              <button type="button" :class="{ active: subtitleStyle === 'bar' }" @click="setSubtitleStyle('bar')"><span class="subtitle-style-preview bar"><i></i></span><strong>条状</strong></button>
              <button type="button" :class="{ active: subtitleStyle === 'block' }" @click="setSubtitleStyle('block')"><span class="subtitle-style-preview block"><i></i><i></i></span><strong>块状</strong></button>
            </div>
          </section>
        </template>

        <template v-else-if="selectedMenu === '解说标签' && selectedNarrationTag">
          <section class="property-section">
            <h2>当前标签</h2>
            <div class="narration-tag-property-card" :class="narrationTagTones[selectedNarrationTag.label] || 'violet'">
              <span><AppIcon :name="selectedNarrationTag.icon" :size="17" /></span>
              <div><strong>{{ selectedNarrationTag.label }}</strong><small>{{ selectedNarrationTagDescription }}</small></div>
              <em>已选中</em>
            </div>
          </section>
          <section class="property-section narration-tag-fields">
            <h2>标签属性</h2>
            <label class="property-field">所属页面<input :value="activePage.name" type="text" readonly /></label>
            <label class="property-field">标签指令<input v-model.trim="selectedNarrationTag.token" type="text" @input="updateSelectedNarrationTag" /></label>
            <label v-if="selectedNarrationTag.detail" class="property-field">关联内容<input v-model.trim="selectedNarrationTag.detail" type="text" @input="updateSelectedNarrationTag" /></label>
            <p class="page-content-help"><AppIcon name="info" :size="13" />标签会在数字人播报到当前位置时触发，只作用于当前页面的解说词。</p>
          </section>
          <section class="property-section narration-tag-danger-zone">
            <button type="button" @click="deleteSelectedNarrationTag"><AppIcon name="trash" :size="14" />删除当前标签</button>
          </section>
        </template>

        <template v-else-if="selectedMenu === '弹窗'">
          <section class="property-section">
            <h2>应用范围</h2>
            <div class="canvas-scope-options" role="radiogroup" aria-label="弹窗应用范围">
              <button type="button" role="radio" :aria-checked="popupComponentApplicationScope === 'global'" :class="{ active: popupComponentApplicationScope === 'global' }" @click="changePopupComponentApplicationScope('global')"><AppIcon name="layers" :size="15" /><span><strong>全局</strong><small>应用到所有页面</small></span></button>
              <button type="button" role="radio" :aria-checked="popupComponentApplicationScope === 'single'" :class="{ active: popupComponentApplicationScope === 'single' }" @click="changePopupComponentApplicationScope('single')"><AppIcon name="file" :size="15" /><span><strong>单独</strong><small>仅当前页面</small></span></button>
            </div>
            <p class="canvas-scope-description"><AppIcon name="info" :size="13" />{{ popupComponentApplicationScope === 'global' ? '弹窗属性修改将同步应用到所有页面。' : '弹窗属性修改仅应用到当前页面。' }}</p>
          </section>
          <section class="property-section">
            <h2>弹窗位置</h2>
            <div class="property-input-grid popup-coordinate-grid">
              <label>X<input v-model.number="popupComponentX" type="number" min="6" max="94" step="0.1" @change="updatePopupComponentCoordinates" /><span>%</span></label>
              <label>Y<input v-model.number="popupComponentY" type="number" min="6" max="94" step="0.1" @change="updatePopupComponentCoordinates" /><span>%</span></label>
            </div>
            <div class="popup-position-options">
              <button v-for="position in [{ value: 'top', label: '顶部' }, { value: 'center', label: '居中' }, { value: 'bottom', label: '底部' }]" :key="position.value" type="button" :class="{ active: popupComponentPosition === position.value }" @click="setPopupComponentPosition(position.value)"><span :class="position.value"></span>{{ position.label }}</button>
            </div>
          </section>
          <section class="property-section">
            <h2>大小</h2>
            <label class="property-range"><span>弹窗宽度<strong>{{ popupComponentSize }}%</strong></span><input v-model.number="popupComponentSize" type="range" min="25" max="88" step="1" @input="savePopupComponentSettings" /></label>
          </section>
          <section class="property-section">
            <h2>比例</h2>
            <div class="popup-ratio-options">
              <button v-for="ratio in ['16:9', '4:3', '1:1', '9:16']" :key="ratio" type="button" :class="{ active: popupComponentRatio === ratio }" @click="setPopupComponentRatio(ratio)"><span :style="{ aspectRatio: ratio.replace(':', ' / ') }"></span><strong>{{ ratio }}</strong></button>
            </div>
          </section>
        </template>

      </aside>
    </div>

    <Transition name="fade">
      <div v-if="qnaInfoModalOpen" class="editor-config-modal-backdrop" @click.self="qnaInfoModalOpen = false">
        <div class="popup-content-config-modal qna-info-config-modal" role="dialog" aria-modal="true" aria-label="编辑问答信息">
          <button type="button" class="popup-config-close" aria-label="关闭" @click="qnaInfoModalOpen = false"><AppIcon name="close" :size="18" /></button>
          <div class="popup-config-icon qna-info-config-icon"><AppIcon name="edit" :size="22" /></div>
          <h2>编辑问答信息</h2>
          <p>修改当前实时问答的问题与相似问，画面和解说词内容不会受到影响。</p>
          <form @submit.prevent="saveQnaInfo">
            <label class="popup-config-label" for="realtime-qna-question">问题</label>
            <input id="realtime-qna-question" v-model="qnaQuestion" class="qna-info-question-input" required maxlength="200" placeholder="请输入问题" />
            <div class="qna-similar-heading">
              <label class="popup-config-label">相似问</label>
              <button type="button" @click="addQnaSimilarQuestion"><AppIcon name="plus" :size="13" />添加相似问</button>
            </div>
            <div class="qna-similar-list">
              <div v-for="(_, index) in qnaSimilarQuestions" :key="index" class="qna-similar-item">
                <input v-model="qnaSimilarQuestions[index]" maxlength="200" :placeholder="`请输入相似问 ${index + 1}`" />
                <button type="button" aria-label="删除相似问" @click="removeQnaSimilarQuestion(index)"><AppIcon name="trash" :size="14" /></button>
              </div>
            </div>
            <div class="popup-config-actions"><button type="button" @click="qnaInfoModalOpen = false">取消</button><button type="submit">保存问答信息</button></div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="popupConfigModalOpen" class="editor-config-modal-backdrop" @click.self="closePopupConfigModal">
        <div class="popup-content-config-modal" role="dialog" aria-modal="true" aria-label="配置弹窗展示内容">
          <button type="button" class="popup-config-close" aria-label="关闭" @click="closePopupConfigModal"><AppIcon name="close" :size="18" /></button>
          <div class="popup-config-icon"><AppIcon name="message" :size="22" /></div>
          <h2>配置弹窗展示内容</h2>
          <p>选择需要在弹窗中展示的内容类型，并完善对应素材。</p>
          <form @submit.prevent="confirmPopupConfig">
            <label class="popup-config-label">展示内容类型</label>
            <div class="popup-content-type-options" role="radiogroup" aria-label="弹窗展示内容类型">
              <button v-for="type in [{ value: 'web', label: '网页', icon: 'link' }, { value: 'image', label: '图片', icon: 'image' }, { value: 'video', label: '视频', icon: 'video' }]" :key="type.value" type="button" role="radio" :aria-checked="popupContentType === type.value" :class="{ active: popupContentType === type.value }" @click="changePopupContentType(type.value)"><AppIcon :name="type.icon" :size="17" /><strong>{{ type.label }}</strong></button>
            </div>
            <template v-if="popupContentType === 'web'">
              <label class="popup-config-label" for="popup-content-url">网页地址</label>
              <div class="popup-url-field"><AppIcon name="link" :size="15" /><input id="popup-content-url" v-model.trim="popupContentUrl" type="url" required placeholder="请输入需要展示的网页地址，例如 https://example.com" /></div>
            </template>
            <template v-else>
              <label class="popup-config-label">{{ popupContentType === 'image' ? '图片素材' : '视频素材' }}</label>
              <label class="popup-content-file-upload" :class="{ 'has-file': popupContentFileName }">
                <input type="file" :accept="popupContentType === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'video/mp4,video/webm,video/quicktime'" required @change="handlePopupContentFile" />
                <span><AppIcon :name="popupContentFileName ? 'check' : popupContentType === 'image' ? 'image' : 'video'" :size="22" /></span>
                <strong>{{ popupContentFileName || `点击上传${popupContentType === 'image' ? '图片' : '视频'}素材` }}</strong>
                <small>{{ popupContentFileName ? '素材已选择，可重新点击替换' : popupContentType === 'image' ? '支持 JPG、PNG、WEBP、GIF' : '支持 MP4、WEBM、MOV' }}</small>
              </label>
              <button v-if="popupContentType === 'video'" type="button" role="switch" class="popup-video-audio-switch" :class="{ active: popupVideoAudioEnabled }" :aria-checked="popupVideoAudioEnabled" @click="popupVideoAudioEnabled = !popupVideoAudioEnabled">
                <span><AppIcon name="video" :size="17" /><span><strong>播放音频</strong><small>开启后，弹窗视频将同时播放原始音频</small></span></span>
                <i></i>
              </button>
            </template>
            <div class="popup-config-actions"><button type="button" @click="closePopupConfigModal">取消</button><button type="submit">确认添加</button></div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="pauseConfigModalOpen" class="editor-config-modal-backdrop" @click.self="closePauseConfigModal">
        <div class="popup-content-config-modal pause-config-modal" role="dialog" aria-modal="true" aria-label="设置停顿秒数">
          <button type="button" class="popup-config-close" aria-label="关闭" @click="closePauseConfigModal"><AppIcon name="close" :size="18" /></button>
          <div class="popup-config-icon pause-config-icon"><AppIcon name="clock" :size="22" /></div>
          <h2>设置停顿时长</h2>
          <p>数字人播报到该标签时，将按照设置的秒数暂停后继续播报。</p>
          <form @submit.prevent="confirmPauseConfig">
            <label class="popup-config-label" for="pause-duration-seconds">停顿秒数</label>
            <div class="pause-duration-field">
              <input id="pause-duration-seconds" v-model.number="pauseSeconds" type="number" min="0.1" max="60" step="0.1" required autofocus />
              <span>秒</span>
            </div>
            <small class="pause-duration-hint">支持设置 0.1–60 秒，最多保留一位小数。</small>
            <div class="popup-config-actions"><button type="button" @click="closePauseConfigModal">取消</button><button type="submit">确认插入</button></div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="actionPickerOpen" class="modal-backdrop action-picker-backdrop" @click.self="closeActionPicker">
        <div class="modal-card answer-action-picker-modal" role="dialog" aria-modal="true" :aria-label="actionPickerMode === 'walk' ? '选择可用走动动作' : '选择可用动作'">
          <button type="button" class="modal-close" aria-label="关闭动作选择" @click="closeActionPicker"><AppIcon name="close" /></button>
          <div class="modal-icon"><AppIcon :name="actionPickerMode === 'walk' ? 'workflow' : 'sparkles'" :size="24" /></div>
          <h3>{{ actionPickerMode === 'walk' ? '选择可用走动动作' : '选择可用动作' }}</h3>
          <p>选择需要插入解说词内容的{{ actionPickerMode === 'walk' ? '走动动作' : '动作' }}，确认后将自动生成对应标签。</p>

          <div class="realtime-action-picker-scroll">
            <div class="answer-action-type-tabs realtime-action-type-tabs" role="tablist" aria-label="动作资产类型">
              <button v-for="type in pickerAssetTypes" :key="type" type="button" role="tab" :aria-selected="activeActionAssetType === type" :class="{ active: activeActionAssetType === type }" @click="selectActionAssetType(type)">
                {{ type }}
                <span>{{ pickerAssets.filter((action) => action.type === type).length }}</span>
              </button>
            </div>

            <div class="answer-action-card-grid">
              <button v-for="action in filteredActionAssets" :key="action.id" type="button" class="answer-action-card" :class="{ selected: selectedActionId === action.id }" @click="selectedActionId = action.id">
                <span class="answer-action-preview"><img :src="action.preview" :alt="`${action.name}动作预览图`" /><span><AppIcon name="check" :size="14" /></span></span>
                <span class="answer-action-card-copy"><strong>{{ action.name }}</strong><small>{{ action.id }}</small></span>
                <em>{{ action.type }}</em>
              </button>
            </div>

            <div class="answer-action-picker-hint"><AppIcon name="info" :size="14" />{{ actionPickerMode === 'walk' ? '走动标签会在播报到当前位置时触发，请确保画布中预留足够的走动空间。' : '动作标签只能插入句首，使用动作标签时解说词至少需要有两句话。' }}</div>
          </div>

          <div class="modal-actions realtime-action-picker-actions">
            <button type="button" class="secondary-button" @click="closeActionPicker">取消</button>
            <button type="button" class="primary-button" :disabled="!selectedActionId" @click="confirmActionSelection">{{ actionPickerMode === 'walk' ? '确认插入走动动作' : '确认插入动作' }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade"><div v-if="toastVisible" class="editor-toast"><AppIcon name="check" :size="16" />{{ toastMessage }}</div></Transition>
  </div>
</template>

<style scoped>
.realtime-editor-page { width: 100%; max-width: 1680px; min-width: 0; margin: 0 auto; color: #34384b; }
.realtime-editor-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 16px; padding: 14px 17px; border: 1px solid #e5e7ef; border-radius: 14px; background: rgba(255,255,255,.94); box-shadow: 0 8px 24px rgba(35,43,71,.05); }
.realtime-editor-title, .realtime-editor-header-actions, .editor-material-toolbar, .editor-material-tools, .editor-canvas-zoom, .narration-editor-heading, .narration-editor-heading > div, .narration-editor-footer { display: flex; align-items: center; }
.realtime-editor-title { gap: 12px; min-width: 0; }
.realtime-editor-title > button { display: grid; place-items: center; width: 34px; height: 34px; color: #666b7f; border: 1px solid #e4e6ed; border-radius: 9px; background: #fafbfc; transform: rotate(180deg); }
.realtime-editor-title > div { display: grid; gap: 3px; }
.realtime-editor-title span { color: #9a9ead; font-size: 8px; }
.realtime-editor-title h1 { margin: 0; color: #272b3e; font-size: 16px; }
.realtime-editor-title em { padding: 5px 8px; color: #3c9d7a; border-radius: 12px; background: #eaf8f2; font-size: 8px; font-style: normal; }
.realtime-editor-header-actions { gap: 9px; }
.realtime-editor-header-actions button { display: inline-flex; align-items: center; gap: 6px; min-height: 35px; padding: 0 13px; border-radius: 8px; font-size: 9px; font-weight: 600; }
.editor-question-button { color: #6759bd; border: 1px solid #d8d2f2; background: #f6f4ff; }
.editor-preview-button { color: #5e6376; border: 1px solid #dfe2ea; background: #fff; }
.editor-save-button { color: #fff; background: linear-gradient(135deg, #7668dc, #5f50c5); box-shadow: 0 6px 14px rgba(101,84,199,.2); }
.realtime-editor-workspace { display: grid; grid-template-columns: 190px minmax(570px, 1fr) 260px; align-items: start; gap: 13px; min-width: 0; }
.editor-page-panel, .editor-center-panel, .editor-property-panel { min-width: 0; border: 1px solid #e4e6ee; border-radius: 13px; background: #fff; box-shadow: 0 8px 24px rgba(35,43,71,.04); }
.editor-page-panel, .editor-property-panel { position: sticky; top: 88px; max-height: calc(100vh - 116px); overflow-y: auto; }
.editor-page-panel { padding: 14px 12px; }
.editor-panel-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 0 2px; }
.editor-panel-heading > div { display: grid; gap: 3px; }
.editor-panel-heading strong { font-size: 11px; }
.editor-panel-heading span { color: #9ca0af; font-size: 8px; }
.editor-panel-heading > button { display: grid; place-items: center; width: 27px; height: 27px; color: #6c60c9; border-radius: 7px; background: #f0edff; }
.editor-page-list { display: grid; gap: 9px; }
.editor-page-item { position: relative; display: grid; grid-template-columns: 18px minmax(0,1fr); gap: 6px; padding: 6px; border: 1px solid transparent; border-radius: 9px; cursor: pointer; transition: border-color .2s, background .2s; }
.editor-page-item:hover { background: #f8f8fb; }
.editor-page-item.active { border-color: #8d82d7; background: #f5f3ff; box-shadow: 0 0 0 2px rgba(116,101,202,.07); }
.editor-page-index { padding-top: 3px; color: #989cab; font-size: 8px; text-align: center; }
.editor-page-thumbnail { position: relative; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 6px; background: #e8edf5; }
.editor-page-thumbnail > img:first-child { width: 100%; height: 100%; object-fit: cover; }
.editor-page-thumbnail .thumbnail-avatar { position: absolute; right: 7px; bottom: 0; width: 38%; height: 88%; object-fit: cover; object-position: top; }
.editor-page-thumbnail > span { position: absolute; left: 6px; bottom: 5px; z-index: 2; max-width: 58%; overflow: hidden; color: #fff; font-size: 7px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 3px rgba(0,0,0,.35); }
.editor-page-actions { position: absolute; right: 9px; top: 9px; z-index: 3; display: flex; gap: 3px; opacity: 0; transition: opacity .2s; }
.editor-page-item:hover .editor-page-actions { opacity: 1; }
.editor-page-actions button { display: grid; place-items: center; width: 21px; height: 21px; color: #626779; border-radius: 5px; background: rgba(255,255,255,.9); box-shadow: 0 2px 6px rgba(20,24,40,.12); }
.editor-page-footer-actions { display: grid; gap: 7px; margin-top: 11px; }
.editor-add-page, .editor-preview-all-pages { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; min-height: 34px; border-radius: 8px; font-size: 9px; }
.editor-add-page { color: #7165ca; border: 1px dashed #cfc9ee; background: #faf9ff; }
.editor-preview-all-pages { color: #438fca; border: 1px solid #c8e1f2; background: #eef8ff; }
.editor-preview-all-pages:hover { color: #287bb9; border-color: #9ecbe9; background: #e5f4ff; }
.editor-center-panel { overflow: hidden; }
.editor-material-toolbar { justify-content: space-between; gap: 16px; min-height: 48px; padding: 0 14px; border-bottom: 1px solid #e7e8ee; background: #fbfbfd; }
.editor-material-tools { gap: 5px; }
.editor-material-tools button { display: inline-flex; align-items: center; gap: 5px; min-height: 30px; padding: 0 10px; color: #74788a; border-radius: 7px; font-size: 9px; }
.editor-material-tools button.active { color: #6659bd; background: #ece9ff; font-weight: 600; }
.editor-canvas-zoom { overflow: hidden; border: 1px solid #e2e4eb; border-radius: 7px; background: #fff; }
.editor-canvas-zoom button { width: 29px; height: 28px; color: #777b8d; font-size: 14px; }
.editor-canvas-zoom span { min-width: 43px; color: #686c7f; border-right: 1px solid #ececf1; border-left: 1px solid #ececf1; font-size: 8px; text-align: center; }
.editor-canvas-shell { padding: 18px; background: #eef0f5; }
.editor-canvas-scroll { display: flex; align-items: center; justify-content: center; min-height: 360px; overflow: auto; }
.editor-canvas { position: relative; flex: 0 0 auto; width: 100%; min-width: 500px; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 5px; background-color: #214c80; background-position: center; background-size: cover; box-shadow: 0 10px 30px rgba(28,42,70,.2); }
.external-screen-canvas-background { position: absolute; inset: 0; z-index: 0; overflow: hidden; background: #111522; pointer-events: none; }
.external-screen-canvas-background iframe, .external-screen-canvas-background img, .external-screen-canvas-background video { display: block; border: 0; }
.external-screen-canvas-background iframe { position: absolute; left: 0; top: 0; max-width: none; max-height: none; background: #fff; transform-origin: left top; }
.external-screen-canvas-background img, .external-screen-canvas-background video { width: 100%; height: 100%; object-fit: contain; object-position: center; background: #111522; }
.editor-avatar-layer { position: absolute; z-index: 3; aspect-ratio: 9 / 16; border: 1px solid transparent; cursor: grab; touch-action: none; user-select: none; }
.editor-avatar-layer:active { cursor: grabbing; }
.editor-avatar-layer.selected { border-color: #8e7ff1; box-shadow: 0 0 0 2px rgba(119,98,226,.2); }
.editor-avatar-layer > img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center top; pointer-events: none; }
.editor-avatar-layer > i { position: absolute; width: 7px; height: 7px; border: 1px solid #6f60d2; background: #fff; }
.editor-avatar-layer > i.nw { left: -4px; top: -4px; }.editor-avatar-layer > i.ne { right: -4px; top: -4px; }.editor-avatar-layer > i.sw { left: -4px; bottom: -4px; }.editor-avatar-layer > i.se { right: -4px; bottom: -4px; }
.avatar-selection-label { position: absolute; left: 50%; top: -25px; width: max-content; padding: 4px 7px; color: #fff; border-radius: 5px; background: #6758c9; font-size: 7px; transform: translateX(-50%); }
.canvas-action-preview-badge { position: absolute; left: 50%; bottom: 7px; display: inline-flex; align-items: center; gap: 4px; width: max-content; max-width: calc(100% - 12px); padding: 5px 8px; overflow: hidden; color: #fff; border-radius: 6px; background: rgba(210,123,67,.92); box-shadow: 0 4px 12px rgba(72,43,24,.2); font-size: 7px; text-overflow: ellipsis; white-space: nowrap; transform: translateX(-50%); }
.editor-walking-preview-layer { z-index: 3; border-color: rgba(65,180,194,.72); box-shadow: 0 0 0 2px rgba(65,180,194,.12); cursor: default; pointer-events: none; }
.canvas-action-preview-badge.walking { background: rgba(48,158,174,.94); box-shadow: 0 4px 12px rgba(21,88,98,.2); }
.canvas-position-badge { position: absolute; left: 50%; bottom: 7px; z-index: 2; width: max-content; padding: 5px 8px; color: #fff; border-radius: 6px; background: rgba(94,85,177,.9); box-shadow: 0 4px 12px rgba(48,42,105,.18); font-size: 7px; transform: translateX(-50%); }
.walking-distance-guide { position: absolute; z-index: 4; height: 0; border-top: 2px dashed rgba(255,178,104,.96); pointer-events: none; }
.walking-distance-guide > i { position: absolute; top: -5px; width: 8px; height: 8px; border: 2px solid #fff; border-radius: 50%; background: #f69a4d; box-shadow: 0 2px 6px rgba(77,43,20,.24); }
.walking-distance-guide > i.start { left: -4px; }.walking-distance-guide > i.end { right: -4px; }
.walking-distance-guide > span { position: absolute; left: 50%; top: -25px; width: max-content; padding: 4px 7px; color: #8d4f1d; border: 1px solid #f3c89f; border-radius: 6px; background: rgba(255,248,239,.96); box-shadow: 0 3px 10px rgba(95,59,29,.12); font-size: 7px; font-weight: 600; transform: translateX(-50%); }
.editor-subtitle-layer { position: absolute; z-index: 5; cursor: grab; line-height: 1.55; text-align: center; text-shadow: 0 1px 4px rgba(0,0,0,.5); touch-action: none; user-select: none; transform: translate(-50%,-50%); }
.editor-subtitle-layer:active { cursor: grabbing; }
.editor-subtitle-layer p { display: -webkit-box; margin: 0; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.editor-subtitle-layer.bar { width: 92%; padding: .45em 5%; background: rgba(12,16,28,.6); }
.editor-subtitle-layer.block { width: max-content; max-width: 76%; padding: .48em .85em; border-radius: .35em; background: rgba(12,16,28,.72); }
.editor-subtitle-layer.selected { outline: 1px solid #9b8cf0; outline-offset: 3px; box-shadow: 0 0 0 2px rgba(116,98,210,.14); }
.editor-popup-component { position: absolute; z-index: 6; overflow: hidden; border: 1px solid rgba(218,222,234,.9); border-radius: 8px; background: rgba(255,255,255,.96); box-shadow: 0 12px 32px rgba(20,27,48,.25); transform: translate(-50%,-50%); cursor: grab; touch-action: none; user-select: none; }
.editor-popup-component:active { cursor: grabbing; }
.editor-popup-component.selected { outline: 2px solid rgba(125,105,226,.8); outline-offset: 3px; }
.editor-popup-component > header { display: flex; align-items: center; justify-content: space-between; min-height: 24px; padding: 0 8px; color: #6d7183; border-bottom: 1px solid #ececf2; background: #f7f7fa; }
.editor-popup-component > header > span { display: inline-flex; align-items: center; gap: 4px; font-size: 7px; font-weight: 600; }
.editor-popup-component > div { display: grid; place-items: center; align-content: center; gap: 5px; height: calc(100% - 24px); padding: 8px; color: #7163c5; text-align: center; }
.editor-popup-component > div strong { max-width: 90%; overflow: hidden; color: #525668; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }.editor-popup-component > div small { color: #989cab; font-size: 6px; }
.narration-editor { padding: 15px 17px 17px; border-top: 1px solid #e7e8ee; }
.narration-editor-heading { justify-content: space-between; gap: 14px; margin-bottom: 10px; }
.narration-editor-heading > div { gap: 8px; color: #675bc0; }
.narration-editor-heading > div > span { display: grid; gap: 2px; }
.narration-editor-heading strong { color: #3d4154; font-size: 10px; }
.narration-editor-heading small, .narration-editor-heading > span { color: #9da1b0; font-size: 8px; }
.narration-tool-list { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 9px; }
.narration-tool-list button { display: inline-flex; align-items: center; gap: 5px; min-height: 29px; padding: 0 9px; color: #696d80; border: 1px solid #e0e2ea; border-radius: 7px; background: #fafbfc; font-size: 8px; transition: color .2s, border-color .2s, background .2s, transform .2s; }
.narration-tool-list button:nth-child(1), .narration-tool-list button:nth-child(6) { color: #6f61c5; background: #f3f0ff; }
.narration-tool-list button:nth-child(2) { color: #438fca; background: #edf7ff; }
.narration-tool-list button:nth-child(3) { color: #c58b31; background: #fff8e7; }
.narration-tool-list button:nth-child(4), .narration-tool-list button:nth-child(5) { color: #d27b43; background: #fff2e9; }
.narration-tool-list button:hover { border-color: currentColor; transform: translateY(-1px); }
.narration-tool-list button.has-narration-tooltip { position: relative; }
.narration-tool-list button.has-narration-tooltip::before { position: absolute; content: ''; left: 50%; bottom: calc(100% + 4px); z-index: 12; border: 5px solid transparent; border-top-color: #303448; opacity: 0; pointer-events: none; transform: translateX(-50%) translateY(4px); transition: opacity .18s, transform .18s; }
.narration-tool-list button.has-narration-tooltip::after { position: absolute; content: attr(data-tooltip); left: 0; bottom: calc(100% + 14px); z-index: 11; width: 265px; padding: 8px 10px; color: #fff; border-radius: 7px; background: #303448; box-shadow: 0 8px 22px rgba(24,27,45,.2); opacity: 0; pointer-events: none; font-size: 8px; font-weight: 400; line-height: 1.6; text-align: left; white-space: normal; transform: translateY(4px); transition: opacity .18s, transform .18s; }
.narration-tool-list button.has-narration-tooltip:hover::before, .narration-tool-list button.has-narration-tooltip:hover::after, .narration-tool-list button.has-narration-tooltip:focus-visible::before, .narration-tool-list button.has-narration-tooltip:focus-visible::after { opacity: 1; transform: translateY(0); }
.narration-tool-list button.has-narration-tooltip:hover::before, .narration-tool-list button.has-narration-tooltip:focus-visible::before { transform: translateX(-50%) translateY(0); }
.narration-contenteditable { width: 100%; min-height: 112px; padding: 11px 12px; overflow-wrap: anywhere; color: #4b4f61; border: 1px solid #dfe1e9; border-radius: 8px; outline: 0; background: #fbfbfd; font-family: inherit; font-size: 10px; line-height: 1.8; white-space: pre-wrap; transition: border-color .2s, box-shadow .2s; }
.narration-contenteditable:focus { border-color: #9186d6; box-shadow: 0 0 0 3px rgba(115,99,204,.08); }
.narration-contenteditable:empty::before { content: attr(data-placeholder); color: #a3a7b5; pointer-events: none; }
:deep(.narration-inline-tag) { display: inline-flex; align-items: center; gap: 5px; max-width: min(260px,90%); min-height: 27px; margin: 1px 3px; padding: 0 4px 0 7px; vertical-align: middle; color: #6558bb; border: 1px solid #c9c1ed; border-radius: 7px; background: #f3f0ff; box-shadow: 0 3px 8px rgba(91,75,175,.09); cursor: pointer; line-height: 1; user-select: none; }
:deep(.narration-inline-tag[data-tone='blue']) { color: #438fca; border-color: #b9d9ef; background: #edf7ff; box-shadow: 0 3px 8px rgba(67,143,202,.09); }
:deep(.narration-inline-tag[data-tone='yellow']) { color: #c58b31; border-color: #ead29d; background: #fff8e7; box-shadow: 0 3px 8px rgba(197,139,49,.09); }
:deep(.narration-inline-tag[data-tone='orange']) { color: #d27b43; border-color: #edc6ac; background: #fff2e9; box-shadow: 0 3px 8px rgba(210,123,67,.09); }
:deep(.narration-inline-tag)::before { content: attr(data-icon); flex: 0 0 auto; color: currentColor; font-size: 11px; }
:deep(.narration-inline-tag strong) { flex: 0 0 auto; font-size: 8px; font-weight: 600; }
:deep(.narration-inline-tag > small) { overflow: hidden; color: currentColor; opacity: .72; font-size: 7px; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
:deep(.narration-inline-tag > button) { display: grid; flex: 0 0 auto; place-items: center; width: 19px; height: 19px; padding: 0; color: currentColor; border: 0; border-radius: 5px; background: rgba(255,255,255,.68); font-size: 14px; line-height: 1; }
:deep(.narration-inline-tag > button:hover) { color: #c15b66; background: #fff; }
:deep(.narration-inline-tag.selected) { outline: 2px solid currentColor; outline-offset: 2px; box-shadow: 0 5px 14px rgba(62,54,112,.18); }
.narration-editor-footer { justify-content: flex-end; gap: 14px; margin-top: 10px; }
.narration-editor-footer > button { display: inline-flex; align-items: center; gap: 5px; min-height: 30px; padding: 0 10px; color: #4b8fc8; border-radius: 7px; background: #edf7ff; font-size: 8px; }
.editor-property-panel { padding-bottom: 14px; }
.property-panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 9px; padding: 15px; border-bottom: 1px solid #e7e8ef; }
.property-panel-heading > div { display: grid; gap: 4px; }
.property-panel-heading strong { font-size: 11px; }
.property-panel-heading span { color: #9ca0af; font-size: 7px; line-height: 1.5; }
.property-panel-heading em { flex: 0 0 auto; padding: 4px 7px; color: #685bc2; border-radius: 10px; background: #efecff; font-size: 7px; font-style: normal; }
.property-panel-close { display: grid; flex: 0 0 auto; place-items: center; width: 27px; height: 27px; color: #777b8e; border: 1px solid #e1e3ea; border-radius: 7px; background: #fafbfc; }
.property-panel-close:hover { color: #c05c68; border-color: #e4b6bc; background: #fff2f4; }
.property-section { padding: 14px 15px; border-bottom: 1px solid #efeff3; }
.property-section h2 { margin: 0 0 11px; color: #4a4e61; font-size: 9px; }
.narration-tag-property-card { display: grid; grid-template-columns: 36px minmax(0,1fr) auto; align-items: center; gap: 9px; padding: 10px; color: #6558bb; border: 1px solid #c9c1ed; border-radius: 9px; background: #f3f0ff; }
.narration-tag-property-card.blue { color: #438fca; border-color: #b9d9ef; background: #edf7ff; }
.narration-tag-property-card.yellow { color: #c58b31; border-color: #ead29d; background: #fff8e7; }
.narration-tag-property-card.orange { color: #d27b43; border-color: #edc6ac; background: #fff2e9; }
.narration-tag-property-card > span { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,.72); }
.narration-tag-property-card > div { display: grid; min-width: 0; gap: 4px; }
.narration-tag-property-card strong { color: currentColor; font-size: 9px; }
.narration-tag-property-card small { color: #7e8293; font-size: 7px; line-height: 1.55; }
.narration-tag-property-card em { padding: 3px 6px; color: currentColor; border-radius: 9px; background: rgba(255,255,255,.7); font-size: 6px; font-style: normal; white-space: nowrap; }
.narration-tag-fields { display: grid; gap: 11px; }
.narration-tag-fields h2 { margin-bottom: 0; }
.narration-tag-fields input[readonly] { color: #969aa8; background: #f1f2f5; cursor: default; }
.narration-tag-danger-zone > button { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; min-height: 34px; color: #c05c68; border: 1px solid #ecc8cd; border-radius: 7px; background: #fff3f4; font-size: 8px; }
.narration-tag-danger-zone > button:hover { border-color: #dc929c; background: #ffe9ec; }
.property-avatar-card { display: grid; grid-template-columns: 37px minmax(0,1fr) 18px; align-items: center; gap: 8px; padding: 7px; border: 1px solid #dedaf5; border-radius: 8px; background: #f8f7ff; color: #6a5fc2; }
.property-avatar-card img { width: 37px; height: 48px; object-fit: cover; object-position: top; border-radius: 5px; }
.property-avatar-card > span { display: grid; min-width: 0; gap: 3px; }
.property-avatar-card strong { overflow: hidden; color: #4c5062; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.property-avatar-card small { color: #9699a9; font-size: 7px; }
.property-input-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; margin-bottom: 12px; }
.property-input-grid label, .property-field { display: grid; gap: 6px; color: #85899b; font-size: 8px; }
.property-input-grid label { position: relative; }
.property-input-grid input, .property-field input, .property-field select, .property-field textarea { width: 100%; min-height: 34px; padding: 0 9px; color: #55596c; border: 1px solid #dfe1e9; border-radius: 7px; outline: 0; background: #fafbfc; font-family: inherit; font-size: 9px; }
.property-input-grid label > span { position: absolute; right: 8px; bottom: 9px; color: #a0a4b1; font-size: 7px; }
.canvas-scope-options { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 7px; }
.canvas-scope-options > button { display: flex; align-items: center; gap: 7px; min-width: 0; min-height: 46px; padding: 7px 8px; color: #8a8e9f; border: 1px solid #e1e3eb; border-radius: 8px; background: #fafbfc; text-align: left; transition: border-color .2s, color .2s, background .2s; }
.canvas-scope-options > button.active { color: #675bbc; border-color: #beb6e9; background: #f2efff; box-shadow: 0 0 0 2px rgba(108,91,195,.06); }
.canvas-scope-options > button > span { display: grid; min-width: 0; gap: 2px; }
.canvas-scope-options strong { color: #55596b; font-size: 8px; }.canvas-scope-options button.active strong { color: #5e52ad; }
.canvas-scope-options small { overflow: hidden; color: #9ea2b1; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.canvas-scope-description { display: flex; align-items: flex-start; gap: 6px; margin: 9px 0 0; padding: 8px 9px; color: #818698; border-radius: 7px; background: #f5f6f9; font-size: 7px; line-height: 1.6; }
.canvas-scope-description .app-icon { flex: 0 0 auto; margin-top: 1px; color: #766ac5; }
.page-content-hide-button { display: grid; grid-template-columns: 30px minmax(0,1fr) 29px; align-items: center; gap: 8px; width: 100%; min-height: 50px; padding: 8px 9px; color: #85899b; border: 1px solid #e1e3eb; border-radius: 8px; background: #fafbfc; text-align: left; }
.page-content-hide-button > span { display: grid; gap: 3px; }.page-content-hide-button strong { color: #565a6d; font-size: 9px; }.page-content-hide-button small { color: #9da1b0; font-size: 7px; }
.page-content-hide-button > i { position: relative; width: 29px; height: 17px; border-radius: 9px; background: #d9dce5; transition: background .2s; }
.page-content-hide-button > i::after { position: absolute; content: ''; left: 2px; top: 2px; width: 13px; height: 13px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(40,44,62,.2); transition: transform .2s; }
.page-content-hide-button.active { color: #675bbc; border-color: #c2bae9; background: #f4f1ff; }.page-content-hide-button.active > i { background: #7568ca; }.page-content-hide-button.active > i::after { transform: translateX(12px); }
.page-content-hide-button:disabled { cursor: not-allowed; opacity: .5; }
.page-content-help { display: flex; align-items: flex-start; gap: 6px; margin: 9px 0 0; color: #8e92a2; font-size: 7px; line-height: 1.65; }.page-content-help .app-icon { flex: 0 0 auto; margin-top: 1px; color: #7a6ec7; }
.external-screen-source-tabs { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 5px; margin-bottom: 11px; }
.external-screen-source-tabs button { position: relative; min-height: 32px; padding: 0 4px; color: #7c8092; border: 1px solid #e1e3ea; border-radius: 7px; background: #fafbfc; font-size: 7px; }
.external-screen-source-tabs button.active { color: #6256b5; border-color: #bfb7e9; background: #f1eeff; font-weight: 600; }
.external-screen-source-tabs em { position: absolute; right: 2px; top: -7px; padding: 2px 4px; color: #fff; border-radius: 5px; background: #7a6dca; font-size: 6px; font-style: normal; font-weight: 500; }
.external-screen-link > div { position: relative; }.external-screen-link > div .app-icon { position: absolute; left: 9px; top: 10px; z-index: 2; color: #8c90a0; }.external-screen-link > div input { padding-left: 31px; }
.external-screen-upload { display: grid; place-items: center; min-height: 112px; padding: 12px; color: #7769c6; border: 1px dashed #c8c1e8; border-radius: 9px; background: #faf9ff; cursor: pointer; text-align: center; }
.external-screen-upload input { display: none; }.external-screen-upload > span { display: grid; place-items: center; width: 36px; height: 36px; margin-bottom: 7px; border-radius: 9px; background: #eeeaff; }.external-screen-upload strong { max-width: 100%; overflow: hidden; color: #5d6072; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }.external-screen-upload small { margin-top: 4px; color: #a0a4b2; font-size: 7px; }.external-screen-upload.has-file { border-style: solid; border-color: #bcb3e6; background: #f5f2ff; }
.subtitle-position-options { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 6px; }
.subtitle-position-options button { min-height: 31px; color: #777b8e; border: 1px solid #e0e2e9; border-radius: 7px; background: #fafbfc; font-size: 8px; }
.subtitle-position-options button.active { color: #6256b5; border-color: #bfb7e9; background: #f1eeff; font-weight: 600; }
.subtitle-drag-hint { display: block; margin-top: 8px; color: #9a9ead; font-size: 7px; line-height: 1.6; }
.subtitle-color-field > div input { height: 36px; padding: 4px 82px 4px 5px; cursor: pointer; }
.subtitle-color-field > div span { top: 10px; color: #73778a; letter-spacing: .04em; }
.subtitle-style-options { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 7px; }
.subtitle-style-options > button { display: grid; place-items: center; gap: 7px; min-height: 70px; padding: 8px; color: #7c8092; border: 1px solid #e0e2e9; border-radius: 8px; background: #fafbfc; }
.subtitle-style-options > button.active { color: #6256b5; border-color: #bcb3e7; background: #f2efff; box-shadow: 0 0 0 2px rgba(108,91,195,.06); }
.subtitle-style-options strong { font-size: 8px; }
.subtitle-style-preview { position: relative; display: grid; place-items: center; width: 66px; height: 34px; overflow: hidden; border-radius: 4px; background: linear-gradient(145deg,#41668e,#24466f); }
.subtitle-style-preview.bar i { display: block; width: 100%; height: 9px; background: rgba(16,20,30,.62); }.subtitle-style-preview.bar i::after { display: block; content: ''; width: 34px; height: 2px; margin: 3px auto; background: rgba(255,255,255,.85); }
.subtitle-style-preview.block { align-content: center; gap: 2px; }.subtitle-style-preview.block i { display: block; width: 38px; height: 5px; border-radius: 2px; background: rgba(16,20,30,.72); }.subtitle-style-preview.block i::after { display: block; content: ''; width: 27px; height: 1px; margin: 2px auto; background: rgba(255,255,255,.85); }
.popup-position-options { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 6px; }
.popup-coordinate-grid { margin-bottom: 9px; }
.popup-position-options button { display: grid; place-items: center; gap: 5px; min-height: 52px; color: #7d8193; border: 1px solid #e0e2e9; border-radius: 7px; background: #fafbfc; font-size: 7px; }
.popup-position-options button > span { position: relative; display: block; width: 31px; height: 24px; border: 1px solid #c8cad5; border-radius: 3px; background: #fff; }
.popup-position-options button > span::after { position: absolute; content: ''; left: 5px; right: 5px; height: 5px; border-radius: 2px; background: #b5aecf; }.popup-position-options button > span.top::after { top: 4px; }.popup-position-options button > span.center::after { top: 50%; transform: translateY(-50%); }.popup-position-options button > span.bottom::after { bottom: 4px; }
.popup-position-options button.active { color: #6256b5; border-color: #bdb5e7; background: #f1eeff; }.popup-position-options button.active > span { border-color: #9488d4; }.popup-position-options button.active > span::after { background: #7467c3; }
.popup-ratio-options { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 5px; }
.popup-ratio-options button { display: grid; place-items: center; align-content: center; gap: 5px; min-width: 0; min-height: 55px; color: #868a9b; border: 1px solid #e0e2e9; border-radius: 7px; background: #fafbfc; }
.popup-ratio-options button > span { display: block; width: 26px; max-height: 31px; border: 1.5px solid currentColor; border-radius: 2px; background: #fff; }.popup-ratio-options button strong { font-size: 7px; }
.popup-ratio-options button.active { color: #6659b8; border-color: #bdb5e7; background: #f1eeff; }
.canvas-size-category { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 2px; padding: 10px; color: #74788a; border: 1px solid #e2e4ec; border-radius: 8px; background: #fafbfe; font-size: 8px; }
.canvas-size-category strong { color: #6256b6; font-size: 9px; }
.canvas-custom-size-grid { margin-bottom: 7px; }
.canvas-size-hint { display: block; color: #a0a4b3; font-size: 7px; line-height: 1.6; }
.page-transition-options { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 6px; }
.page-transition-options > button { display: grid; place-items: center; gap: 6px; min-width: 0; min-height: 58px; padding: 7px 4px; color: #85899b; border: 1px solid #e1e3eb; border-radius: 8px; background: #fafbfc; transition: border-color .2s, background .2s, color .2s; }
.page-transition-options > button.active { color: #6558ba; border-color: #bdb5e9; background: #f1eeff; box-shadow: 0 0 0 2px rgba(108,91,195,.06); }
.page-transition-options strong { overflow: hidden; max-width: 100%; font-size: 7px; white-space: nowrap; }
.transition-direction { display: flex; align-items: center; justify-content: center; width: 30px; height: 22px; border: 1px solid currentColor; border-radius: 4px; opacity: .85; }
.transition-direction.horizontal .app-icon:first-child { transform: rotate(180deg); }
.transition-direction.vertical { transform: rotate(90deg); }
.transition-direction.vertical .app-icon:first-child { transform: rotate(180deg); }
.transition-none-icon { display: grid; place-items: center; width: 30px; height: 22px; border: 1px solid currentColor; border-radius: 4px; font-size: 13px; }
.canvas-slide-horizontal-enter-active, .canvas-slide-horizontal-leave-active, .canvas-slide-vertical-enter-active, .canvas-slide-vertical-leave-active { transition: opacity .22s ease, transform .22s ease; }
.canvas-slide-horizontal-enter-from { opacity: 0; transform: translateX(35px); }
.canvas-slide-horizontal-leave-to { opacity: 0; transform: translateX(-35px); }
.canvas-slide-vertical-enter-from { opacity: 0; transform: translateY(28px); }
.canvas-slide-vertical-leave-to { opacity: 0; transform: translateY(-28px); }
.property-range { display: grid; gap: 7px; margin-bottom: 12px; color: #85899b; font-size: 8px; }
.property-range > span { display: flex; justify-content: space-between; }.property-range strong { color: #6358ad; font-size: 8px; }
.property-range input { width: 100%; accent-color: #7163cc; }
.property-field { margin-bottom: 11px; }.property-field > div { position: relative; }.property-field > div span { position: absolute; right: 9px; top: 9px; color: #9da1ae; font-size: 8px; }.property-field textarea { min-height: 82px; padding: 9px; resize: vertical; line-height: 1.5; }
.property-field .property-color-input { height: 36px; padding: 4px; cursor: pointer; }
.property-layout-buttons { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 6px; }
.property-layout-buttons button { min-height: 30px; color: #74788b; border: 1px solid #e0e2e9; border-radius: 6px; background: #fafbfc; font-size: 8px; }
.property-layout-buttons button:hover, .property-layout-buttons button.active { color: #6559b7; border-color: #c6bfec; background: #f2efff; }
.editor-config-modal-backdrop { position: fixed; inset: 0; z-index: 260; display: grid; place-items: center; padding: 20px; background: rgba(27,30,46,.48); backdrop-filter: blur(3px); }
.popup-content-config-modal { position: relative; width: min(520px,100%); padding: 25px; border: 1px solid rgba(255,255,255,.65); border-radius: 15px; background: #fff; box-shadow: 0 24px 70px rgba(24,28,46,.24); }
.popup-config-close { position: absolute; right: 15px; top: 15px; display: grid; place-items: center; width: 30px; height: 30px; color: #8f93a2; border-radius: 8px; background: #f2f3f6; }
.popup-config-icon { display: grid; place-items: center; width: 42px; height: 42px; margin-bottom: 12px; color: #6d5fc5; border-radius: 11px; background: #eeeaff; }
.popup-content-config-modal > h2 { margin: 0 0 6px; color: #33374a; font-size: 15px; }.popup-content-config-modal > p { margin: 0 0 20px; color: #9599a9; font-size: 9px; }
.popup-content-config-modal form { display: grid; }.popup-config-label { margin-bottom: 8px; color: #515568; font-size: 10px; font-weight: 600; }
.popup-content-type-options { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; margin-bottom: 18px; }
.popup-content-type-options button { display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 47px; color: #797d8f; border: 1px solid #e1e3eb; border-radius: 9px; background: #fafbfc; }
.popup-content-type-options button strong { font-size: 9px; }.popup-content-type-options button.active { color: #6254b7; border-color: #bdb4e9; background: #f2efff; box-shadow: 0 0 0 2px rgba(102,84,190,.07); }
.popup-url-field { position: relative; margin-bottom: 18px; }.popup-url-field .app-icon { position: absolute; left: 11px; top: 12px; color: #8a8e9e; }.popup-url-field input { width: 100%; height: 40px; padding: 0 11px 0 35px; color: #505467; border: 1px solid #dfe1e9; border-radius: 8px; outline: 0; background: #fafbfc; font-size: 9px; }.popup-url-field input:focus { border-color: #8e82d2; box-shadow: 0 0 0 3px rgba(108,91,195,.08); }
.popup-content-file-upload { display: grid; place-items: center; min-height: 132px; margin-bottom: 18px; padding: 15px; color: #7466c4; border: 1px dashed #c5bee8; border-radius: 10px; background: #faf9ff; cursor: pointer; text-align: center; }.popup-content-file-upload input { display: none; }.popup-content-file-upload > span { display: grid; place-items: center; width: 40px; height: 40px; margin-bottom: 8px; border-radius: 10px; background: #ece8ff; }.popup-content-file-upload strong { max-width: 100%; overflow: hidden; color: #55596b; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.popup-content-file-upload small { margin-top: 5px; color: #9da1af; font-size: 8px; }.popup-content-file-upload.has-file { border-style: solid; border-color: #b9afe5; background: #f4f1ff; }
.popup-video-audio-switch { display: flex; align-items: center; justify-content: space-between; gap: 14px; width: 100%; min-height: 54px; margin: -5px 0 18px; padding: 8px 11px; color: #85899a; border: 1px solid #e1e3ea; border-radius: 9px; background: #fafbfc; text-align: left; }
.popup-video-audio-switch > span { display: flex; align-items: center; gap: 9px; }.popup-video-audio-switch > span > span { display: grid; gap: 3px; }.popup-video-audio-switch strong { color: #55596c; font-size: 9px; }.popup-video-audio-switch small { color: #999dac; font-size: 7px; }
.popup-video-audio-switch > i { position: relative; flex: 0 0 auto; width: 31px; height: 18px; border-radius: 10px; background: #d9dce5; transition: background .2s; }.popup-video-audio-switch > i::after { position: absolute; content: ''; left: 2px; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(40,44,62,.22); transition: transform .2s; }
.popup-video-audio-switch.active { color: #6659bb; border-color: #c5bdea; background: #f4f1ff; }.popup-video-audio-switch.active strong { color: #5f53ae; }.popup-video-audio-switch.active > i { background: #7568ca; }.popup-video-audio-switch.active > i::after { transform: translateX(13px); }
.popup-config-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 2px; }.popup-config-actions button { min-width: 82px; min-height: 35px; border-radius: 8px; font-size: 9px; font-weight: 600; }.popup-config-actions button:first-child { color: #737789; border: 1px solid #dfe1e8; background: #fff; }.popup-config-actions button:last-child { color: #fff; background: linear-gradient(135deg,#7768d6,#5f51bc); box-shadow: 0 6px 14px rgba(91,75,181,.18); }
.qna-info-config-modal { width: min(580px,100%); }
.qna-info-config-icon { color: #327ccf; background: #eaf4ff; }
.qna-info-question-input, .qna-similar-item input { width: 100%; height: 40px; padding: 0 12px; color: #505467; border: 1px solid #dfe1e9; border-radius: 8px; outline: 0; background: #fafbfc; font-size: 10px; }
.qna-info-question-input { margin-bottom: 18px; }
.qna-info-question-input:focus, .qna-similar-item input:focus { border-color: #8e82d2; box-shadow: 0 0 0 3px rgba(108,91,195,.08); }
.qna-similar-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.qna-similar-heading .popup-config-label { margin: 0; }
.qna-similar-heading button { display: inline-flex; align-items: center; gap: 4px; color: #6759bd; background: transparent; font-size: 9px; }
.qna-similar-list { display: grid; gap: 8px; max-height: 220px; margin-bottom: 18px; overflow-y: auto; }
.qna-similar-item { display: grid; grid-template-columns: minmax(0,1fr) 36px; gap: 7px; }
.qna-similar-item > button { display: grid; place-items: center; color: #a2a6b5; border: 1px solid #e2e4eb; border-radius: 8px; background: #fff; }
.qna-similar-item > button:hover { color: #db6572; border-color: #efc7cc; background: #fff7f8; }
.pause-config-modal { width: min(440px,100%); }
.pause-config-icon { color: #c58b31; background: #fff5d9; }
.pause-duration-field { position: relative; margin-bottom: 7px; }
.pause-duration-field input { width: 100%; height: 42px; padding: 0 46px 0 12px; color: #4e5264; border: 1px solid #dfe1e9; border-radius: 8px; outline: 0; background: #fafbfc; font-size: 11px; }
.pause-duration-field input:focus { border-color: #d2a554; box-shadow: 0 0 0 3px rgba(197,139,49,.1); }
.pause-duration-field span { position: absolute; right: 13px; top: 13px; color: #989cab; font-size: 9px; }
.pause-duration-hint { display: block; margin-bottom: 18px; color: #999dac; font-size: 8px; line-height: 1.6; }
.modal-card.answer-action-picker-modal { display: flex; flex-direction: column; padding-bottom: 0; overflow: hidden; }
.realtime-action-picker-scroll { min-height: 0; padding-right: 4px; overflow-y: auto; overscroll-behavior: contain; }
.realtime-action-type-tabs { position: sticky; top: 0; z-index: 3; grid-template-columns: repeat(2,minmax(0,1fr)); }
.answer-action-picker-modal .realtime-action-picker-actions { z-index: 5; flex: 0 0 auto; flex-wrap: nowrap; justify-content: flex-end; margin-top: 0; padding: 14px 0 20px; border-top: 1px solid #ececf2; background: #fff; box-shadow: 0 -8px 18px rgba(39,43,65,.05); }
.realtime-action-picker-actions .secondary-button, .realtime-action-picker-actions .primary-button { min-height: 38px; white-space: nowrap; }
.editor-toast { position: fixed; left: 50%; top: 86px; z-index: 200; display: flex; align-items: center; gap: 7px; padding: 10px 14px; color: #fff; border-radius: 9px; background: #33384c; box-shadow: 0 8px 24px rgba(30,34,49,.2); font-size: 9px; transform: translateX(-50%); }
@media (max-width: 1250px) { .realtime-editor-workspace { grid-template-columns: 160px minmax(510px,1fr) 230px; }.editor-canvas-scroll { min-height: 310px; } }
@media (max-width: 980px) { .realtime-editor-workspace { grid-template-columns: 150px minmax(500px,1fr); }.editor-property-panel { position: static; grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); max-height: none; }.property-panel-heading { grid-column: 1 / -1; } }
@media (max-width: 720px) { .realtime-editor-header { align-items: flex-start; flex-direction: column; }.realtime-editor-workspace { grid-template-columns: 1fr; }.editor-page-panel, .editor-property-panel { position: static; max-height: none; }.editor-page-list { grid-template-columns: repeat(2,minmax(0,1fr)); }.editor-center-panel { overflow-x: auto; }.editor-property-panel { display: block; } }
@media (max-width: 620px) { .realtime-action-picker-actions { justify-content: flex-end; } }
</style>
