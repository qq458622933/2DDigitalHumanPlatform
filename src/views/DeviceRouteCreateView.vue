<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { deviceMapNames, deviceRouteMapRows } from '../config/deviceRouteMaps'

const route = useRoute()
const router = useRouter()
const deviceName = computed(() => String(route.query.deviceName || route.params.sn || '当前设备'))
const isEditing = computed(() => Boolean(route.params.routeId))
const editingRoute = computed(() => deviceRouteMapRows.value.find((item) => item.id === route.params.routeId && (!item.deviceSn || item.deviceSn === route.params.sn)))
const step = ref(1)
const routeName = ref(editingRoute.value?.name || '')
const similarPhrases = ref(editingRoute.value?.similarPhrases || '')
const introduction = ref(editingRoute.value?.introduction || '')
const patrolMode = ref(editingRoute.value?.patrolMode || false)
const repeatCount = ref(editingRoute.value?.repeatCount || 1)
const mapName = ref(String(editingRoute.value?.mapName || route.query.mapName || deviceMapNames[0]))
const mapCatalog = ref([...new Set([...deviceMapNames, ...deviceRouteMapRows.value.map((item) => item.mapName)])].map((name) => ({
  name,
  points: [...new Set([...(name === '场景测试1' ? ['2', '电梯厅', '展厅', '透明屏', '8', '12', '充电桩', '806', '802'] : ['接待点', '展厅', '充电桩', '出口']), ...(name === editingRoute.value?.mapName ? (editingRoute.value.points || []).map((point) => point.name) : [])])],
})))
const availableMapNames = computed(() => mapCatalog.value.map((item) => item.name))
const mapPoints = computed(() => mapCatalog.value.find((item) => item.name === mapName.value)?.points || [])
const activePointName = ref('')
const generatedRoutePoints = ref((editingRoute.value?.points || []).map((point) => point.name))
const pointEditorOpen = ref(false)
const pointEditorTarget = ref('')
const pointNameDraft = ref('')
const pointEditorError = ref('')
const points = ref((editingRoute.value?.points || []).map((point, index) => ({
  id: point.id || `existing-${index}`,
  name: point.name,
  narrationTitle: point.narrationTitle || '',
  narration: point.narration || '',
  narrationMedia: [...(point.narrationMedia || [])],
  transitTitle: point.transitTitle || '',
  transitText: point.transitText || '',
  transitMedia: [...(point.transitMedia || [])],
  extraContents: (point.extraContents || []).map((block) => ({ ...block, questionIds: [...(block.questionIds || [])] })),
})))
const availableEditorPoints = computed(() => mapPoints.value.filter((name) => !points.value.some((point) => point.name === name)))
const addLocationOpen = ref(false)
const addLocationAfterIndex = ref(-1)
const selectedLocation = ref('')
const addLocationError = ref('')
const openingTitle = ref(editingRoute.value?.openingTitle || '')
const openingText = ref(editingRoute.value?.openingText || '')
const openingMedia = ref([...(editingRoute.value?.openingMedia || [])])
const contentEditorOpen = ref(false)
const contentEditorTarget = ref(null)
const contentMode = ref('broadcast')
const editingExtraContentIndex = ref(-1)
const selectedQuestionIds = ref([])
const questionSearch = ref('')
const waitSeconds = ref(10)
const freeQuestionRows = [
  { id: 'company', question: '介绍一下术天公司', answer: '术天公司拥有自研技术壁垒、软硬件一体化交付能力与丰富行业落地经验。' },
  { id: 'technology', question: '你们有什么技术优势', answer: '我们具备数字人、语音交互和智能体等技术能力。' },
  { id: 'hardware', question: '硬件产品有哪些', answer: '硬件产品包括数字人交互设备和移动机器人等。' },
  { id: 'software', question: '介绍一下软件产品', answer: '软件产品覆盖数字人管理、内容编排和智能交互。' },
  { id: 'robot', question: '移动机器人', answer: '移动机器人可用于导览、讲解和场景服务。' },
  { id: 'image', question: '图片', answer: '可通过上传图片丰富数字人的展示内容。' },
  { id: 'video', question: '视频生成', answer: '可配置视频素材用于内容展示。' },
]
const filteredQuestionRows = computed(() => freeQuestionRows.filter((row) => `${row.question} ${row.answer}`.toLowerCase().includes(questionSearch.value.trim().toLowerCase())))
const contentTitleDraft = ref('')
const contentDraft = ref('')
const contentMediaDraft = ref([])
const contentTextarea = ref(null)
const linkEditorOpen = ref(false)
const linkLabelDraft = ref('')
const linkUrlDraft = ref('')
const linkInsertPosition = ref(0)
const newMediaUrls = new Set()
const contentEditorError = ref('')
const contentLinks = computed(() => [...contentDraft.value.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map((match) => ({ label: match[1], url: match[2] })))
const destinationMode = ref(editingRoute.value?.destinationMode || 'charging')
const receptionPoint = ref(editingRoute.value?.receptionPoint || '')
const mapImageFile = ref(editingRoute.value?.mapImageName ? { name: editingRoute.value.mapImageName } : null)
const mapImageUrl = ref('')
const mapImageError = ref('')
const syncMessage = ref('')
const errorMessage = ref('')
const steps = [
  { label: '路线简介', icon: 'file' },
  { label: '地图讲解点', icon: 'route-map' },
  { label: '编辑路线', icon: 'edit' },
]

function returnToRoutes() {
  router.push({ name: 'deviceRouteMap', params: { sn: route.params.sn }, query: { deviceName: deviceName.value } })
}

function createMap() {
  const name = window.prompt('请输入新地图名称')?.trim()
  if (!name) return
  if (!availableMapNames.value.includes(name)) mapCatalog.value.push({ name, points: [] })
  mapName.value = name
  generatedRoutePoints.value = []
  activePointName.value = ''
  receptionPoint.value = ''
  syncMessage.value = '地图已加入下拉列表，请点击编辑按钮添加讲解点'
}

function syncPoints() {
  const current = mapCatalog.value.find((item) => item.name === mapName.value)
  if (!current) return
  current.points = Array.from({ length: 9 }, (_, index) => String(index + 1))
  generatedRoutePoints.value = []
  activePointName.value = ''
  receptionPoint.value = ''
  errorMessage.value = ''
  syncMessage.value = '已同步 9 个讲解点（1～9，模拟数据）'
}

function handleMapChange() {
  generatedRoutePoints.value = []
  activePointName.value = ''
  receptionPoint.value = ''
  syncMessage.value = ''
}

function addRoutePoint(name) {
  generatedRoutePoints.value.push(name)
  activePointName.value = name
  errorMessage.value = ''
}

function removeRoutePoint(index) {
  generatedRoutePoints.value.splice(index, 1)
}

function openPointEditor(pointName = '') {
  pointEditorTarget.value = pointName || activePointName.value || mapPoints.value[0] || ''
  pointNameDraft.value = pointEditorTarget.value
  pointEditorError.value = ''
  pointEditorOpen.value = true
}

function openAddPoint() {
  pointEditorTarget.value = ''
  pointNameDraft.value = ''
  pointEditorError.value = ''
  pointEditorOpen.value = true
}

function savePointEditor() {
  const name = pointNameDraft.value.trim()
  if (!name) { pointEditorError.value = '讲解点名称不能为空'; return }
  const current = mapCatalog.value.find((item) => item.name === mapName.value)
  if (!current) return
  if (current.points.some((point) => point === name && point !== pointEditorTarget.value)) {
    pointEditorError.value = '讲解点名称不能重复'
    return
  }
  if (pointEditorTarget.value) {
    const index = current.points.indexOf(pointEditorTarget.value)
    if (index === -1) return
    current.points[index] = name
    generatedRoutePoints.value = generatedRoutePoints.value.map((point) => point === pointEditorTarget.value ? name : point)
    if (receptionPoint.value === pointEditorTarget.value) receptionPoint.value = name
  } else {
    current.points.push(name)
  }
  activePointName.value = name
  pointEditorOpen.value = false
  syncMessage.value = pointEditorTarget.value ? '讲解点名称已更新' : '讲解点已添加'
}

function openContentEditor(kind, index = -1, mode = 'broadcast', extraIndex = -1) {
  contentEditorTarget.value = { kind, index }
  contentMode.value = mode
  editingExtraContentIndex.value = extraIndex
  const extraContent = extraIndex >= 0 ? points.value[index]?.extraContents?.[extraIndex] : null
  selectedQuestionIds.value = [...(extraContent?.questionIds || [])]
  questionSearch.value = ''
  waitSeconds.value = extraContent?.waitSeconds ?? 10
  contentTitleDraft.value = kind === 'opening' ? openingTitle.value
    : kind === 'transit' ? points.value[index]?.transitTitle || ''
      : points.value[index]?.narrationTitle || ''
  contentDraft.value = kind === 'opening' ? openingText.value
    : kind === 'transit' ? points.value[index]?.transitText || ''
      : points.value[index]?.narration || ''
  contentMediaDraft.value = kind === 'opening' ? [...openingMedia.value]
    : kind === 'transit' ? [...(points.value[index]?.transitMedia || [])]
      : [...(points.value[index]?.narrationMedia || [])]
  linkEditorOpen.value = false
  linkLabelDraft.value = ''
  linkUrlDraft.value = ''
  contentEditorError.value = ''
  contentEditorOpen.value = true
}

function toggleQuestion(id) {
  const index = selectedQuestionIds.value.indexOf(id)
  if (index >= 0) selectedQuestionIds.value.splice(index, 1)
  else selectedQuestionIds.value.push(id)
  contentEditorError.value = ''
}

function toggleAllFilteredQuestions(event) {
  const ids = filteredQuestionRows.value.map((row) => row.id)
  selectedQuestionIds.value = event.target.checked
    ? [...new Set([...selectedQuestionIds.value, ...ids])]
    : selectedQuestionIds.value.filter((id) => !ids.includes(id))
  contentEditorError.value = ''
}

function questionName(id) {
  return freeQuestionRows.find((row) => row.id === id)?.question || id
}

function closeContentEditor() {
  newMediaUrls.forEach((url) => URL.revokeObjectURL(url))
  newMediaUrls.clear()
  contentEditorOpen.value = false
}

function openLinkEditor() {
  linkInsertPosition.value = contentTextarea.value?.selectionStart ?? contentDraft.value.length
  linkLabelDraft.value = ''
  linkUrlDraft.value = ''
  contentEditorError.value = ''
  linkEditorOpen.value = true
}

async function insertLink() {
  const label = linkLabelDraft.value.trim()
  const rawUrl = linkUrlDraft.value.trim()
  let url
  try {
    url = new URL(rawUrl)
  } catch {
    contentEditorError.value = '请输入有效的链接地址'
    return
  }
  if (!label) { contentEditorError.value = '请输入链接文字'; return }
  if (!['http:', 'https:'].includes(url.protocol)) { contentEditorError.value = '链接仅支持 http 或 https 地址'; return }
  const marker = `[${label}](${url.href})`
  const before = contentDraft.value.slice(0, linkInsertPosition.value)
  const after = contentDraft.value.slice(linkInsertPosition.value)
  if ((before + marker + after).length > 2000) { contentEditorError.value = '播报内容不能超过 2000 字'; return }
  contentDraft.value = before + marker + after
  linkEditorOpen.value = false
  contentEditorError.value = ''
  await nextTick()
  contentTextarea.value?.focus()
  contentTextarea.value?.setSelectionRange(before.length + marker.length, before.length + marker.length)
}

function uploadContentMedia(event, type) {
  const files = [...(event.target.files || [])]
  event.target.value = ''
  const invalid = files.find((file) => !file.type.startsWith(`${type}/`))
  if (invalid) { contentEditorError.value = type === 'image' ? '请选择图片文件' : '请选择视频文件'; return }
  files.forEach((file) => {
    const url = URL.createObjectURL(file)
    newMediaUrls.add(url)
    contentMediaDraft.value.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, type, name: file.name, url, file })
  })
  contentEditorError.value = ''
}

function removeContentMedia(index) {
  const [item] = contentMediaDraft.value.splice(index, 1)
  if (item && newMediaUrls.has(item.url)) {
    URL.revokeObjectURL(item.url)
    newMediaUrls.delete(item.url)
  }
}

function plainContent(text) {
  return text?.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1') || ''
}

function contentAssetSummary(text, media = []) {
  const linkCount = [...(text || '').matchAll(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g)].length
  const imageCount = media.filter((item) => item.type === 'image').length
  const videoCount = media.filter((item) => item.type === 'video').length
  return [linkCount && `${linkCount} 链接`, imageCount && `${imageCount} 图片`, videoCount && `${videoCount} 视频`].filter(Boolean).join(' · ')
}

function saveContentEditor() {
  const target = contentEditorTarget.value
  if (!target) return
  if (target.kind === 'point' && contentMode.value !== 'broadcast') {
    const point = points.value[target.index]
    if (!point) return
    if (contentMode.value === 'qa' && !selectedQuestionIds.value.length) { contentEditorError.value = '请至少选择一个常见问题'; return }
    const seconds = Number(waitSeconds.value)
    if (contentMode.value === 'wait' && (!Number.isInteger(seconds) || seconds < 1 || seconds > 3600)) {
      contentEditorError.value = '等待时长请输入 1～3600 秒的整数'
      return
    }
    const block = contentMode.value === 'qa'
      ? { id: `content-${Date.now()}`, type: 'qa', questionIds: [...selectedQuestionIds.value] }
      : { id: `content-${Date.now()}`, type: 'wait', waitSeconds: seconds }
    if (!point.extraContents) point.extraContents = []
    if (editingExtraContentIndex.value >= 0) point.extraContents.splice(editingExtraContentIndex.value, 1, block)
    else point.extraContents.push(block)
    closeContentEditor()
    return
  }
  if (linkEditorOpen.value) { contentEditorError.value = '请先确认插入链接，或取消链接编辑'; return }
  if (!contentTitleDraft.value.trim()) { contentEditorError.value = '请填写内容标题'; return }
  if (!contentDraft.value.trim()) { contentEditorError.value = '请填写播报内容'; return }
  if (target.kind === 'opening') {
    openingTitle.value = contentTitleDraft.value.trim()
    openingText.value = contentDraft.value.trim()
    openingMedia.value = [...contentMediaDraft.value]
  }
  else if (target.kind === 'transit' && points.value[target.index]) {
    points.value[target.index].transitTitle = contentTitleDraft.value.trim()
    points.value[target.index].transitText = contentDraft.value.trim()
    points.value[target.index].transitMedia = [...contentMediaDraft.value]
  }
  else if (points.value[target.index]) {
    points.value[target.index].narrationTitle = contentTitleDraft.value.trim()
    points.value[target.index].narration = contentDraft.value.trim()
    points.value[target.index].narrationMedia = [...contentMediaDraft.value]
  }
  newMediaUrls.clear()
  contentEditorOpen.value = false
}

function openAddLocation(afterIndex) {
  if (!availableEditorPoints.value.length) { errorMessage.value = '当前地图的讲解点已全部加入路线'; return }
  addLocationAfterIndex.value = afterIndex
  selectedLocation.value = ''
  addLocationError.value = ''
  errorMessage.value = ''
  addLocationOpen.value = true
}

function addEditorPoint() {
  const name = selectedLocation.value
  if (!availableEditorPoints.value.includes(name)) { addLocationError.value = '请选择当前地图中尚未加入路线的讲解点'; return }
  const insertIndex = addLocationAfterIndex.value + 1
  points.value.splice(insertIndex, 0, { id: `editor-point-${Date.now()}`, name, narrationTitle: '', narration: '', narrationMedia: [], transitTitle: '', transitText: '', transitMedia: [], extraContents: [] })
  generatedRoutePoints.value.splice(insertIndex, 0, name)
  addLocationOpen.value = false
}

function saveRoute(status) {
  if (!routeName.value.trim()) { step.value = 1; errorMessage.value = '请输入路线名称'; return }
  const original = editingRoute.value
  if (isEditing.value && !original) { errorMessage.value = '路线不存在或已被删除，请返回路线列表'; return }
  const payload = {
    id: original?.id || `route-${Date.now()}`,
    deviceSn: original ? original.deviceSn : String(route.params.sn),
    name: routeName.value.trim(),
    mapName: mapName.value,
    type: original?.type || '导览路线',
    status,
    similarPhrases: similarPhrases.value.trim(),
    introduction: introduction.value.trim(),
    patrolMode: patrolMode.value,
    repeatCount: Number(repeatCount.value),
    destinationMode: destinationMode.value,
    receptionPoint: destinationMode.value === 'reception' ? receptionPoint.value : '',
    mapImageName: mapImageFile.value?.name || '',
    openingTitle: openingTitle.value.trim(),
    openingText: openingText.value.trim(),
    openingMedia: [...openingMedia.value],
    points: points.value.map((point) => ({ id: point.id, name: point.name.trim(), narrationTitle: point.narrationTitle?.trim() || '', narration: point.narration.trim(), narrationMedia: [...(point.narrationMedia || [])], transitTitle: point.transitTitle?.trim() || '', transitText: point.transitText?.trim() || '', transitMedia: [...(point.transitMedia || [])], extraContents: [...(point.extraContents || [])] })),
  }
  if (original) {
    const index = deviceRouteMapRows.value.findIndex((item) => item.id === original.id)
    deviceRouteMapRows.value.splice(index, 1, { ...original, ...payload })
  } else deviceRouteMapRows.value.unshift(payload)
  returnToRoutes()
}

function uploadMapImage(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!['image/png', 'image/jpeg'].includes(file.type)) { mapImageError.value = '仅支持 PNG、JPG、JPEG 图片'; return }
  if (file.size > 500 * 1024 * 1024) { mapImageError.value = '图片大小不能超过 500MB'; return }
  if (mapImageUrl.value) URL.revokeObjectURL(mapImageUrl.value)
  mapImageFile.value = file
  mapImageUrl.value = URL.createObjectURL(file)
  mapImageError.value = ''
}

function nextStep() {
  errorMessage.value = ''
  if (step.value === 1) {
    if (!routeName.value.trim()) { errorMessage.value = '请输入路线名称'; return }
    step.value = 2
    return
  }
  if (step.value === 2) {
    if (!mapName.value) { errorMessage.value = '请选择地图'; return }
    if (!generatedRoutePoints.value.length) { errorMessage.value = '请点击讲解点，将其添加到下方生成路线中'; return }
    if (destinationMode.value === 'reception' && !receptionPoint.value) { errorMessage.value = '请选择接待点'; return }
    points.value = generatedRoutePoints.value.map((name, index) => {
      const previous = points.value[index]
      return previous?.name === name
        ? previous
        : { id: `${mapName.value}-${index}`, name, narrationTitle: '', narration: '', narrationMedia: [], transitTitle: '', transitText: '', transitMedia: [], extraContents: [] }
    })
    step.value = 3
    return
  }
}

onBeforeUnmount(() => { if (mapImageUrl.value) URL.revokeObjectURL(mapImageUrl.value) })
</script>

<template>
  <div class="route-create-page">
    <div class="route-create-sheet">
      <div class="route-create-head">
        <button type="button" class="route-create-back" @click="returnToRoutes"><span>←</span> 路线</button>
        <div class="route-stepper" :aria-label="isEditing ? '编辑导览路线步骤' : '新增导览路线步骤'">
          <template v-for="(item, index) in steps" :key="item.label">
            <div class="route-step" :class="{ active: step === index + 1, complete: step > index + 1 }" :aria-current="step === index + 1 ? 'step' : undefined">
              <span class="route-step-icon"><AppIcon :name="item.icon" :size="34" /></span>
              <strong>{{ item.label }}</strong>
            </div>
            <span v-if="index < steps.length - 1" class="route-step-connector" :class="{ complete: step > index + 1 }"><i></i></span>
          </template>
        </div>
      </div>

      <form class="route-create-form" :class="{ 'map-step-form': step === 2, 'editor-step-form': step === 3 }" @submit.prevent="nextStep">
        <template v-if="step === 1">
          <div class="route-create-field"><label for="route-name"><span>*</span>路线名称</label><input id="route-name" v-model.trim="routeName" required maxlength="60" placeholder="请输入路线名称" /></div>
          <div class="route-create-field"><label for="route-similar-phrases">相似叫法</label><input id="route-similar-phrases" v-model.trim="similarPhrases" maxlength="120" placeholder="请输入相似叫法" /></div>
          <div class="route-create-field"><label for="route-introduction">简介</label><div class="route-introduction-wrap"><textarea id="route-introduction" v-model="introduction" maxlength="40" placeholder="请输入路线简介" /><span>{{ introduction.length }} / 40</span></div></div>
          <div class="route-patrol-row"><label for="route-patrol">巡逻模式 <input id="route-patrol" v-model="patrolMode" type="checkbox" role="switch" /><span class="route-switch"></span></label><select v-model.number="repeatCount" aria-label="路线执行次数"><option v-for="count in 5" :key="count" :value="count">{{ count }}</option></select></div>
          <p class="route-patrol-hint"><AppIcon name="info" :size="13" />多次执行该路线</p>
        </template>

        <template v-else-if="step === 2">
          <div class="map-step-layout">
            <div class="map-step-main">
              <div class="map-select-row"><label for="route-map-name"><span>*</span>选择地图</label><select id="route-map-name" v-model="mapName" required @change="handleMapChange"><option v-for="name in availableMapNames" :key="name" :value="name">{{ name }}</option></select><button type="button" @click="createMap">创建地图</button></div>
              <section class="map-points-summary" aria-label="地图讲解点">
                <div class="map-points-summary-heading"><span>地图：{{ mapName }} <button type="button" :aria-label="activePointName ? `编辑${activePointName}的名称` : '编辑讲解点名称'" title="编辑当前讲解点名称" @click="openPointEditor()"><AppIcon name="edit" :size="13" /></button></span><button type="button" class="map-sync-button" @click="syncPoints"><AppIcon name="refresh" :size="13" />点位同步</button></div>
                <div class="map-points-line"><span>讲解点：</span><div><span v-for="point in mapPoints" :key="point" class="map-point-chip" :class="{ selected: activePointName === point }"><button type="button" class="map-point-add" :title="`添加${point}到生成路线`" @click="addRoutePoint(point)">{{ point }}</button><button type="button" class="map-point-edit" :aria-label="`编辑${point}的名称`" title="编辑该讲解点名称" @click="openPointEditor(point)"><AppIcon name="edit" :size="12" /></button></span><button type="button" class="map-add-point-button" @click="openAddPoint"><AppIcon name="plus" :size="13" />添加讲解点</button></div></div>
              </section>
              <p v-if="syncMessage" class="map-sync-message" role="status">{{ syncMessage }}</p>
              <div class="route-generate-field"><label><span>*</span>生成路线</label><div class="route-generate-card"><div v-if="generatedRoutePoints.length" class="generated-route-track"><template v-for="(point, index) in generatedRoutePoints" :key="`${point}-${index}`"><button type="button" class="generated-route-chip" :title="`从路线中移除${point}`" @click="removeRoutePoint(index)">{{ point }}<span>×</span></button><span v-if="index < generatedRoutePoints.length - 1" class="generated-route-arrow">→</span></template></div><p v-else class="generated-route-empty">点击上方讲解点，按顺序添加到路线</p><div class="route-generate-divider"></div><div class="route-generate-options"><label class="route-reception-option"><input v-model="destinationMode" type="radio" name="destination-mode" value="reception" /><select v-model="receptionPoint" :disabled="destinationMode !== 'reception'" aria-label="接待点"><option value="">接待点</option><option v-for="point in mapPoints" :key="point" :value="point">{{ point }}</option></select></label><label class="route-charging-option"><input v-model="destinationMode" type="radio" name="destination-mode" value="charging" /><strong>充电桩</strong></label><span class="route-generate-hint"><AppIcon name="info" :size="13" />展览结束后回到该点位</span></div></div></div>
              <p v-if="errorMessage" class="route-create-error" role="alert">{{ errorMessage }}</p>
              <div class="route-create-actions map-step-actions"><button type="button" class="previous" @click="step = 1; errorMessage = ''">上一步</button><button type="submit" class="next">下一步<span>→</span></button></div>
            </div>
            <aside class="map-image-panel" aria-label="地图图片上传">
              <input id="route-map-image" type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" @change="uploadMapImage" />
              <label for="route-map-image" class="map-image-upload"><img v-if="mapImageUrl" :src="mapImageUrl" alt="地图图片预览" /><span v-else class="map-image-upload-tile"><AppIcon name="image" :size="31" /><strong>图片上传</strong></span></label>
              <p v-if="mapImageFile" class="map-image-filename">{{ mapImageFile.name }}</p>
              <p v-else class="map-image-hint">请上传大小不超过 <b>500MB</b> 格式为 <b>png/jpg/jpeg</b> 的文件</p>
              <p v-if="mapImageError" class="map-image-error" role="alert">{{ mapImageError }}</p>
            </aside>
          </div>
        </template>

        <template v-else>
          <div class="route-editor-header"><span>{{ routeName }} · {{ mapName }}</span><button type="button" @click="saveRoute('published')">发布 <AppIcon name="upload" :size="14" /></button></div>
          <div class="route-editor-timeline">
            <div class="route-editor-row opening">
              <div class="route-editor-location"><span>开场白</span></div>
              <div class="route-editor-rail"><span class="route-editor-pin"><AppIcon name="map-pin" :size="26" /></span></div>
              <div class="route-editor-stage">开场白</div>
              <button type="button" class="route-editor-content-card" @click="openContentEditor('opening')"><strong><AppIcon name="file" :size="15" />{{ openingTitle || '开场白' }}</strong><span>{{ plainContent(openingText) || '点击编辑开场白' }}</span><small v-if="contentAssetSummary(openingText, openingMedia)" class="route-card-media-count">{{ contentAssetSummary(openingText, openingMedia) }}</small></button>
            </div>
            <div v-if="!points.length" class="route-editor-empty">该路线暂无讲解点，<button type="button" @click="step = 2">前往选择讲解点</button>后即可编排内容。</div>
            <template v-for="(point, index) in points" :key="point.id">
              <div class="route-editor-row point">
                <div class="route-editor-location"><span>{{ point.name }}</span></div>
                <div class="route-editor-rail"><span class="route-editor-pin"><AppIcon name="map-pin" :size="26" /></span></div>
                <div class="route-editor-stage">{{ index === 0 ? '讲解开始' : '定点讲解' }}</div>
                <div class="route-editor-point-contents">
                  <button type="button" class="route-editor-content-card" @click="openContentEditor('point', index)"><strong><AppIcon name="file" :size="15" />{{ point.narrationTitle || '播报内容' }}</strong><span>{{ plainContent(point.narration) || '点击编辑播报内容' }}</span><small v-if="contentAssetSummary(point.narration, point.narrationMedia)" class="route-card-media-count">{{ contentAssetSummary(point.narration, point.narrationMedia) }}</small></button>
                  <div v-for="(block, blockIndex) in point.extraContents || []" :key="block.id" class="route-editor-extra-item">
                    <button type="button" class="route-editor-content-card" @click="openContentEditor('point', index, block.type, blockIndex)"><strong><AppIcon :name="block.type === 'qa' ? 'message' : 'clock'" :size="15" />{{ block.type === 'qa' ? '自由问答' : '原地等待' }}</strong><span>{{ block.type === 'qa' ? block.questionIds.map(questionName).join('、') : `等待 ${block.waitSeconds} 秒` }}</span><small>{{ block.type === 'qa' ? `${block.questionIds.length} 个常见问题` : '定点停留' }}</small></button>
                    <button type="button" class="route-editor-remove-extra" :aria-label="`删除${block.type === 'qa' ? '自由问答' : '原地等待'}配置`" @click="point.extraContents.splice(blockIndex, 1)"><AppIcon name="close" :size="13" /></button>
                  </div>
                  <button type="button" class="route-editor-add-content" :aria-label="`添加${point.name}的路线内容`" @click="openContentEditor('point', index)"><AppIcon name="plus" :size="35" /></button>
                </div>
              </div>
              <div class="route-editor-row transit">
                <div class="route-editor-location"><button type="button" class="route-editor-add-location" @click="openAddLocation(index)"><span><AppIcon name="plus" :size="17" /></span>添加地点</button></div>
                <div class="route-editor-rail"></div>
                <div class="route-editor-stage">运动途中</div>
                <button v-if="point.transitText" type="button" class="route-editor-content-card" @click="openContentEditor('transit', index)"><strong><AppIcon name="file" :size="15" />{{ point.transitTitle || '途中播报' }}</strong><span>{{ plainContent(point.transitText) }}</span><small v-if="contentAssetSummary(point.transitText, point.transitMedia)" class="route-card-media-count">{{ contentAssetSummary(point.transitText, point.transitMedia) }}</small></button>
                <button v-else type="button" class="route-editor-add-content" :aria-label="`添加${point.name}后的途中内容`" @click="openContentEditor('transit', index)"><AppIcon name="plus" :size="35" /></button>
              </div>
            </template>
          </div>
          <div class="route-editor-footer"><button type="button" @click="step = 2; errorMessage = ''">上一步</button><button type="button" class="primary" @click="saveRoute(isEditing ? editingRoute?.status || 'draft' : 'draft')">{{ isEditing ? '保存修改' : '保存草稿' }}</button></div>
        </template>

        <p v-if="step !== 2 && errorMessage" class="route-create-error" role="alert">{{ errorMessage }}</p>
        <div v-if="step === 1" class="route-create-actions"><button type="submit" class="next">下一步<span>→</span></button></div>
      </form>
      <div v-if="pointEditorOpen" class="point-editor-backdrop" @click.self="pointEditorOpen = false">
        <div class="point-editor-modal" role="dialog" aria-modal="true" :aria-label="pointEditorTarget ? '编辑讲解点名称' : '添加讲解点'">
          <div class="point-editor-heading"><div><strong>{{ pointEditorTarget ? '编辑讲解点名称' : '添加讲解点' }}</strong><small>{{ mapName }}</small></div><button type="button" aria-label="关闭" @click="pointEditorOpen = false"><AppIcon name="close" :size="18" /></button></div>
          <label class="point-editor-field" for="point-name-input">讲解点名称<input id="point-name-input" v-model="pointNameDraft" autofocus maxlength="50" placeholder="请输入讲解点名称" @keydown.enter.prevent="savePointEditor" /></label>
          <p v-if="pointEditorError" class="route-create-error" role="alert">{{ pointEditorError }}</p>
          <div class="point-editor-actions"><button type="button" @click="pointEditorOpen = false">取消</button><button type="button" class="primary" @click="savePointEditor">保存</button></div>
        </div>
      </div>
      <div v-if="addLocationOpen" class="point-editor-backdrop" @click.self="addLocationOpen = false">
        <div class="point-editor-modal" role="dialog" aria-modal="true" aria-label="添加地点">
          <div class="point-editor-heading"><div><strong>添加地点</strong><small>从「{{ mapName }}」的讲解点中选择</small></div><button type="button" aria-label="关闭" @click="addLocationOpen = false"><AppIcon name="close" :size="18" /></button></div>
          <label class="point-editor-field" for="route-location-select">讲解点<select id="route-location-select" v-model="selectedLocation" autofocus @change="addLocationError = ''"><option value="" disabled>请选择讲解点</option><option v-for="name in availableEditorPoints" :key="name" :value="name">{{ name }}</option></select></label>
          <p v-if="addLocationError" class="route-create-error" role="alert">{{ addLocationError }}</p>
          <div class="point-editor-actions"><button type="button" @click="addLocationOpen = false">取消</button><button type="button" class="primary" @click="addEditorPoint">确认添加</button></div>
        </div>
      </div>
      <div v-if="contentEditorOpen" class="point-editor-backdrop" @click.self="closeContentEditor">
        <div class="point-editor-modal route-content-editor-modal" :class="{ 'route-qa-editor-modal': contentEditorTarget?.kind === 'point' && contentMode === 'qa' }" role="dialog" aria-modal="true" aria-label="编辑路线内容">
          <div class="point-editor-heading"><div><strong>编辑{{ contentEditorTarget?.kind === 'opening' ? '开场白' : contentEditorTarget?.kind === 'transit' ? '途中内容' : '播报内容' }}</strong><small>{{ contentEditorTarget?.index >= 0 ? points[contentEditorTarget.index]?.name : routeName }}</small></div><button type="button" aria-label="关闭" @click="closeContentEditor"><AppIcon name="close" :size="18" /></button></div>
          <div v-if="contentEditorTarget?.kind === 'point'" class="route-content-mode-tabs" role="tablist" aria-label="讲解点内容类型">
            <button type="button" role="tab" :aria-selected="contentMode === 'broadcast'" :class="{ active: contentMode === 'broadcast' }" @click="contentMode = 'broadcast'; contentEditorError = ''">播报内容</button>
            <button type="button" role="tab" :aria-selected="contentMode === 'qa'" :class="{ active: contentMode === 'qa' }" @click="contentMode = 'qa'; contentEditorError = ''">自由问答</button>
            <button type="button" role="tab" :aria-selected="contentMode === 'wait'" :class="{ active: contentMode === 'wait' }" @click="contentMode = 'wait'; contentEditorError = ''">原地等待</button>
          </div>
          <template v-if="contentEditorTarget?.kind !== 'point' || contentMode === 'broadcast'">
          <label class="point-editor-field" for="route-content-title">内容标题<input id="route-content-title" v-model="contentTitleDraft" autofocus maxlength="60" placeholder="请输入内容标题" /></label>
          <label class="point-editor-field" for="route-content-input">播报内容<textarea id="route-content-input" ref="contentTextarea" v-model="contentDraft" rows="5" maxlength="2000" placeholder="请输入播报内容" /></label>
            <div class="route-content-tools" aria-label="播报内容工具">
              <button type="button" @click="openLinkEditor"><AppIcon name="link" :size="15" />插入链接</button>
              <label><AppIcon name="image" :size="15" />上传图片<input type="file" accept="image/*" multiple @change="uploadContentMedia($event, 'image')" /></label>
              <label><AppIcon name="video" :size="15" />上传视频<input type="file" accept="video/*" multiple @change="uploadContentMedia($event, 'video')" /></label>
            </div>
            <div v-if="linkEditorOpen" class="route-link-editor">
              <label for="route-link-label">链接文字<input id="route-link-label" v-model="linkLabelDraft" placeholder="例如：了解更多" /></label>
              <label for="route-link-url">链接地址<input id="route-link-url" v-model="linkUrlDraft" type="url" placeholder="https://example.com" /></label>
              <div><button type="button" @click="linkEditorOpen = false">取消</button><button type="button" class="primary" @click="insertLink">确认插入</button></div>
            </div>
            <p class="route-content-hint">链接将插入光标所在位置；图片和视频会附加到本条播报内容。</p>
            <div v-if="contentLinks.length" class="route-content-links" aria-label="已插入的链接"><a v-for="(link, index) in contentLinks" :key="`${link.url}-${index}`" :href="link.url" target="_blank" rel="noopener noreferrer"><AppIcon name="link" :size="13" />{{ link.label }}</a></div>
            <div v-if="contentMediaDraft.length" class="route-content-media-list" aria-label="已上传的播报素材">
              <div v-for="(item, index) in contentMediaDraft" :key="item.id" class="route-content-media-item">
                <img v-if="item.type === 'image'" :src="item.url" :alt="item.name" />
                <video v-else :src="item.url" muted preload="metadata" />
                <span><strong>{{ item.name }}</strong><small>{{ item.type === 'image' ? '图片' : '视频' }}</small></span>
                <button type="button" :aria-label="`移除${item.name}`" @click="removeContentMedia(index)"><AppIcon name="close" :size="15" /></button>
              </div>
            </div>
          </template>
          <div v-else-if="contentMode === 'qa'" class="route-free-qa-panel">
            <p class="route-free-qa-label"><span>*</span> 屏幕推荐问题（至少填一项）</p>
            <strong class="route-free-qa-selected-title">已选择的问题：</strong>
            <div class="route-free-qa-selected" aria-label="已选择的问题">
              <button v-for="id in selectedQuestionIds" :key="id" type="button" @click="toggleQuestion(id)">{{ questionName(id) }} <AppIcon name="close" :size="12" /></button>
              <span v-if="!selectedQuestionIds.length">请从下方选择要在屏幕展示的常见问题</span>
            </div>
            <label class="route-free-qa-search" for="route-qa-search">请选择屏幕常驻问题<input id="route-qa-search" v-model="questionSearch" placeholder="请输入问题关键词" /></label>
            <div class="route-free-qa-table-wrap">
              <table class="route-free-qa-table"><thead><tr><th><input type="checkbox" aria-label="全选当前筛选的问题" :checked="filteredQuestionRows.length > 0 && filteredQuestionRows.every((row) => selectedQuestionIds.includes(row.id))" @change="toggleAllFilteredQuestions" /></th><th>问题</th><th>回答</th></tr></thead><tbody><tr v-for="row in filteredQuestionRows" :key="row.id" @click="toggleQuestion(row.id)"><td><input type="checkbox" :aria-label="`选择${row.question}`" :checked="selectedQuestionIds.includes(row.id)" @click.stop @change="toggleQuestion(row.id)" /></td><td>{{ row.question }}</td><td :title="row.answer">{{ row.answer }}</td></tr><tr v-if="!filteredQuestionRows.length"><td colspan="3" class="route-free-qa-empty">没有匹配的常见问题</td></tr></tbody></table>
            </div>
          </div>
          <div v-else class="route-wait-panel">
            <p>数字人在此讲解点完成播报后，将原地等待指定时长。</p>
            <label class="point-editor-field" for="route-wait-seconds">等待时长（秒）<input id="route-wait-seconds" v-model.number="waitSeconds" type="number" min="1" max="3600" step="1" /></label>
          </div>
          <p v-if="contentEditorError" class="route-create-error" role="alert">{{ contentEditorError }}</p>
          <div class="point-editor-actions"><button type="button" @click="closeContentEditor">取消</button><button type="button" class="primary" @click="saveContentEditor">{{ contentMode === 'broadcast' ? '保存' : '完成配置' }}</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-create-page { min-height: calc(100vh - 72px); margin: -36px; padding: 2px 12px 12px; background: #e7f2ff; color: #183456; }
.route-create-sheet { min-height: calc(100vh - 86px); padding: 72px 70px 92px; border-radius: 11px; background: #fff; }
.route-create-head { display: grid; grid-template-columns: 1fr minmax(0, 650px) 1fr; align-items: start; }
.route-create-back { justify-self: start; align-self: start; display: inline-flex; align-items: center; gap: 12px; margin-top: 40px; padding: 0; border: 0; background: none; color: #193453; font-size: 13px; font-weight: 700; cursor: pointer; }
.route-create-back span { font-size: 20px; font-weight: 400; line-height: 1; }
.route-stepper { grid-column: 2; display: flex; align-items: flex-start; justify-content: center; width: 100%; }
.route-step { display: grid; justify-items: center; flex: 0 0 102px; gap: 10px; color: #d4d6dd; font-size: 12px; }
.route-step-icon { display: grid; place-items: center; width: 90px; height: 90px; border-radius: 50%; background: #fafafa; }
.route-step strong { font-size: 12px; font-weight: 600; white-space: nowrap; }
.route-step.active, .route-step.complete { color: #3769ff; }
.route-step.active .route-step-icon, .route-step.complete .route-step-icon { background: #f0f4ff; }
.route-step-connector { position: relative; flex: 1 1 100px; height: 1px; margin-top: 46px; border-top: 2px dotted #e8edf5; }
.route-step-connector::after { content: '▷'; position: absolute; right: -2px; top: -11px; color: #d4deed; font-size: 16px; }
.route-step-connector.complete { border-color: #b9caff; }
.route-step-connector.complete::after { color: #8aa9ff; }
.route-create-form { width: min(663px, 100%); margin: 44px auto 0; }
.route-create-form.map-step-form { width: min(1192px, 100%); margin-top: 22px; }
.route-create-form.editor-step-form { width: min(1280px, 100%); margin-top: 22px; }
.route-editor-header { display: flex; align-items: center; justify-content: space-between; min-height: 38px; margin-bottom: 9px; }
.route-editor-header > span { color: #9caac1; font-size: 12px; }
.route-editor-header > button { display: inline-flex; align-items: center; gap: 5px; min-height: 32px; padding: 0 15px; border: 0; border-radius: 4px; background: #3769ff; color: #fff; font-size: 12px; cursor: pointer; }
.route-editor-timeline { max-height: 630px; overflow: auto; padding-bottom: 5px; }
.route-editor-row { display: grid; grid-template-columns: 150px 46px 60px 180px 100px minmax(0, 1fr); align-items: start; column-gap: 11px; min-width: 610px; min-height: 120px; }
.route-editor-row.opening { min-height: 120px; }
.route-editor-empty { margin: 8px 0 25px 278px; padding: 14px; border: 1px dashed #cbdcff; border-radius: 8px; color: #70839f; font-size: 12px; }
.route-editor-empty button { padding: 0; border: 0; background: none; color: #3769ff; font: inherit; cursor: pointer; }
.route-editor-row.transit { min-height: 120px; }
.route-editor-location { display: flex; justify-content: flex-start; padding-top: 18px; }
.route-editor-location > span { position: relative; display: grid; place-items: center; width: 147px; min-height: 44px; padding: 6px 9px; border-radius: 13px; color: #3769ff; background: #edf3ff; font-size: 13px; text-align: center; }
.route-editor-location > span::after { content: ''; position: absolute; right: -7px; top: 16px; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid #edf3ff; }
.route-editor-rail { position: relative; justify-self: center; align-self: stretch; width: 26px; min-height: 120px; background: #e4e4e4; }
.route-editor-row.opening .route-editor-rail { border-radius: 13px 13px 0 0; }
.route-editor-rail::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; border-left: 2px dashed #fff; transform: translateX(-50%); }
.route-editor-pin { position: absolute; z-index: 1; left: 50%; top: 12px; display: grid; place-items: center; color: #ff6d00; transform: translateX(-50%); }
.route-editor-pin :deep(svg) { fill: #ff6d00; stroke: #fff; stroke-width: 1.4; }
.route-editor-stage { display: grid; place-items: center; width: 60px; min-height: 100px; padding: 8px; border-radius: 12px; color: #a7b7ce; background: #f5f5f5; font-size: 13px; writing-mode: vertical-rl; text-orientation: upright; }
.route-editor-content-card { display: flex; flex-direction: column; justify-content: space-between; align-items: stretch; width: 180px; height: 108px; padding: 11px 14px 9px; border: 0; border-radius: 10px; background: linear-gradient(115deg, #60b5ff, #8280f7); color: #fff; text-align: left; cursor: pointer; }
.route-editor-content-card strong { display: inline-flex; align-items: center; gap: 5px; min-width: 0; overflow: hidden; font-size: 13px; font-weight: 600; white-space: nowrap; text-overflow: ellipsis; }
.route-editor-content-card strong :deep(svg) { flex: 0 0 auto; }
.route-editor-content-card > span { min-height: 30px; padding: 6px 9px; overflow: hidden; border: 1px solid #fff; border-radius: 4px; font-size: 11px; white-space: nowrap; text-overflow: ellipsis; }
.route-card-media-count { overflow: hidden; font-size: 10px; white-space: nowrap; text-overflow: ellipsis; }
.route-editor-point-contents { grid-column: 4 / -1; display: flex; flex-wrap: wrap; align-items: flex-start; gap: 10px; min-width: 0; padding-bottom: 10px; }
.route-editor-point-contents > .route-editor-content-card, .route-editor-point-contents > .route-editor-extra-item { flex: 0 0 180px; }
.route-editor-point-contents > .route-editor-add-content { flex: 0 0 100px; }
.route-editor-extra-item { position: relative; }
.route-editor-extra-item .route-editor-content-card { background: linear-gradient(115deg, #7694e9, #9078e6); }
.route-editor-extra-item .route-editor-content-card > small { font-size: 10px; }
.route-editor-remove-extra { position: absolute; top: 5px; right: 5px; display: grid; place-items: center; width: 20px; height: 20px; padding: 0; border: 0; border-radius: 50%; color: #fff; background: #ffffff3d; cursor: pointer; }
.route-editor-remove-extra:hover { background: #e9546c; }
.route-editor-add-content { display: grid; place-items: center; width: 100px; height: 100px; border: 2px dashed #cbdcff; border-radius: 10px; color: #3769ff; background: #fff; cursor: pointer; }
.route-editor-add-content:hover { border-color: #3769ff; background: #f7faff; }
.route-editor-row.transit .route-editor-add-content { grid-column: 4; }
.route-editor-add-location { display: grid; justify-items: center; gap: 6px; width: 147px; padding: 2px 0 0; border: 0; background: none; color: #3769ff; font-size: 12px; cursor: pointer; }
.route-editor-add-location span { display: grid; place-items: center; width: 37px; height: 37px; border: 1px solid #cbdcff; border-radius: 50%; }
.route-editor-footer { display: flex; justify-content: flex-end; gap: 9px; padding: 16px 0 0; }
.route-editor-footer button { min-height: 34px; padding: 0 14px; border: 1px solid #d5dce8; border-radius: 5px; background: #fff; color: #526783; font-size: 12px; cursor: pointer; }
.route-editor-footer button.primary { border-color: #3769ff; color: #3769ff; background: #f5f8ff; }
.map-step-layout { display: grid; grid-template-columns: minmax(0, 760px) minmax(260px, 1fr); gap: 40px; align-items: start; }
.map-step-main { min-width: 0; padding-top: 0; }
.map-select-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; margin: 0 0 20px; }
.map-select-row label, .route-generate-field > label { color: #193453; font-size: 14px; white-space: nowrap; }
.map-select-row label span, .route-generate-field > label span { color: #f26363; }
.map-select-row select { width: 100%; height: 33px; padding: 0 10px; border: 1px solid #d5dce8; border-radius: 4px; background: #fff; color: #294262; font-size: 13px; }
.map-select-row > button { padding: 0; border: 0; background: none; color: #3769ff; font-size: 13px; white-space: nowrap; cursor: pointer; }
.map-points-summary { min-height: 96px; padding: 11px 10px 12px; border: 1px solid #dfe5ef; border-radius: 5px; }
.map-points-summary-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 13px; }
.map-points-summary-heading > span { display: inline-flex; align-items: center; gap: 4px; color: #9aacc5; font-size: 13px; }
.map-points-summary-heading > span button { display: inline-flex; align-items: center; padding: 0; border: 0; color: #3769ff; background: none; cursor: pointer; }
.map-sync-button { display: inline-flex; align-items: center; gap: 5px; height: 25px; padding: 0 10px; border: 1px solid #d9e4ff; border-radius: 99px; color: #3769ff; background: #fff; font-size: 11px; cursor: pointer; }
.map-points-line { display: flex; align-items: flex-start; gap: 10px; }
.map-points-line > span { flex: 0 0 auto; color: #9aacc5; font-size: 13px; line-height: 29px; }
.map-points-line > div { display: flex; flex-wrap: wrap; gap: 8px; }
.map-point-chip { display: inline-flex; align-items: center; justify-content: center; min-height: 29px; padding: 0 5px 0 9px; border-radius: 4px; color: #23334c; background: #f3f4f6; font-size: 12px; }
.map-point-chip.selected { color: #3769ff; background: #edf3ff; }
.map-point-add, .map-point-edit { border: 0; background: transparent; color: inherit; cursor: pointer; }
.map-point-add { padding: 5px 2px; font-size: 12px; }
.map-point-edit { display: inline-flex; align-items: center; padding: 4px 2px; color: #3769ff; opacity: 0; }
.map-point-chip:hover .map-point-edit, .map-point-chip.selected .map-point-edit, .map-point-edit:focus-visible { opacity: 1; }
.map-add-point-button { display: inline-flex; align-items: center; gap: 4px; min-height: 29px; padding: 0 9px; border: 1px solid #d9e4ff; border-radius: 4px; color: #3769ff; background: #f5f8ff; font-size: 12px; cursor: pointer; }
.map-sync-message { margin: 7px 0 0; color: #5d88c6; font-size: 11px; }
.route-generate-field { display: grid; gap: 11px; margin-top: 31px; }
.route-generate-card { min-height: 110px; padding: 10px 10px 13px; border: 1px solid #dfe5ef; border-radius: 5px; }
.generated-route-track { display: flex; align-items: center; flex-wrap: wrap; gap: 3px; min-height: 60px; padding-bottom: 18px; }
.generated-route-chip { display: inline-flex; align-items: center; gap: 7px; min-height: 35px; padding: 0 11px; border: 0; border-radius: 8px; background: #f0f5ff; color: #3769ff; font-size: 13px; cursor: pointer; }
.generated-route-chip span { color: #91a7dc; font-size: 14px; opacity: 0; }
.generated-route-chip:hover span, .generated-route-chip:focus-visible span { opacity: 1; }
.generated-route-arrow { color: #1f3657; font-size: 16px; }
.generated-route-empty { min-height: 60px; margin: 0; padding: 15px 3px 0; color: #a2aec1; font-size: 12px; }
.route-generate-divider { height: 1px; margin-bottom: 28px; border-top: 1px dashed #d5dce8; }
.route-generate-options { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; }
.route-reception-option, .route-charging-option { display: inline-flex; align-items: center; gap: 8px; color: #3769ff; font-size: 13px; cursor: pointer; }
.route-reception-option input, .route-charging-option input { width: 14px; height: 14px; margin: 0; accent-color: #3769ff; }
.route-reception-option select { width: 200px; height: 32px; padding: 0 10px; border: 1px solid #d7deea; border-radius: 4px; background: #fff; color: #445a79; font-size: 12px; }
.route-reception-option select:disabled { background: #f3f5f8; color: #a5afbf; }
.route-charging-option strong { font-weight: 500; white-space: nowrap; }
.route-generate-hint { display: inline-flex; align-items: center; gap: 4px; color: #e7a100; font-size: 11px; white-space: nowrap; }
.route-create-actions.map-step-actions { margin-top: 29px; }
.map-image-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 626px; margin-top: -40px; padding: 25px 16px; border: 1px solid #ccd8ec; border-radius: 10px; }
.map-image-panel > input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.map-image-upload { display: block; cursor: pointer; }
.map-image-upload > img { display: block; max-width: 100%; max-height: 500px; object-fit: contain; border-radius: 7px; }
.map-image-upload-tile { display: grid; place-items: center; gap: 8px; width: 114px; height: 114px; padding: 20px 8px; border: 1px dashed #6387ff; border-radius: 6px; color: #3769ff; background: #f1f5ff; }
.map-image-upload-tile strong { font-size: 14px; font-weight: 500; }
.map-image-hint, .map-image-filename { margin: 10px 0 0; color: #8da0bc; font-size: 11px; text-align: center; line-height: 1.5; }
.map-image-hint b { color: #f35f63; font-weight: 500; }
.map-image-error { color: #d65359; font-size: 11px; text-align: center; }
.point-editor-backdrop { position: fixed; z-index: 150; inset: 0; display: grid; place-items: center; padding: 20px; background: #17284691; }
.point-editor-modal { width: min(480px, 100%); max-height: calc(100vh - 40px); overflow-y: auto; padding: 23px; border-radius: 12px; background: #fff; box-shadow: 0 24px 65px #15294c50; }
.route-content-editor-modal { width: min(560px, 100%); }
.route-qa-editor-modal { width: min(860px, 100%); }
.point-editor-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.point-editor-heading > div { display: grid; gap: 5px; }
.point-editor-heading strong { color: #233b60; font-size: 17px; }
.point-editor-heading small { color: #9aacc5; font-size: 12px; }
.point-editor-heading button { padding: 4px; border: 0; background: transparent; color: #8998af; cursor: pointer; }
.point-editor-field { display: grid; gap: 7px; color: #526987; font-size: 12px; }
.point-editor-field + .point-editor-field { margin-top: 14px; }
.point-editor-field input, .point-editor-field textarea, .point-editor-field select { width: 100%; padding: 9px 10px; border: 1px solid #d9e2f0; border-radius: 6px; background: #fff; color: #263f61; font: inherit; font-size: 13px; }
.point-editor-field input, .point-editor-field select { height: 36px; }
.point-editor-field textarea { resize: vertical; line-height: 1.6; }
.route-content-mode-tabs { display: flex; flex-wrap: wrap; gap: 10px; margin: -3px 0 20px; }
.route-content-mode-tabs button { min-width: 100px; min-height: 39px; padding: 0 15px; border: 0; border-radius: 5px; background: #f2f4f8; color: #4f5f76; font-size: 13px; cursor: pointer; }
.route-content-mode-tabs button.active { background: linear-gradient(110deg, #5eb8ff, #8981f7); color: #fff; font-weight: 600; }
.route-free-qa-panel { color: #233b60; }
.route-free-qa-label { margin: 2px 0 22px; font-size: 13px; }
.route-free-qa-label span { color: #f26464; }
.route-free-qa-selected-title { display: block; margin-bottom: 10px; font-size: 13px; font-weight: 500; }
.route-free-qa-selected { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 8px; min-height: 100px; max-height: 155px; overflow-y: auto; padding: 12px; border: 1px solid #dbe3ee; border-radius: 5px; }
.route-free-qa-selected > span { color: #9aa9bc; font-size: 12px; }
.route-free-qa-selected button { display: inline-flex; align-items: center; gap: 7px; height: 27px; padding: 0 9px; border: 1px solid #cfdfff; border-radius: 5px; background: #f2f7ff; color: #3769b6; font-size: 12px; cursor: pointer; }
.route-free-qa-search { display: flex; align-items: center; gap: 18px; margin: 18px 0; font-size: 13px; white-space: nowrap; }
.route-free-qa-search input { width: min(300px, 100%); height: 33px; padding: 0 12px; border: 1px solid #d9e2f0; border-radius: 4px; color: #263f61; font-size: 12px; }
.route-free-qa-table-wrap { max-height: 290px; overflow: auto; padding: 14px; border: 1px solid #dbe3ee; border-radius: 5px; }
.route-free-qa-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; }
.route-free-qa-table th { position: sticky; top: 0; z-index: 1; height: 42px; background: #f2f4f8; color: #5c6675; text-align: left; }
.route-free-qa-table th:first-child, .route-free-qa-table td:first-child { width: 55px; padding-left: 12px; }
.route-free-qa-table th:nth-child(2), .route-free-qa-table td:nth-child(2) { width: 42%; }
.route-free-qa-table td { height: 42px; overflow: hidden; border-bottom: 1px solid #e5eaf1; color: #3f4c5f; white-space: nowrap; text-overflow: ellipsis; }
.route-free-qa-table tbody tr { cursor: pointer; }
.route-free-qa-table tbody tr:hover { background: #f8fbff; }
.route-free-qa-table input { accent-color: #6b86ed; cursor: pointer; }
.route-free-qa-table .route-free-qa-empty { height: 70px; text-align: center; color: #9aacc5; }
.route-wait-panel { display: grid; gap: 16px; padding: 12px 0; }
.route-wait-panel p { margin: 0; color: #687c99; font-size: 13px; line-height: 1.6; }
.route-content-tools { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.route-content-tools button, .route-content-tools label { display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 0 10px; border: 1px solid #d9e3f5; border-radius: 6px; background: #f7faff; color: #3769b6; font-size: 12px; cursor: pointer; }
.route-content-tools button:hover, .route-content-tools label:hover { border-color: #8dafff; background: #eef4ff; }
.route-content-tools input { display: none; }
.route-link-editor { display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px; margin-top: 12px; padding: 12px; border: 1px solid #dbe6fb; border-radius: 8px; background: #f8fbff; }
.route-link-editor label { display: grid; gap: 6px; color: #526987; font-size: 12px; }
.route-link-editor input { width: 100%; min-width: 0; height: 34px; padding: 0 9px; border: 1px solid #d9e2f0; border-radius: 5px; color: #263f61; font-size: 12px; }
.route-link-editor > div { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; }
.route-link-editor button { min-height: 30px; padding: 0 10px; border: 1px solid #d8e1ef; border-radius: 5px; background: #fff; color: #61728c; font-size: 12px; cursor: pointer; }
.route-link-editor button.primary { border-color: #3769ff; background: #3769ff; color: #fff; }
.route-content-hint { margin: 8px 0 0; color: #8a9bb3; font-size: 11px; line-height: 1.5; }
.route-content-links { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
.route-content-links a { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; padding: 5px 8px; border-radius: 5px; background: #edf4ff; color: #3769b6; font-size: 11px; text-decoration: none; overflow-wrap: anywhere; }
.route-content-links a:hover { text-decoration: underline; }
.route-content-media-list { display: grid; gap: 8px; margin-top: 12px; }
.route-content-media-item { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 6px 8px; border: 1px solid #e2e9f4; border-radius: 7px; }
.route-content-media-item > img, .route-content-media-item > video { width: 48px; height: 40px; border-radius: 4px; background: #e8effa; object-fit: cover; }
.route-content-media-item > span { display: grid; gap: 3px; min-width: 0; flex: 1; }
.route-content-media-item strong { overflow: hidden; color: #294262; font-size: 12px; font-weight: 500; white-space: nowrap; text-overflow: ellipsis; }
.route-content-media-item small { color: #92a2b9; font-size: 11px; }
.route-content-media-item > button { display: grid; place-items: center; width: 28px; height: 28px; border: 0; border-radius: 5px; color: #8999af; background: transparent; cursor: pointer; }
.route-content-media-item > button:hover { color: #d65359; background: #fff1f2; }
.point-editor-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 20px; }
.point-editor-actions button { min-height: 36px; padding: 0 15px; border: 1px solid #d8e1ef; border-radius: 6px; background: #fff; color: #61728c; font-size: 12px; cursor: pointer; }
.point-editor-actions button.primary { color: #fff; border-color: #3769ff; background: #3769ff; }
.route-create-field { display: grid; gap: 11px; margin-bottom: 30px; }
.route-create-field > label { color: #193453; font-size: 14px; font-weight: 500; }
.route-create-field > label span { color: #f26363; }
.route-create-field input, .route-create-field select, .route-point-card input, .route-point-card textarea { width: 100%; min-height: 33px; padding: 8px 10px; border: 1px solid #d5dce8; border-radius: 4px; outline: 0; background: #fff; color: #264267; font: inherit; font-size: 13px; }
.route-create-field input:focus, .route-create-field select:focus, .route-point-card input:focus, .route-point-card textarea:focus { border-color: #5d80ff; box-shadow: 0 0 0 3px #3568fa13; }
.route-create-field input::placeholder, .route-point-card input::placeholder, .route-point-card textarea::placeholder, .route-introduction-wrap textarea::placeholder { color: #aab7ca; }
.route-introduction-wrap { position: relative; }
.route-introduction-wrap textarea { width: 100%; height: 136px; padding: 8px 10px 25px; resize: vertical; border: 1px solid #d5dce8; border-radius: 4px; outline: 0; color: #264267; font: inherit; font-size: 13px; }
.route-introduction-wrap textarea:focus { border-color: #5d80ff; box-shadow: 0 0 0 3px #3568fa13; }
.route-introduction-wrap span { position: absolute; right: 12px; bottom: 10px; color: #95a4bd; font-size: 12px; pointer-events: none; }
.route-patrol-row { display: flex; align-items: center; gap: 34px; margin-top: 1px; }
.route-patrol-row label { display: inline-flex; align-items: center; gap: 5px; color: #263e5c; font-size: 14px; cursor: pointer; }
.route-patrol-row input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.route-switch { position: relative; display: inline-block; width: 49px; height: 24px; border-radius: 99px; background: #d9dde5; transition: background .2s; }
.route-switch::after { content: ''; position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .2s; }
.route-patrol-row input:checked + .route-switch { background: #3769ff; }
.route-patrol-row input:checked + .route-switch::after { transform: translateX(25px); }
.route-patrol-row input:focus-visible + .route-switch { outline: 2px solid #3769ff; outline-offset: 2px; }
.route-patrol-row select { width: 102px; height: 33px; padding: 0 10px; border: 1px solid #4e72ff; border-radius: 4px; background: #fff; color: #465c80; font-size: 13px; }
.route-patrol-hint { display: flex; align-items: center; gap: 5px; margin: 8px 0 0 3px; color: #e2a000; font-size: 12px; }
.route-create-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 34px; }
.route-create-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-width: 93px; height: 34px; padding: 0 14px; border-radius: 4px; font-size: 13px; cursor: pointer; }
.route-create-actions .next { border: 1px solid #3769ff; background: #3769ff; color: #fff; }
.route-create-actions .previous { border: 1px solid #d5dce8; background: #fff; color: #526783; }
.route-create-actions span { font-size: 18px; line-height: 1; }
.route-create-error { margin: 8px 0 0; color: #d65359; font-size: 12px; }
.route-point-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 0 0 14px; }
.route-point-heading > div { display: grid; gap: 4px; }
.route-point-heading strong, .route-review-heading strong { font-size: 15px; }
.route-point-heading small, .route-review-heading span { color: #9aa9bd; font-size: 12px; }
.route-point-heading button { display: inline-flex; align-items: center; gap: 5px; padding: 7px 10px; border: 1px solid #cbd9ff; border-radius: 5px; background: #f5f8ff; color: #3769ff; font-size: 12px; cursor: pointer; }
.route-point-card { display: grid; gap: 14px; margin-bottom: 12px; padding: 15px; border: 1px solid #e1e9f6; border-radius: 8px; background: #fbfdff; }
.route-point-card-head { display: flex; justify-content: space-between; align-items: center; }
.route-point-card-head strong { font-size: 13px; }
.route-point-card-head > div { display: flex; gap: 5px; }
.route-point-card-head button { display: grid; place-items: center; width: 27px; height: 27px; border: 1px solid #e0e7f1; border-radius: 5px; background: #fff; color: #6d83a4; cursor: pointer; }
.route-point-card-head button:disabled { cursor: not-allowed; opacity: .4; }
.route-point-card label { display: grid; gap: 7px; color: #506483; font-size: 12px; }
.route-point-card textarea { min-height: 75px; resize: vertical; }
.route-review-heading { display: grid; gap: 5px; margin-bottom: 22px; }
.route-review-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 0; padding: 19px; border: 1px solid #e3eaf7; border-radius: 8px; background: #fbfdff; }
.route-review-info div.full { grid-column: 1 / -1; }
.route-review-info dt { color: #99a7bc; font-size: 12px; }
.route-review-info dd { margin: 5px 0 0; color: #294261; font-size: 13px; }
.route-review-points { margin-top: 25px; }
.route-review-points > strong { font-size: 14px; }
.route-review-points ol { display: grid; gap: 10px; padding-left: 22px; }
.route-review-points li { color: #294261; font-size: 13px; }
.route-review-points small { display: block; margin-top: 4px; color: #99a7bc; font-size: 12px; }
@media (max-width: 1050px) { .route-create-sheet { padding: 40px 32px 70px; } .route-create-head { display: flex; flex-direction: column; align-items: stretch; gap: 32px; } .route-create-back { margin-top: 0; } .route-stepper { align-self: center; max-width: 650px; } }
@media (max-width: 1050px) { .map-step-layout { grid-template-columns: minmax(0, 1fr); } .map-image-panel { min-height: 330px; margin-top: 0; } }
@media (max-width: 650px) { .route-create-page { margin: -20px; padding: 0; } .route-create-sheet { padding: 26px 18px 60px; } .route-step { flex-basis: 80px; font-size: 10px; } .route-step-icon { width: 64px; height: 64px; } .route-step-icon :deep(svg) { width: 26px; height: 26px; } .route-step-connector { margin-top: 32px; } .route-create-form { margin-top: 35px; } }
</style>
