<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { moduleData } from '../config/modules'

const route = useRoute()
const router = useRouter()
const platformTutorial = inject('platformTutorial', null)
const keyword = ref('')
const activeFilter = ref('全部')
const activeDigitalHumanType = ref('全部类型')
const digitalHumanPage = ref(1)
const digitalHumanPageSize = 4
const modalOpen = ref(false)
const toastVisible = ref(false)
const toastMessage = ref('')
const projectName = ref('')
const digitalHumanType = ref('')
const localAvatarType = ref('播报形象')
const digitalHumanDescription = ref('')
const agentDescription = ref('')
const associatedAgent = ref('')
const videoResolution = ref('')
const videoFile = ref(null)
const videoInput = ref(null)
const trainingRows = ref(moduleData.training.rows.map((row) => ({ ...row })))
const agentRows = ref(moduleData.agents.rows.map((row) => ({ ...row })))
const digitalHumanRows = ref(moduleData.digitalHumans.rows.map((row) => ({ ...row })))
const knowledgeRows = ref(moduleData.knowledge.rows.map((row) => ({ ...row })))
const benefitRows = ref(moduleData.benefits.rows.map((row) => ({ ...row })))
const resourceRows = ref(moduleData.resources.rows.map((row) => ({ ...row })))
const assetRows = ref(moduleData.assets.rows.map((row) => ({ ...row })))
const editingAssetId = ref('')
const knowledgeEditOpen = ref(false)
const editingKnowledge = ref(null)
const knowledgeEditName = ref('')
const knowledgeEditRemark = ref('')
const benefitModalOpen = ref(false)
const selectedBenefitType = ref('设备授权')
const benefitQuantity = ref(1)
const trainingBenefitType = ref('2D在线版')
const benefitUserPhone = ref('')
const benefitAuthorizationName = ref('')
const benefitDuration = ref(30)
const benefitAsrResource = ref('')
const benefitTtsResource = ref('')
const benefitDescription = ref('')
const benefitUserOptions = [
  { name: '张明', phone: '13800138001' },
  { name: '李雪', phone: '13900139002' },
  { name: '王磊', phone: '18600186003' },
  { name: '陈雨', phone: '18800188004' },
]
const resourceModalOpen = ref(false)
const resourceType = ref('asr')
const resourceName = ref('')
const resourceSn = ref('')
const resourceAppId = ref('')
const resourceAppKey = ref('')
const resourceScene = ref('')
const resourceCluster = ref('')
const resourceAccessToken = ref('')
const resourceLicenseKey = ref('')
const showResourceAppKey = ref(false)
const showResourceAccessToken = ref(false)
const editingResourceId = ref('')
const activeResourceTab = ref('语音识别资源池')
const resourceTabs = ['语音识别资源池', '语音合成资源池', '本地数字人授权资源']
const activeAssetEdition = ref('2D本地版')
const activeAssetCategory = ref('形象管理')
const activeBackgroundType = ref('全部类型')
const associatedAssetId = ref('')
const assetActionId = ref('')
const assetAvatarId = ref('')
const assetAvatarGender = ref('女')
const assetDefaultVoiceId = ref('')
const assetAvatarDescription = ref('')
const assetPreviewFile = ref(null)
const assetPreviewInput = ref(null)
const assetPreviewUrl = ref('')
const assetVoiceId = ref('')
const assetVoiceGender = ref('女声')
const assetVoiceType = ref('标准音色')
const assetVoicePitch = ref(1)
const assetVoiceSpeed = ref(1)
const assetVoiceDescription = ref('')
const assetAudioFile = ref(null)
const assetAudioInput = ref(null)
const assetAudioPreviewUrl = ref('')
const assetBackgroundType = ref('透明背景')
const assetBackgroundDescription = ref('')
const assetBackgroundPreviewFile = ref(null)
const assetBackgroundPreviewInput = ref(null)
const assetBackgroundPreviewUrl = ref('')
const assetBackgroundMaterialFile = ref(null)
const assetBackgroundMaterialInput = ref(null)
const assetBackgroundWebUrl = ref('')
const assetCategories = computed(() => activeAssetEdition.value === '2D本地版'
  ? ['形象管理', '动作管理', '音色管理', '预设背景管理']
  : ['形象管理', '预设背景管理'])
const assetAvatarOptions = computed(() => assetRows.value.filter((row) => row.edition === activeAssetEdition.value && row.category === '形象管理'))
const assetVoiceOptions = computed(() => assetRows.value.filter((row) => row.category === '音色管理'))
const editingDigitalHumanCode = ref('')
const editingAgentId = ref('')
const actionModalOpen = ref(false)
const actionType = ref('')
const selectedTraining = ref(null)
const failureReason = ref('')
const completionApiKey = ref('')
const completionProjectId = ref('')
const completionAvatarId = ref('')
const completionPreviewFile = ref(null)
const completionPreviewInput = ref(null)
const replacementVideo = ref(null)
const replacementVideoInput = ref(null)
const imagePreviewOpen = ref(false)
const imagePreviewSrc = ref('')
const imagePreviewTitle = ref('')
const imagePreviewType = ref('avatar')

const current = computed(() => moduleData[route.meta.moduleKey] || moduleData.training)
const primaryActionLabel = computed(() => route.meta.moduleKey === 'assets'
  ? `上传${activeAssetCategory.value.replace('管理', '')}资产`
  : current.value.action)
const agentOptions = computed(() => moduleData.agents.rows.map((row) => row.name))
const displayRows = computed(() => {
  if (route.meta.moduleKey === 'training') return trainingRows.value
  if (route.meta.moduleKey === 'agents') return agentRows.value
  if (route.meta.moduleKey === 'digitalHumans') return digitalHumanRows.value
  if (route.meta.moduleKey === 'knowledge') return knowledgeRows.value
  if (route.meta.moduleKey === 'benefits') return benefitRows.value
  if (route.meta.moduleKey === 'resources') return resourceRows.value
  if (route.meta.moduleKey === 'assets') return assetRows.value
  return current.value.rows
})
const filters = computed(() => ['全部', ...new Set(displayRows.value.map((row) => row.status))])
const filteredRows = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return displayRows.value.filter((row) => {
    const matchesFilter = activeFilter.value === '全部' || row.status === activeFilter.value
    const matchesDigitalHumanType = route.meta.moduleKey !== 'digitalHumans' || activeDigitalHumanType.value === '全部类型' || row.type === activeDigitalHumanType.value
    const matchesKeyword = !query || Object.values(row).join(' ').toLowerCase().includes(query)
    return matchesFilter && matchesDigitalHumanType && matchesKeyword
  })
})
const digitalHumanTotalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / digitalHumanPageSize)))
const paginatedDigitalHumanRows = computed(() => {
  const start = (digitalHumanPage.value - 1) * digitalHumanPageSize
  return filteredRows.value.slice(start, start + digitalHumanPageSize)
})
const filteredResourceRows = computed(() => filteredRows.value.filter((row) => row.type === activeResourceTab.value))
const filteredAssetRows = computed(() => filteredRows.value.filter((row) => {
  const matchesEdition = row.edition === activeAssetEdition.value
  const matchesCategory = row.category === activeAssetCategory.value
  const matchesBackgroundType = activeAssetCategory.value !== '预设背景管理'
    || activeBackgroundType.value === '全部类型'
    || row.backgroundType === activeBackgroundType.value
  return matchesEdition && matchesCategory && matchesBackgroundType
}))
const highlightNewTraining = computed(() => route.meta.moduleKey === 'training'
  && platformTutorial?.tutorialOpen.value
  && platformTutorial?.tutorialStep.value === 2)
const highlightCreateKnowledge = computed(() => route.meta.moduleKey === 'knowledge'
  && platformTutorial?.tutorialOpen.value
  && platformTutorial?.tutorialStep.value === 6)
const highlightCreateDigitalHuman = computed(() => route.meta.moduleKey === 'digitalHumans'
  && platformTutorial?.tutorialOpen.value
  && platformTutorial?.tutorialStep.value === 8)

watch([keyword, activeDigitalHumanType], () => {
  digitalHumanPage.value = 1
})

watch(digitalHumanTotalPages, (totalPages) => {
  if (digitalHumanPage.value > totalPages) digitalHumanPage.value = totalPages
})

watch(() => route.path, () => {
  keyword.value = ''
  activeFilter.value = '全部'
  activeDigitalHumanType.value = '全部类型'
  digitalHumanPage.value = 1
  activeResourceTab.value = '语音识别资源池'
  activeAssetEdition.value = '2D本地版'
  activeAssetCategory.value = '形象管理'
  activeBackgroundType.value = '全部类型'
  closeModal()
  closeActionModal()
  closeImagePreview()
  closeKnowledgeEditor()
  closeBenefitModal()
  closeResourceModal()
})

function openModal() {
  if (route.meta.moduleKey === 'knowledge') {
    router.push({ name: 'knowledgeUpload' })
    return
  }
  if (route.meta.moduleKey === 'benefits') {
    selectedBenefitType.value = '设备授权'
    benefitQuantity.value = 1
    trainingBenefitType.value = '2D在线版'
    benefitDuration.value = 30
    benefitModalOpen.value = true
    return
  }
  if (route.meta.moduleKey === 'resources') {
    editingResourceId.value = ''
    resourceType.value = 'asr'
    resourceModalOpen.value = true
    return
  }
  editingDigitalHumanCode.value = ''
  editingAgentId.value = ''
  editingAssetId.value = ''
  if (route.meta.moduleKey === 'training') localAvatarType.value = '播报形象'
  if (route.meta.moduleKey === 'digitalHumans') {
    digitalHumanType.value = 'online'
    videoResolution.value = '16:9'
  }
  modalOpen.value = true
}

function handlePrimaryActionClick() {
  if (highlightNewTraining.value) {
    platformTutorial?.completeTutorialStep(2)
    return
  }
  if (highlightCreateKnowledge.value) {
    platformTutorial?.completeTutorialStep(6)
    return
  }
  if (highlightCreateDigitalHuman.value) {
    platformTutorial?.completeTutorialStep(8)
    return
  }
  openModal()
}

function closeModal() {
  modalOpen.value = false
  projectName.value = ''
  digitalHumanType.value = ''
  localAvatarType.value = '播报形象'
  digitalHumanDescription.value = ''
  agentDescription.value = ''
  associatedAgent.value = ''
  videoResolution.value = ''
  editingDigitalHumanCode.value = ''
  editingAgentId.value = ''
  editingAssetId.value = ''
  videoFile.value = null
  associatedAssetId.value = ''
  assetActionId.value = ''
  assetAvatarId.value = ''
  assetAvatarGender.value = '女'
  assetDefaultVoiceId.value = ''
  assetAvatarDescription.value = ''
  assetPreviewFile.value = null
  if (assetPreviewUrl.value) URL.revokeObjectURL(assetPreviewUrl.value)
  assetPreviewUrl.value = ''
  assetVoiceId.value = ''
  assetVoiceGender.value = '女声'
  assetVoiceType.value = '标准音色'
  assetVoicePitch.value = 1
  assetVoiceSpeed.value = 1
  assetVoiceDescription.value = ''
  assetAudioFile.value = null
  if (assetAudioPreviewUrl.value) URL.revokeObjectURL(assetAudioPreviewUrl.value)
  assetAudioPreviewUrl.value = ''
  assetBackgroundType.value = '透明背景'
  assetBackgroundDescription.value = ''
  assetBackgroundPreviewFile.value = null
  if (assetBackgroundPreviewUrl.value) URL.revokeObjectURL(assetBackgroundPreviewUrl.value)
  assetBackgroundPreviewUrl.value = ''
  assetBackgroundMaterialFile.value = null
  assetBackgroundWebUrl.value = ''
  if (videoInput.value) videoInput.value.value = ''
  if (assetAudioInput.value) assetAudioInput.value.value = ''
  if (assetPreviewInput.value) assetPreviewInput.value.value = ''
  if (assetBackgroundPreviewInput.value) assetBackgroundPreviewInput.value.value = ''
  if (assetBackgroundMaterialInput.value) assetBackgroundMaterialInput.value.value = ''
}

function handleAssetPreviewChange(event) {
  const file = event.target.files?.[0] || null
  if (assetPreviewUrl.value) URL.revokeObjectURL(assetPreviewUrl.value)
  assetPreviewFile.value = file
  assetPreviewUrl.value = file ? URL.createObjectURL(file) : ''
}

function clearAssetPreview() {
  if (assetPreviewUrl.value) URL.revokeObjectURL(assetPreviewUrl.value)
  assetPreviewFile.value = null
  assetPreviewUrl.value = ''
  if (assetPreviewInput.value) assetPreviewInput.value.value = ''
}

function handleAssetAudioChange(event) {
  const file = event.target.files?.[0] || null
  if (assetAudioPreviewUrl.value) URL.revokeObjectURL(assetAudioPreviewUrl.value)
  assetAudioFile.value = file
  assetAudioPreviewUrl.value = file ? URL.createObjectURL(file) : ''
}

function clearAssetAudio() {
  if (assetAudioPreviewUrl.value) URL.revokeObjectURL(assetAudioPreviewUrl.value)
  assetAudioFile.value = null
  assetAudioPreviewUrl.value = ''
  if (assetAudioInput.value) assetAudioInput.value.value = ''
}

function handleAssetBackgroundPreviewChange(event) {
  const file = event.target.files?.[0] || null
  if (assetBackgroundPreviewUrl.value) URL.revokeObjectURL(assetBackgroundPreviewUrl.value)
  assetBackgroundPreviewFile.value = file
  assetBackgroundPreviewUrl.value = file ? URL.createObjectURL(file) : ''
}

function clearAssetBackgroundPreview() {
  if (assetBackgroundPreviewUrl.value) URL.revokeObjectURL(assetBackgroundPreviewUrl.value)
  assetBackgroundPreviewFile.value = null
  assetBackgroundPreviewUrl.value = ''
  if (assetBackgroundPreviewInput.value) assetBackgroundPreviewInput.value.value = ''
}

function handleAssetBackgroundMaterialChange(event) {
  assetBackgroundMaterialFile.value = event.target.files?.[0] || null
}

function clearAssetBackgroundMaterial() {
  assetBackgroundMaterialFile.value = null
  if (assetBackgroundMaterialInput.value) assetBackgroundMaterialInput.value.value = ''
}

function openAssetEditor(row) {
  editingAssetId.value = row.subtitle
  activeAssetEdition.value = row.edition
  activeAssetCategory.value = row.category
  projectName.value = row.name
  associatedAssetId.value = row.linkedAvatarId || (row.category === '动作管理' ? assetAvatarOptions.value[0]?.subtitle || '' : '')
  assetActionId.value = row.actionId || (row.category === '动作管理' ? row.subtitle : '')
  assetAvatarId.value = row.avatarId || (row.category === '形象管理' ? row.subtitle : '')
  assetAvatarGender.value = row.gender || '女'
  assetDefaultVoiceId.value = row.defaultVoiceId || assetVoiceOptions.value[0]?.subtitle || ''
  assetAvatarDescription.value = row.description || (row.category === '形象管理' ? `${row.name}形象资产` : '')
  assetVoiceId.value = row.voiceId || (row.category === '音色管理' ? row.subtitle : '')
  assetVoiceGender.value = row.gender || '女声'
  assetVoiceType.value = row.voiceType || '标准音色'
  assetVoicePitch.value = row.pitch ?? 1
  assetVoiceSpeed.value = row.speed ?? 1
  assetVoiceDescription.value = row.description || (row.category === '音色管理' ? `${row.name}音色资产` : '')
  assetBackgroundType.value = row.backgroundType || '透明背景'
  assetBackgroundDescription.value = row.description || (row.category === '预设背景管理' ? `${row.name}背景资产` : '')
  assetBackgroundWebUrl.value = row.backgroundWebUrl || ''
  modalOpen.value = true
}

function deleteAsset(row) {
  if (!window.confirm(`确定删除资产“${row.name}”吗？删除后无法恢复。`)) return
  if (typeof row.preview === 'string' && row.preview.startsWith('blob:')) URL.revokeObjectURL(row.preview)
  if (typeof row.backgroundPreview === 'string' && row.backgroundPreview.startsWith('blob:')) URL.revokeObjectURL(row.backgroundPreview)
  assetRows.value = assetRows.value.filter((item) => item.subtitle !== row.subtitle)
  showToast('资产已删除')
}

function setDefaultAsset(row) {
  if (!['形象管理', '预设背景管理'].includes(row.category) || row.isDefault) return
  const updateDefaultState = (rows) => rows.forEach((item) => {
    if (item.edition === row.edition && item.category === row.category) {
      item.isDefault = item.subtitle === row.subtitle
    }
  })
  updateDefaultState(assetRows.value)
  updateDefaultState(moduleData.assets.rows)
  showToast(`已将“${row.name}”设为${row.category === '形象管理' ? '默认形象' : '默认背景'}`)
}

function closeBenefitModal() {
  benefitModalOpen.value = false
  selectedBenefitType.value = '设备授权'
  benefitQuantity.value = 1
  trainingBenefitType.value = '2D在线版'
  benefitUserPhone.value = ''
  benefitAuthorizationName.value = ''
  benefitDuration.value = 30
  benefitAsrResource.value = ''
  benefitTtsResource.value = ''
  benefitDescription.value = ''
}

function submitBenefitAllocation() {
  const type = selectedBenefitType.value
  const quantity = Math.max(1, Number(benefitQuantity.value) || 1)
  const phone = benefitUserPhone.value
  const authorizationName = benefitAuthorizationName.value
  const duration = Math.max(1, Number(benefitDuration.value) || 1)
  const trainingType = trainingBenefitType.value
  if (type === '设备授权') {
    const createdDate = new Date()
    const expiryDate = new Date(createdDate)
    expiryDate.setDate(expiryDate.getDate() + duration)
    benefitRows.value.unshift({
      name: authorizationName,
      subtitle: generateAuthorizationCode(),
      status: '未使用',
      expiryAt: formatDateTime(expiryDate),
      createdAt: formatDateTime(createdDate),
      macAddress: '—',
      userPhone: phone,
      asrResource: benefitAsrResource.value,
      ttsResource: benefitTtsResource.value,
      description: benefitDescription.value,
      tone: 'orange',
    })
  }
  closeBenefitModal()
  showToast(type === '设备授权' ? `设备授权“${authorizationName}”已分配至 ${phone}` : `已向 ${phone} 分配${trainingType}形象训练次数 ${quantity}次`)
}

function closeResourceModal() {
  resourceModalOpen.value = false
  editingResourceId.value = ''
  resourceType.value = 'asr'
  resourceName.value = ''
  resourceSn.value = ''
  resourceAppId.value = ''
  resourceAppKey.value = ''
  resourceScene.value = ''
  resourceCluster.value = ''
  resourceAccessToken.value = ''
  resourceLicenseKey.value = ''
  showResourceAppKey.value = false
  showResourceAccessToken.value = false
}

function submitResourceCreate() {
  const suffix = Date.now().toString().slice(-6)
  const createdAt = formatDateTime(new Date())
  let resourcePayload
  if (resourceType.value === 'asr') {
    resourcePayload = { name: resourceName.value.trim(), subtitle: `RES-ASR-${suffix}`, type: '语音识别资源池', extra: `场景：${resourceScene.value.trim()}`, date: createdAt, status: '已启用', tone: 'blue', sn: resourceSn.value.trim(), appId: resourceAppId.value.trim(), appKey: resourceAppKey.value.trim(), scene: resourceScene.value.trim() }
  } else if (resourceType.value === 'tts') {
    resourcePayload = { name: resourceName.value.trim(), subtitle: `RES-TTS-${suffix}`, type: '语音合成资源池', extra: `Cluster：${resourceCluster.value.trim()}`, date: createdAt, status: '已启用', tone: 'violet', appId: resourceAppId.value.trim(), cluster: resourceCluster.value.trim(), accessToken: resourceAccessToken.value.trim() }
  } else {
    resourcePayload = { name: '本地数字人授权资源', subtitle: `RES-LICENSE-${suffix}`, type: '本地数字人授权资源', extra: 'License 已配置', date: createdAt, status: '已启用', tone: 'orange', licenseKey: resourceLicenseKey.value.trim() }
  }
  const typeLabel = resourceType.value === 'asr' ? '语音识别资源' : resourceType.value === 'tts' ? '语音合成资源' : '本地数字人授权资源'
  const tabLabel = resourcePayload.type
  const wasEditing = Boolean(editingResourceId.value)
  if (wasEditing) {
    const index = resourceRows.value.findIndex((row) => row.subtitle === editingResourceId.value)
    if (index !== -1) resourceRows.value[index] = { ...resourceRows.value[index], ...resourcePayload, subtitle: resourceRows.value[index].subtitle, date: resourceRows.value[index].date }
  } else {
    resourceRows.value.unshift(resourcePayload)
  }
  closeResourceModal()
  activeResourceTab.value = tabLabel
  showToast(`${typeLabel}${wasEditing ? '更新' : '添加'}成功`)
}

function openResourceEditor(row) {
  editingResourceId.value = row.subtitle
  resourceType.value = row.type === '语音识别资源池' ? 'asr' : row.type === '语音合成资源池' ? 'tts' : 'local'
  resourceName.value = row.name || ''
  resourceSn.value = row.sn || ''
  resourceAppId.value = row.appId || ''
  resourceAppKey.value = row.appKey || ''
  resourceScene.value = row.scene || ''
  resourceCluster.value = row.cluster || ''
  resourceAccessToken.value = row.accessToken || ''
  resourceLicenseKey.value = row.licenseKey || ''
  resourceModalOpen.value = true
}

function deleteResource(row) {
  if (!window.confirm(`确定删除资源“${row.name}”吗？`)) return
  resourceRows.value = resourceRows.value.filter((item) => item.subtitle !== row.subtitle)
  showToast('资源已删除')
}

function selectAssetEdition(edition) {
  activeAssetEdition.value = edition
  activeAssetCategory.value = '形象管理'
  activeBackgroundType.value = '全部类型'
}

function selectAssetCategory(category) {
  activeAssetCategory.value = category
  activeBackgroundType.value = '全部类型'
}

function generateAuthorizationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const part = (length) => Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `AUTH-${part(4)}-${part(6)}`
}

function formatDateTime(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function handleVideoChange(event) {
  videoFile.value = event.target.files?.[0] || null
}

function clearVideo() {
  videoFile.value = null
  if (videoInput.value) videoInput.value.value = ''
}

function openImagePreview(row) {
  imagePreviewSrc.value = row.preview
  imagePreviewTitle.value = row.name
  imagePreviewType.value = 'avatar'
  imagePreviewOpen.value = true
}

function openBackgroundPreview(row) {
  imagePreviewSrc.value = row.backgroundPreview
  imagePreviewTitle.value = row.name
  imagePreviewType.value = 'background'
  imagePreviewOpen.value = true
}

function closeImagePreview() {
  imagePreviewOpen.value = false
  imagePreviewSrc.value = ''
  imagePreviewTitle.value = ''
  imagePreviewType.value = 'avatar'
}

function submitCreate() {
  if (route.meta.moduleKey === 'assets') {
    const editingIndex = assetRows.value.findIndex((row) => row.subtitle === editingAssetId.value)
    const existingAsset = editingIndex >= 0 ? assetRows.value[editingIndex] : null
    const linkedAvatar = assetAvatarOptions.value.find((row) => row.subtitle === associatedAssetId.value)
    const uploadedFile = activeAssetCategory.value === '音色管理'
      ? assetAudioFile.value
      : activeAssetCategory.value === '预设背景管理'
        ? assetBackgroundMaterialFile.value
        : videoFile.value
    const existingFileInfo = existingAsset?.extra?.split(' · 关联：')[0] || ''
    const uploadedFileInfo = uploadedFile
      ? `${uploadedFile.name} · ${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB${activeAssetCategory.value === '形象管理' && assetPreviewFile.value ? ` · 预览：${assetPreviewFile.value.name}` : ''}`
      : existingFileInfo || '新建资产'
    const assetFileInfo = activeAssetCategory.value === '预设背景管理'
      ? assetBackgroundType.value === '透明背景'
        ? '透明背景 · 无需背景素材'
        : assetBackgroundType.value === '网页背景'
        ? `网页背景 · ${assetBackgroundWebUrl.value.trim()}`
        : `${assetBackgroundType.value} · ${uploadedFileInfo}`
      : uploadedFileInfo
    const updatedAsset = {
      ...existingAsset,
      name: projectName.value,
      subtitle: existingAsset?.subtitle || `AST-${Date.now().toString().slice(-6)}`,
      edition: activeAssetEdition.value,
      category: activeAssetCategory.value,
      type: activeAssetCategory.value,
      extra: activeAssetCategory.value === '动作管理' && linkedAvatar
        ? `${assetFileInfo} · 关联：${linkedAvatar.name}`
        : assetFileInfo,
      linkedAvatarId: linkedAvatar?.subtitle || '',
      actionId: activeAssetCategory.value === '动作管理' ? assetActionId.value.trim() : '',
      avatarId: activeAssetCategory.value === '形象管理' ? assetAvatarId.value.trim() : '',
      gender: activeAssetCategory.value === '形象管理'
        ? assetAvatarGender.value
        : activeAssetCategory.value === '音色管理'
          ? assetVoiceGender.value
          : '',
      defaultVoiceId: activeAssetCategory.value === '形象管理' ? assetDefaultVoiceId.value : '',
      description: activeAssetCategory.value === '形象管理'
        ? assetAvatarDescription.value.trim()
        : activeAssetCategory.value === '音色管理'
          ? assetVoiceDescription.value.trim()
          : activeAssetCategory.value === '预设背景管理'
            ? assetBackgroundDescription.value.trim()
            : '',
      preview: activeAssetCategory.value === '形象管理' && assetPreviewFile.value
        ? URL.createObjectURL(assetPreviewFile.value)
        : existingAsset?.preview || '',
      previewName: activeAssetCategory.value === '形象管理' ? assetPreviewFile.value?.name || existingAsset?.previewName || '' : '',
      voiceId: activeAssetCategory.value === '音色管理' ? assetVoiceId.value.trim() : '',
      voiceType: activeAssetCategory.value === '音色管理' ? assetVoiceType.value : '',
      pitch: activeAssetCategory.value === '音色管理' ? assetVoicePitch.value : null,
      speed: activeAssetCategory.value === '音色管理' ? assetVoiceSpeed.value : null,
      backgroundType: activeAssetCategory.value === '预设背景管理' ? assetBackgroundType.value : '',
      backgroundPreview: activeAssetCategory.value === '预设背景管理' && assetBackgroundPreviewFile.value
        ? URL.createObjectURL(assetBackgroundPreviewFile.value)
        : existingAsset?.backgroundPreview || '',
      backgroundPreviewName: activeAssetCategory.value === '预设背景管理'
        ? assetBackgroundPreviewFile.value?.name || existingAsset?.backgroundPreviewName || ''
        : '',
      backgroundMaterialName: activeAssetCategory.value === '预设背景管理'
        ? assetBackgroundMaterialFile.value?.name || existingAsset?.backgroundMaterialName || ''
        : '',
      backgroundWebUrl: activeAssetCategory.value === '预设背景管理' && assetBackgroundType.value === '网页背景'
        ? assetBackgroundWebUrl.value.trim()
        : '',
      date: '刚刚',
      status: '可用',
      tone: activeAssetEdition.value === '2D本地版' ? 'violet' : 'blue',
    }
    if (editingIndex >= 0) assetRows.value[editingIndex] = updatedAsset
    else assetRows.value.unshift(updatedAsset)
    closeModal()
    showToast(editingIndex >= 0 ? '资产修改成功' : '资产创建成功')
    return
  }
  if (route.meta.moduleKey === 'knowledge') {
    const createdAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-').replaceAll('/', '-')
    knowledgeRows.value.unshift({
      name: projectName.value,
      subtitle: `KB-${Date.now().toString().slice(-8)}`,
      type: '文档',
      extra: '0 文档',
      documentCount: 0,
      characterCount: 0,
      linkedApp: '暂无',
      creator: '何文斌',
      createdAt,
      date: '刚刚',
      status: '已启用',
      tone: 'blue',
    })
    closeModal()
    showToast('知识库创建成功')
    return
  }
  if (route.meta.moduleKey === 'agents') {
    const wasEditing = Boolean(editingAgentId.value)
    if (wasEditing) {
      const index = agentRows.value.findIndex((row) => row.subtitle === editingAgentId.value)
      if (index !== -1) agentRows.value[index] = { ...agentRows.value[index], name: projectName.value, description: agentDescription.value, date: '刚刚' }
    } else {
      agentRows.value.unshift({
        name: projectName.value,
        subtitle: `Agent-${Date.now().toString().slice(-3)}`,
        type: '通用助手',
        extra: '暂未关联知识库',
        description: agentDescription.value,
        date: '刚刚',
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-'),
        owner: '何文斌',
        status: '调试中',
        isTemplate: false,
        tone: 'blue',
      })
    }
    closeModal()
    showToast(wasEditing ? '智能体已更新' : '智能体创建成功')
    return
  }
  if (route.meta.moduleKey === 'digitalHumans') {
    const wasEditing = Boolean(editingDigitalHumanCode.value)
    const typeLabel = digitalHumanType.value === 'online' ? '2D在线版' : '2D本地版'
    if (wasEditing) {
      const index = digitalHumanRows.value.findIndex((row) => row.appCode === editingDigitalHumanCode.value)
      if (index !== -1) {
        digitalHumanRows.value[index] = {
          ...digitalHumanRows.value[index],
          name: projectName.value,
          type: typeLabel,
          description: digitalHumanDescription.value,
          extra: associatedAgent.value,
          resolution: videoResolution.value,
        }
      }
    } else {
      const agentId = `Agent-${Date.now().toString().slice(-6)}`
      const agentName = `${projectName.value}智能体`
      const createdAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-')
      const newAgent = {
        name: agentName,
        subtitle: agentId,
        type: '数字人专属智能体',
        extra: '暂未关联知识库',
        description: `数字人“${projectName.value}”自动创建的专属智能体`,
        date: '刚刚',
        createdAt,
        owner: '何文斌',
        status: '调试中',
        isTemplate: false,
        tone: 'blue',
      }
      const newDigitalHuman = {
        name: projectName.value,
        subtitle: '数字人形象',
        type: typeLabel,
        extra: agentName,
        linkedAgentId: agentId,
        description: digitalHumanDescription.value,
        createdAt,
        appCode: generateAppCode(),
        resolution: videoResolution.value,
        preview: typeLabel === '2D在线版' ? moduleData.digitalHumans.rows[0].preview : moduleData.digitalHumans.rows[2].preview,
        isTemplate: false,
        tone: 'violet',
      }
      agentRows.value.unshift(newAgent)
      digitalHumanRows.value.unshift(newDigitalHuman)
      moduleData.agents.rows.unshift(newAgent)
      moduleData.digitalHumans.rows.unshift(newDigitalHuman)
    }
    closeModal()
    showToast(wasEditing ? '数字人设置已保存' : '数字人及专属智能体创建成功')
    return
  }
  closeModal()
  showToast('创建成功，已保存为草稿')
}

function generateAppCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `APP-${part()}-${part()}`
}

function openDigitalHumanSettings(row) {
  editingDigitalHumanCode.value = row.appCode
  projectName.value = row.name
  digitalHumanType.value = row.type === '2D在线版' ? 'online' : 'local'
  digitalHumanDescription.value = row.description
  associatedAgent.value = row.extra
  videoResolution.value = row.resolution
  modalOpen.value = true
}

function deleteDigitalHuman(row) {
  if (!window.confirm(`确定删除数字人“${row.name}”吗？`)) return
  digitalHumanRows.value = digitalHumanRows.value.filter((item) => item.appCode !== row.appCode)
  showToast('数字人已删除')
}

function toggleDigitalHumanTemplate(row) {
  row.isTemplate = !row.isTemplate
  const sourceRow = moduleData.digitalHumans.rows.find((item) => item.appCode === row.appCode)
  if (sourceRow) sourceRow.isTemplate = row.isTemplate
  showToast(row.isTemplate ? '已设为数字人应用模板' : '已取消数字人应用模板')
}

function copyDigitalHuman(row) {
  const sourceAgent = agentRows.value.find((agent) => agent.subtitle === row.linkedAgentId)
    || moduleData.agents.rows.find((agent) => agent.name === row.extra)
  const createdAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-')
  const agentId = `Agent-${Date.now().toString().slice(-6)}`
  const agentName = `${row.name}-副本智能体`
  const copiedAgent = {
    ...(sourceAgent || {}),
    name: agentName,
    subtitle: agentId,
    description: `数字人“${row.name}-副本”自动创建的专属智能体`,
    createdAt,
    date: '刚刚',
    isTemplate: false,
  }
  const copiedHuman = {
    ...row,
    name: `${row.name}-副本`,
    extra: agentName,
    linkedAgentId: agentId,
    createdAt,
    appCode: generateAppCode(),
    isTemplate: false,
  }
  agentRows.value.unshift(copiedAgent)
  digitalHumanRows.value.unshift(copiedHuman)
  moduleData.agents.rows.unshift(copiedAgent)
  moduleData.digitalHumans.rows.unshift(copiedHuman)
  showToast('数字人应用已复制，并创建新的专属智能体')
}

function toggleAgentTemplate(row) {
  row.isTemplate = !row.isTemplate
  showToast(row.isTemplate ? '已设为模板' : '已取消模板')
}

function assignAgent(row) {
  showToast(`已打开“${row.name}”分配设置`)
}

function deleteAgent(row) {
  if (!window.confirm(`确定删除智能体“${row.name}”吗？`)) return
  agentRows.value = agentRows.value.filter((item) => item.subtitle !== row.subtitle)
  showToast('智能体已删除')
}

function deleteKnowledge(row) {
  if (!window.confirm(`确定删除知识库“${row.name}”吗？`)) return
  knowledgeRows.value = knowledgeRows.value.filter((item) => item.subtitle !== row.subtitle)
  showToast('知识库已删除')
}

function manageKnowledge(row) {
  editingKnowledge.value = row
  knowledgeEditName.value = row.name
  knowledgeEditRemark.value = row.remark || ''
  knowledgeEditOpen.value = true
}

function closeKnowledgeEditor() {
  knowledgeEditOpen.value = false
  editingKnowledge.value = null
  knowledgeEditName.value = ''
  knowledgeEditRemark.value = ''
}

function saveKnowledgeEditor() {
  if (!editingKnowledge.value || !knowledgeEditName.value.trim()) return
  editingKnowledge.value.name = knowledgeEditName.value.trim()
  editingKnowledge.value.remark = knowledgeEditRemark.value.trim()
  closeKnowledgeEditor()
  showToast('知识库信息已更新')
}

function copyAgent(row) {
  agentRows.value.unshift({
    ...row,
    name: `${row.name}-副本`,
    subtitle: `Agent-${Date.now().toString().slice(-3)}`,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-'),
    date: '刚刚',
    isTemplate: false,
  })
  showToast('智能体已复制')
}

function openAgentEditor(row) {
  editingAgentId.value = row.subtitle
  projectName.value = row.name
  agentDescription.value = row.description || ''
  modalOpen.value = true
}

function openAgentDetail(row) {
  router.push({ name: 'agentDetail', params: { agentId: row.subtitle } })
}

function openDigitalHumanDetail(row) {
  router.push({ name: 'digitalHumanDetail', params: { appCode: row.appCode } })
}

async function copyAppCode(code) {
  try {
    await navigator.clipboard.writeText(code)
  } catch {
    const input = document.createElement('textarea')
    input.value = code
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }
  showToast('应用码已复制')
}

async function copyAuthorizationCode(code) {
  try {
    await navigator.clipboard.writeText(code)
  } catch {
    const input = document.createElement('textarea')
    input.value = code
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }
  showToast('授权码已复制')
}

function showToast(message) {
  toastMessage.value = message
  toastVisible.value = true
  window.setTimeout(() => { toastVisible.value = false }, 2600)
}

function startTraining(row) {
  row.status = '训练中'
  row.progress = 1
  delete row.failureReason
  showToast('训练已开始')
}

function openActionModal(type, row) {
  actionType.value = type
  selectedTraining.value = row
  failureReason.value = ''
  completionApiKey.value = ''
  completionProjectId.value = ''
  completionAvatarId.value = ''
  completionPreviewFile.value = null
  replacementVideo.value = null
  actionModalOpen.value = true
}

function closeActionModal() {
  actionModalOpen.value = false
  actionType.value = ''
  selectedTraining.value = null
  failureReason.value = ''
  replacementVideo.value = null
  completionPreviewFile.value = null
  if (replacementVideoInput.value) replacementVideoInput.value.value = ''
  if (completionPreviewInput.value) completionPreviewInput.value.value = ''
}

function handleReplacementVideo(event) {
  replacementVideo.value = event.target.files?.[0] || null
}

function clearReplacementVideo() {
  replacementVideo.value = null
  if (replacementVideoInput.value) replacementVideoInput.value.value = ''
}

function handleCompletionPreview(event) {
  completionPreviewFile.value = event.target.files?.[0] || null
}

function clearCompletionPreview() {
  completionPreviewFile.value = null
  if (completionPreviewInput.value) completionPreviewInput.value.value = ''
}

function submitTrainingAction() {
  const row = selectedTraining.value
  if (!row) return

  if (actionType.value === 'reject') {
    row.status = '不通过'
    row.failureReason = failureReason.value.trim()
    row.progress = 0
    showToast('已标记为不通过')
  } else if (actionType.value === 'reupload') {
    row.status = '待训练'
    row.progress = 0
    row.videoName = replacementVideo.value?.name || ''
    delete row.failureReason
    showToast('视频素材已重新上传，等待训练')
  } else if (actionType.value === 'complete') {
    row.status = '已完成'
    row.progress = 100
    row.preview = URL.createObjectURL(completionPreviewFile.value)
    if (row.type === '2D在线版') {
      row.apiKey = completionApiKey.value.trim()
      row.projectId = completionProjectId.value.trim()
    } else {
      row.avatarId = completionAvatarId.value.trim()
    }
    showToast('训练已完成')
  }
  closeActionModal()
}

function statusClass(status) {
  if (['已完成', '运行中', '已上线', '已启用', '使用中', '已使用', '健康', '可用', '当前版本'].includes(status)) return 'success'
  if (['训练中', '处理中', '调试中', '测试中'].includes(status)) return 'processing'
  if (['繁忙', '审核中', '待训练', '等待审核'].includes(status)) return 'warning'
  if (['不通过'].includes(status)) return 'danger'
  return 'neutral'
}
</script>

<template>
  <div class="module-page" :style="{ '--accent': current.accent }">
    <section class="page-heading">
      <div>
        <div class="eyebrow"><span></span>{{ current.eyebrow }}</div>
        <h1>{{ current.title }}</h1>
        <p>{{ current.description }}</p>
      </div>
      <button class="primary-button" :class="{ 'tutorial-target-action': highlightNewTraining || highlightCreateKnowledge || highlightCreateDigitalHuman }" @click="handlePrimaryActionClick">
        <AppIcon name="plus" :size="18" :stroke-width="2.2" />
        {{ primaryActionLabel }}
      </button>
    </section>

    <section v-if="!['digitalHumans', 'agents', 'knowledge'].includes(route.meta.moduleKey)" class="stats-grid" :class="{ 'benefits-stats-grid': route.meta.moduleKey === 'benefits', 'training-stats-grid': route.meta.moduleKey === 'training' }">
      <article v-for="(stat, index) in current.stats" :key="stat.label" class="stat-card" :style="{ '--delay': `${index * 55}ms` }">
        <div class="stat-icon"><AppIcon :name="stat.icon" :size="21" /></div>
        <div class="stat-content">
          <span>{{ stat.label }}</span>
          <strong>{{ stat.value }}</strong>
        </div>
        <span class="stat-change" :class="{ positive: stat.change.startsWith('+') || stat.change.includes('正常') || stat.change.includes('充足') }">
          {{ stat.change }}
        </span>
      </article>
    </section>

    <section class="data-card">
      <div class="data-card-header">
        <div>
          <h2>{{ route.meta.moduleKey === 'benefits' ? '设备授权列表' : `${current.title}列表` }}</h2>
          <p>共 {{ displayRows.length }} 条记录</p>
        </div>
        <div class="toolbar">
          <label class="search-box">
            <AppIcon name="search" :size="18" />
            <input v-model="keyword" type="search" placeholder="搜索名称或编号" />
          </label>
          <div v-if="route.meta.moduleKey === 'digitalHumans'" class="filter-wrap digital-human-type-filter">
            <AppIcon name="filter" :size="17" />
            <select v-model="activeDigitalHumanType" aria-label="数字人类型筛选">
              <option>全部类型</option>
              <option>2D在线版</option>
              <option>2D本地版</option>
            </select>
          </div>
          <div v-else class="filter-wrap">
            <AppIcon name="filter" :size="17" />
            <select v-model="activeFilter" aria-label="状态筛选">
              <option v-for="item in filters" :key="item">{{ item }}</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="route.meta.moduleKey === 'digitalHumans'" class="digital-human-grid">
        <article
          v-for="row in paginatedDigitalHumanRows"
          :key="row.appCode"
          class="digital-human-card"
          role="link"
          tabindex="0"
          @click="openDigitalHumanDetail(row)"
          @keydown.enter="openDigitalHumanDetail(row)"
        >
          <div class="digital-human-card-image">
            <img :src="row.preview" :alt="`${row.name}形象预览`" />
            <span class="digital-human-type">{{ row.type }}</span>
            <span v-if="row.isTemplate" class="digital-human-template-badge"><AppIcon name="check" :size="12" />模板</span>
            <span class="card-preview-action">进入详情<AppIcon name="chevron" :size="15" /></span>
          </div>
          <div class="digital-human-card-body">
            <div class="digital-human-card-heading">
              <div>
                <h3>{{ row.name }}</h3>
                <span>{{ row.subtitle }}</span>
              </div>
              <span class="resolution-badge">{{ row.resolution }}</span>
            </div>
            <p class="digital-human-card-description">{{ row.description }}</p>
            <dl class="digital-human-meta">
              <div><dt>创建时间</dt><dd>{{ row.createdAt }}</dd></div>
              <div>
                <dt>应用码</dt>
                <dd class="app-code-wrap">
                  <code>{{ row.appCode }}</code>
                  <button type="button" class="copy-code-button" :aria-label="`复制应用码${row.appCode}`" title="复制应用码" @click.stop="copyAppCode(row.appCode)">
                    <AppIcon name="copy" :size="14" />
                  </button>
                </dd>
              </div>
            </dl>
            <div class="digital-human-card-actions">
              <button class="card-template-button" :class="{ active: row.isTemplate }" @click.stop="toggleDigitalHumanTemplate(row)"><AppIcon name="check" :size="15" />{{ row.isTemplate ? '取消模板' : '设为模板' }}</button>
              <button class="card-delete-button" @click.stop="deleteDigitalHuman(row)"><AppIcon name="close" :size="15" />删除</button>
              <button class="card-copy-button" @click.stop="copyDigitalHuman(row)"><AppIcon name="copy" :size="15" />复制</button>
              <button class="card-settings-button" @click.stop="openDigitalHumanSettings(row)"><AppIcon name="edit" :size="15" />设置</button>
            </div>
          </div>
        </article>
        <div v-if="filteredRows.length === 0" class="empty-state digital-human-empty">
          <AppIcon name="search" :size="30" />
          <strong>没有找到匹配的数字人</strong>
          <span>试试调整搜索关键词</span>
        </div>
        <div v-if="filteredRows.length > 0" class="digital-human-pagination">
          <span>每页 4 条，共 {{ filteredRows.length }} 条</span>
          <div class="pagination" aria-label="数字人列表分页">
            <button type="button" :disabled="digitalHumanPage === 1" @click="digitalHumanPage--">上一页</button>
            <button type="button" class="active" aria-current="page">{{ digitalHumanPage }}</button>
            <button type="button" :disabled="digitalHumanPage === digitalHumanTotalPages" @click="digitalHumanPage++">下一页</button>
          </div>
          <span>第 {{ digitalHumanPage }} / {{ digitalHumanTotalPages }} 页</span>
        </div>
      </div>

      <div v-else-if="route.meta.moduleKey === 'agents'" class="agent-card-grid">
        <article
          v-for="row in filteredRows"
          :key="row.subtitle"
          class="agent-list-card"
          role="link"
          tabindex="0"
          @click="openAgentDetail(row)"
          @keydown.enter="openAgentDetail(row)"
        >
          <span v-if="row.isTemplate" class="agent-template-badge">模板</span>
          <div class="agent-card-title">
            <span class="agent-card-icon" :class="row.tone"><AppIcon name="bot" :size="20" /></span>
            <div><h3>{{ row.name }}</h3><small>{{ row.subtitle }}</small></div>
          </div>
          <div class="agent-card-meta">
            <span><AppIcon name="user" :size="15" />{{ row.owner }}</span>
            <span><AppIcon name="clock" :size="15" />{{ row.createdAt }}</span>
          </div>
          <div class="agent-card-actions">
            <button @click.stop="toggleAgentTemplate(row)"><AppIcon name="check" :size="14" />{{ row.isTemplate ? '取消模板' : '设为模板' }}</button>
            <button @click.stop="assignAgent(row)"><AppIcon name="chevron" :size="14" />分配</button>
            <button class="danger" @click.stop="deleteAgent(row)"><AppIcon name="close" :size="14" />删除</button>
            <button @click.stop="copyAgent(row)"><AppIcon name="copy" :size="14" />复制</button>
            <button @click.stop="openAgentEditor(row)"><AppIcon name="edit" :size="14" />编辑</button>
          </div>
        </article>
        <div v-if="filteredRows.length === 0" class="empty-state agent-card-empty">
          <AppIcon name="search" :size="30" />
          <strong>没有找到匹配的智能体</strong>
          <span>试试调整搜索关键词或筛选条件</span>
        </div>
      </div>

      <div v-else-if="route.meta.moduleKey === 'knowledge'" class="knowledge-card-grid">
        <article v-for="row in filteredRows" :key="row.subtitle" class="knowledge-list-card">
          <div class="knowledge-card-heading">
            <h3 :title="row.name">{{ row.name }}</h3>
          </div>
          <div class="knowledge-card-stats">
            <span><AppIcon name="file" :size="14" />{{ row.documentCount ?? row.extra }}{{ typeof row.documentCount === 'number' ? ' 文档' : '' }}</span>
            <span><AppIcon name="file" :size="14" />{{ row.characterCount ?? '—' }}{{ typeof row.characterCount === 'number' ? ' 字符' : '' }}</span>
          </div>
          <dl class="knowledge-card-meta">
            <div><dt>关联应用：</dt><dd>{{ row.linkedApp || '暂无' }}</dd></div>
            <div><dt>创建用户：</dt><dd>{{ row.creator || 'admin' }}</dd></div>
            <div><dt>创建时间：</dt><dd>{{ row.createdAt || row.date }}</dd></div>
          </dl>
          <div class="knowledge-card-actions">
            <button type="button" class="danger" @click="deleteKnowledge(row)"><AppIcon name="trash" :size="14" />删除</button>
            <button type="button" @click="manageKnowledge(row)"><AppIcon name="server" :size="14" />管理</button>
          </div>
        </article>
        <div v-if="filteredRows.length === 0" class="empty-state knowledge-card-empty">
          <AppIcon name="search" :size="30" />
          <strong>没有找到匹配的知识库</strong>
          <span>试试调整搜索关键词或筛选条件</span>
        </div>
      </div>

      <div v-else-if="route.meta.moduleKey === 'resources'" class="resource-tab-content">
        <div class="resource-tabs" role="tablist" aria-label="资源类型">
          <button v-for="tab in resourceTabs" :key="tab" type="button" role="tab" :aria-selected="activeResourceTab === tab" :class="{ active: activeResourceTab === tab }" @click="activeResourceTab = tab">
            <AppIcon :name="tab === '语音识别资源池' ? 'message' : tab === '语音合成资源池' ? 'video' : 'server'" :size="15" />
            {{ tab }}
            <span>{{ filteredRows.filter((row) => row.type === tab).length }}</span>
          </button>
        </div>
        <div class="table-scroll">
          <table class="resource-type-table">
            <thead><tr><th>资源名称</th><th>配置信息</th><th>创建时间</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="row in filteredResourceRows" :key="row.subtitle">
                <td><div class="entity-cell"><span class="entity-avatar" :class="row.tone"><AppIcon :name="row.type === '语音识别资源池' ? 'message' : row.type === '语音合成资源池' ? 'video' : 'server'" :size="17" /></span><span><strong>{{ row.name }}</strong><small>{{ row.subtitle }}</small></span></div></td>
                <td><div class="resource-config-summary"><span>{{ row.extra }}</span><small v-if="row.appId">APPID：{{ row.appId }}</small><small v-else>license.key 已安全保存</small></div></td>
                <td>{{ row.date }}</td>
                <td><span class="status-tag" :class="statusClass(row.status)"><i></i>{{ row.status }}</span></td>
                <td><div class="resource-row-actions"><button type="button" @click="openResourceEditor(row)"><AppIcon name="edit" :size="13" />编辑</button><button type="button" class="danger" @click="deleteResource(row)"><AppIcon name="trash" :size="13" />删除</button></div></td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredResourceRows.length === 0" class="empty-state"><AppIcon name="server" :size="30" /><strong>当前类型暂无资源</strong><span>点击右上角“新增资源”开始添加</span></div>
        </div>
      </div>

      <div v-else-if="route.meta.moduleKey === 'assets'" class="asset-classified-content">
        <div class="asset-edition-tabs" role="tablist" aria-label="数字人资产类型">
          <button v-for="edition in ['2D本地版', '2D在线版']" :key="edition" type="button" role="tab" :aria-selected="activeAssetEdition === edition" :class="{ active: activeAssetEdition === edition }" @click="selectAssetEdition(edition)">
            <AppIcon :name="edition === '2D本地版' ? 'server' : 'video'" :size="17" />
            <span><strong>{{ edition }}</strong><small>{{ edition === '2D本地版' ? '本地部署资产' : '云端在线资产' }}</small></span>
            <em>{{ filteredRows.filter((row) => row.edition === edition).length }}</em>
          </button>
        </div>
        <div class="asset-category-tabs" role="tablist" aria-label="资产模块">
          <button v-for="category in assetCategories" :key="category" type="button" role="tab" :aria-selected="activeAssetCategory === category" :class="{ active: activeAssetCategory === category }" @click="selectAssetCategory(category)">
            {{ category }}<span>{{ filteredRows.filter((row) => row.edition === activeAssetEdition && row.category === category).length }}</span>
          </button>
        </div>
        <div v-if="activeAssetCategory === '预设背景管理'" class="background-type-filters" role="group" aria-label="背景类型筛选">
          <span>背景类型</span>
          <button v-for="type in ['全部类型', '透明背景', '图片背景', '视频背景', '网页背景']" :key="type" type="button" :class="{ active: activeBackgroundType === type }" @click="activeBackgroundType = type">
            {{ type }}
            <em>{{ type === '全部类型' ? filteredRows.filter((row) => row.edition === activeAssetEdition && row.category === '预设背景管理').length : filteredRows.filter((row) => row.edition === activeAssetEdition && row.category === '预设背景管理' && row.backgroundType === type).length }}</em>
          </button>
        </div>
        <div class="table-scroll">
          <table class="asset-classified-table">
            <thead><tr><th>资产名称</th><th>版本类型</th><th>资产模块</th><th>文件信息</th><th>更新时间</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="row in filteredAssetRows" :key="row.subtitle">
                <td>
                  <div class="entity-cell">
                    <button v-if="row.category === '形象管理' && row.preview" type="button" class="asset-avatar-preview-button" :aria-label="`放大查看${row.name}形象预览图`" title="点击放大预览" @click="openImagePreview(row)">
                      <img :src="row.preview" :alt="`${row.name}形象预览图`" />
                    </button>
                    <button v-else-if="row.category === '预设背景管理' && row.backgroundPreview" type="button" class="asset-background-preview" :aria-label="`放大查看${row.name}背景预览图`" title="点击放大预览" @click="openBackgroundPreview(row)">
                      <img :src="row.backgroundPreview" :alt="`${row.name}背景预览图`" />
                    </button>
                    <span v-else class="entity-avatar" :class="row.tone"><AppIcon :name="row.category === '动作管理' ? 'workflow' : row.category === '音色管理' ? 'message' : row.category === '预设背景管理' ? 'image' : 'user'" :size="17" /></span>
                    <span><strong>{{ row.name }}</strong><small>{{ row.subtitle }}</small></span>
                  </div>
                </td>
                <td><span class="type-tag">{{ row.edition }}</span></td>
                <td>{{ row.category }}</td>
                <td>{{ row.extra }}</td>
                <td>{{ row.date }}</td>
                <td><span class="status-tag" :class="statusClass(row.status)"><i></i>{{ row.status }}</span></td>
                <td class="action-column">
                  <div class="asset-row-actions">
                    <button v-if="['形象管理', '预设背景管理'].includes(row.category)" type="button" class="asset-default-button" :class="{ active: row.isDefault }" :disabled="row.isDefault" @click="setDefaultAsset(row)"><AppIcon name="check" :size="13" />{{ row.isDefault ? '当前默认' : '设为默认' }}</button>
                    <button type="button" @click="openAssetEditor(row)"><AppIcon name="edit" :size="13" />编辑</button>
                    <button type="button" class="danger" @click="deleteAsset(row)"><AppIcon name="trash" :size="13" />删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredAssetRows.length === 0" class="empty-state"><AppIcon name="folder" :size="30" /><strong>当前分类暂无资产</strong><span>点击右上角“上传资产”开始添加</span></div>
        </div>
      </div>

      <div v-else-if="route.meta.moduleKey === 'benefits'" class="table-scroll benefit-table-scroll">
        <table class="benefit-authorization-table">
          <thead><tr><th>授权名称</th><th>授权码</th><th>使用状态</th><th>到期时间</th><th>创建时间</th><th>绑定设备MAC地址</th></tr></thead>
          <tbody>
            <tr v-for="row in filteredRows" :key="row.subtitle">
              <td><div class="benefit-name-cell"><span><AppIcon name="server" :size="16" /></span><strong>{{ row.name }}</strong></div></td>
              <td><span class="authorization-code-wrap"><code>{{ row.subtitle }}</code><button type="button" :aria-label="`复制授权码${row.subtitle}`" title="复制授权码" @click="copyAuthorizationCode(row.subtitle)"><AppIcon name="copy" :size="13" /></button></span></td>
              <td><span class="status-tag" :class="statusClass(row.status)"><i></i>{{ row.status }}</span></td>
              <td>{{ row.expiryAt }}</td>
              <td>{{ row.createdAt }}</td>
              <td><span class="mac-address">{{ row.macAddress || '—' }}</span></td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredRows.length === 0" class="empty-state"><AppIcon name="search" :size="30" /><strong>没有找到匹配的设备授权</strong><span>试试调整搜索关键词或状态筛选</span></div>
      </div>

      <div v-else class="table-scroll">
        <table :class="{ 'training-table': route.meta.moduleKey === 'training' }">
          <thead>
            <tr>
              <th v-for="column in current.columns" :key="column">{{ column }}</th>
              <th class="action-column">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredRows" :key="row.subtitle">
              <td>
                <div class="entity-cell">
                  <button v-if="route.meta.moduleKey === 'training'" type="button" class="entity-preview" :aria-label="`放大预览${row.name}`" @click="openImagePreview(row)">
                    <img :src="row.preview" :alt="`${row.name}形象预览`" />
                    <span class="preview-zoom"><AppIcon name="search" :size="15" /></span>
                  </button>
                  <span v-else class="entity-avatar" :class="row.tone">{{ row.name.slice(0, 1) }}</span>
                  <span><strong>{{ row.name }}</strong><small>{{ row.subtitle }}</small></span>
                </div>
              </td>
              <td><span class="type-tag">{{ row.type }}</span></td>
              <td>{{ row.extra || row.date }}</td>
              <td v-if="!['training', 'digitalHumans'].includes(route.meta.moduleKey)">{{ row.date }}</td>
              <td v-if="route.meta.moduleKey !== 'digitalHumans'">
                <div class="status-cell">
                  <span class="status-tag" :class="statusClass(row.status)"><i></i>{{ row.status }}</span>
                  <small v-if="row.status === '不通过' && row.failureReason" class="failure-reason" :title="row.failureReason">
                    原因：{{ row.failureReason }}
                  </small>
                </div>
              </td>
              <td v-if="route.meta.moduleKey === 'training'" class="action-column training-actions-column">
                <div class="row-actions">
                  <button v-if="row.status === '不通过'" class="table-action-button" @click="openActionModal('reupload', row)">
                    <AppIcon name="video" :size="14" />重新上传
                  </button>
                  <template v-else-if="row.status === '待训练'">
                    <button class="table-action-button primary-action" @click="startTraining(row)">
                      <AppIcon name="sparkles" :size="14" />开始训练
                    </button>
                    <button class="table-action-button danger-action" @click="openActionModal('reject', row)">不通过</button>
                  </template>
                  <button v-else-if="row.status === '训练中'" class="table-action-button success-action" @click="openActionModal('complete', row)">
                    <AppIcon name="check" :size="14" />训练完成
                  </button>
                  <span v-else class="action-empty">—</span>
                </div>
              </td>
              <td v-else class="action-column"><button class="more-button" aria-label="更多操作"><AppIcon name="more" :size="19" /></button></td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredRows.length === 0" class="empty-state">
          <AppIcon name="search" :size="30" />
          <strong>没有找到匹配内容</strong>
          <span>试试调整搜索关键词或筛选条件</span>
        </div>
      </div>

      <div v-if="!['digitalHumans', 'agents', 'knowledge', 'resources', 'assets'].includes(route.meta.moduleKey)" class="table-footer">
        <span>显示 1–{{ filteredRows.length }} 条，共 {{ filteredRows.length }} 条</span>
        <div class="pagination"><button disabled>上一页</button><button class="active">1</button><button disabled>下一页</button></div>
      </div>
    </section>

    <Transition name="fade">
      <div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-card" :class="{ 'training-modal': route.meta.moduleKey === 'training', 'digital-human-modal': route.meta.moduleKey === 'digitalHumans', 'avatar-asset-modal': route.meta.moduleKey === 'assets' && activeAssetCategory === '形象管理', 'voice-asset-modal': route.meta.moduleKey === 'assets' && activeAssetCategory === '音色管理', 'background-asset-modal': route.meta.moduleKey === 'assets' && activeAssetCategory === '预设背景管理' }">
          <button class="modal-close" aria-label="关闭" @click="closeModal"><AppIcon name="close" /></button>
          <div class="modal-icon"><AppIcon :name="current.icon" :size="25" /></div>
          <h3>{{ editingAgentId ? '编辑智能体' : editingAssetId ? `编辑${activeAssetCategory.replace('管理', '')}资产` : route.meta.moduleKey === 'digitalHumans' && editingDigitalHumanCode ? '设置数字人' : primaryActionLabel }}</h3>
          <p>{{ editingAgentId ? '修改智能体的名称和说明信息。' : editingAssetId ? '修改资产信息，未重新上传的素材将保留原文件。' : route.meta.moduleKey === 'digitalHumans' && editingDigitalHumanCode ? '修改数字人的基础信息与关联配置。' : '填写基础信息，后续可以继续完善详细配置。' }}</p>
          <form @submit.prevent="submitCreate">
            <label>{{ route.meta.moduleKey === 'assets' && activeAssetCategory === '形象管理' ? '形象名称' : route.meta.moduleKey === 'assets' && activeAssetCategory === '动作管理' ? '动作名称' : route.meta.moduleKey === 'assets' && activeAssetCategory === '音色管理' ? '音色名称' : route.meta.moduleKey === 'assets' && activeAssetCategory === '预设背景管理' ? '背景名称' : '名称' }}</label>
            <input v-model="projectName" autofocus required :placeholder="route.meta.moduleKey === 'assets' && activeAssetCategory === '形象管理' ? '请输入形象名称' : route.meta.moduleKey === 'assets' && activeAssetCategory === '动作管理' ? '请输入动作名称' : route.meta.moduleKey === 'assets' && activeAssetCategory === '音色管理' ? '请输入音色名称' : route.meta.moduleKey === 'assets' && activeAssetCategory === '预设背景管理' ? '请输入背景名称' : `请输入${current.title}名称`" />
            <template v-if="route.meta.moduleKey === 'training'">
              <fieldset class="type-fieldset">
                <legend>数字人类型</legend>
                <div class="type-options">
                  <label class="type-option" :class="{ selected: digitalHumanType === 'online' }">
                    <input v-model="digitalHumanType" type="radio" name="digital-human-type" value="online" required />
                    <span class="type-radio"></span>
                    <span class="type-copy"><strong>2D在线版</strong><small>云端训练与在线使用</small></span>
                  </label>
                  <label class="type-option" :class="{ selected: digitalHumanType === 'local' }">
                    <input v-model="digitalHumanType" type="radio" name="digital-human-type" value="local" required />
                    <span class="type-radio"></span>
                    <span class="type-copy"><strong>2D本地版</strong><small>本地部署与离线使用</small></span>
                  </label>
                </div>
              </fieldset>

              <fieldset v-if="digitalHumanType === 'local'" class="type-fieldset local-avatar-type-fieldset">
                <legend>形象类型</legend>
                <div class="type-options">
                  <label class="type-option" :class="{ selected: localAvatarType === '播报形象' }">
                    <input v-model="localAvatarType" type="radio" name="local-avatar-type" value="播报形象" required />
                    <span class="type-radio"></span>
                    <span class="type-copy"><strong>播报形象</strong><small>用于讲解、播报和口型驱动</small></span>
                  </label>
                  <label class="type-option" :class="{ selected: localAvatarType === '动作形象' }">
                    <input v-model="localAvatarType" type="radio" name="local-avatar-type" value="动作形象" required />
                    <span class="type-radio"></span>
                    <span class="type-copy"><strong>动作形象</strong><small>用于动作编排和姿态展示</small></span>
                  </label>
                </div>
              </fieldset>

              <label>视频素材</label>
              <label class="video-upload" :class="{ 'has-file': videoFile }">
                <input ref="videoInput" type="file" accept="video/*" required @change="handleVideoChange" />
                <span class="upload-icon"><AppIcon :name="videoFile ? 'check' : 'video'" :size="22" /></span>
                <span class="upload-copy">
                  <strong>{{ videoFile ? videoFile.name : '点击上传视频素材' }}</strong>
                  <small>{{ videoFile ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB` : '支持 MP4、MOV、AVI 等常用视频格式' }}</small>
                </span>
                <button v-if="videoFile" type="button" class="upload-remove" aria-label="移除视频" @click.prevent="clearVideo">
                  <AppIcon name="close" :size="16" />
                </button>
                <span v-else class="upload-action">选择文件</span>
              </label>
              <Transition name="requirements">
                <div v-if="digitalHumanType === 'online'" class="video-requirements">
                  <div class="requirements-title">
                    <AppIcon name="file" :size="16" />
                    <strong>视频录制要求</strong>
                  </div>
                  <ol>
                    <li>请选择安静无杂音的房间录制，背景干净整洁，没有玻璃等反光物品。</li>
                    <li>可选择坐姿或站姿，头部保持在画面正中 1/3 处，眼睛正对镜头。</li>
                    <li>全程请勿遮挡面部，不要佩戴饰品或有线耳机，衣领不要过高，露出颈部。</li>
                    <li>前 15 秒保持嘴巴闭合、无需动作；读文案时可配合自然动作；每句话读完后，嘴部需闭合 2–4 秒，偶尔读错无影响。</li>
                    <li>视频长度需为 3–6 分钟，分辨率需为 1080p～4K，文件大小不超过 4GB，视频中不能有黑帧。</li>
                  </ol>
                </div>
                <div v-else-if="digitalHumanType === 'local'" class="video-requirements">
                  <div class="requirements-title">
                    <AppIcon name="file" :size="16" />
                    <strong>视频录制要求</strong>
                  </div>
                  <ol>
                    <li>录制闭嘴、不说话的正脸人物视频。</li>
                    <li>视频分辨率不大于 2K。</li>
                    <li>视频时长低于 30 秒。</li>
                    <li>支持 MP4、AVI、MOV、WEBM 格式。</li>
                    <li>文件大小不超过 50MB。</li>
                  </ol>
                </div>
              </Transition>
            </template>
            <template v-else-if="route.meta.moduleKey === 'digitalHumans'">
              <fieldset class="type-fieldset">
                <legend>数字人类型</legend>
                <div class="type-options">
                  <label class="type-option" :class="{ selected: digitalHumanType === 'online' }">
                    <input v-model="digitalHumanType" type="radio" name="create-digital-human-type" value="online" required />
                    <span class="type-radio"></span>
                    <span class="type-copy"><strong>2D在线版</strong><small>云端运行与在线调用</small></span>
                  </label>
                  <label class="type-option" :class="{ selected: digitalHumanType === 'local' }">
                    <input v-model="digitalHumanType" type="radio" name="create-digital-human-type" value="local" required />
                    <span class="type-radio"></span>
                    <span class="type-copy"><strong>2D本地版</strong><small>本地部署与离线运行</small></span>
                  </label>
                </div>
              </fieldset>

              <label for="digital-human-description">描述</label>
              <textarea id="digital-human-description" v-model.trim="digitalHumanDescription" rows="3" required placeholder="请输入数字人的用途和场景描述"></textarea>

              <div class="auto-agent-note">
                <AppIcon name="bot" :size="18" />
                <div><strong>自动创建专属智能体</strong><span>创建数字人应用后，系统将自动生成一个智能体并进行一对一关联。</span></div>
              </div>

              <fieldset class="resolution-fieldset">
                <legend>分辨率设置</legend>
                <div class="resolution-options">
                  <label :class="{ selected: videoResolution === '16:9' }">
                    <input v-model="videoResolution" type="radio" name="video-resolution" value="16:9" required />
                    <span class="resolution-shape landscape"></span>
                    <span class="resolution-copy"><strong>16:9</strong><small>横屏</small></span>
                    <span class="resolution-radio"></span>
                  </label>
                  <label :class="{ selected: videoResolution === '9:16' }">
                    <input v-model="videoResolution" type="radio" name="video-resolution" value="9:16" required />
                    <span class="resolution-shape portrait"></span>
                    <span class="resolution-copy"><strong>9:16</strong><small>竖屏</small></span>
                    <span class="resolution-radio"></span>
                  </label>
                </div>
              </fieldset>
            </template>
            <template v-else-if="route.meta.moduleKey === 'assets' && activeAssetCategory === '形象管理'">
              <label for="asset-avatar-id">形象ID</label>
              <input id="asset-avatar-id" v-model.trim="assetAvatarId" required placeholder="请输入形象ID" />
              <div class="avatar-asset-form-grid">
                <div>
                  <label for="asset-avatar-gender">性别分类</label>
                  <select id="asset-avatar-gender" v-model="assetAvatarGender" required>
                    <option value="女">女</option>
                    <option value="男">男</option>
                  </select>
                </div>
                <div>
                  <label for="asset-default-voice">绑定默认音色</label>
                  <select id="asset-default-voice" v-model="assetDefaultVoiceId" required>
                    <option value="" disabled>请选择默认音色</option>
                    <option v-for="voice in assetVoiceOptions" :key="voice.subtitle" :value="voice.subtitle">{{ voice.name }}（{{ voice.subtitle }}）</option>
                  </select>
                </div>
              </div>
              <small v-if="!assetVoiceOptions.length" class="form-error">暂无可绑定音色，请先上传音色资产</small>
              <label for="asset-avatar-description">形象描述</label>
              <textarea id="asset-avatar-description" v-model.trim="assetAvatarDescription" rows="3" maxlength="200" required placeholder="请输入形象特点和适用场景"></textarea>
              <label>形象视频</label>
              <label class="video-upload" :class="{ 'has-file': videoFile }">
                <input ref="videoInput" type="file" accept="video/mp4,video/quicktime,video/webm,video/x-msvideo" :required="!editingAssetId" @change="handleVideoChange" />
                <span class="upload-icon"><AppIcon :name="videoFile ? 'check' : 'video'" :size="22" /></span>
                <span class="upload-copy">
                  <strong>{{ videoFile ? videoFile.name : '点击上传形象视频' }}</strong>
                  <small>{{ videoFile ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB` : '支持 MP4、MOV、WEBM、AVI 视频格式' }}</small>
                </span>
                <button v-if="videoFile" type="button" class="upload-remove" aria-label="移除形象视频" @click.prevent="clearVideo"><AppIcon name="close" :size="16" /></button>
                <span v-else class="upload-action">选择视频</span>
              </label>
              <label>形象预览图</label>
              <label class="video-upload asset-preview-upload" :class="{ 'has-file': assetPreviewFile }">
                <input ref="assetPreviewInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" :required="!editingAssetId" @change="handleAssetPreviewChange" />
                <span class="upload-icon"><img v-if="assetPreviewUrl" :src="assetPreviewUrl" alt="形象预览图缩略图" /><AppIcon v-else name="image" :size="22" /></span>
                <span class="upload-copy"><strong>{{ assetPreviewFile ? assetPreviewFile.name : '点击上传形象预览图' }}</strong><small>{{ assetPreviewFile ? `${(assetPreviewFile.size / 1024 / 1024).toFixed(1)} MB` : '支持 JPG、PNG、WEBP、GIF，建议使用9:16图片' }}</small></span>
                <button v-if="assetPreviewFile" type="button" class="upload-remove" aria-label="移除形象预览图" @click.prevent="clearAssetPreview"><AppIcon name="close" :size="16" /></button>
                <span v-else class="upload-action">选择图片</span>
              </label>
            </template>
            <template v-else-if="route.meta.moduleKey === 'assets' && activeAssetCategory === '动作管理'">
              <label for="asset-action-id">动作ID</label>
              <input id="asset-action-id" v-model.trim="assetActionId" required placeholder="请输入动作ID，例如 xiaoran_action03" />
              <label>动作视频</label>
              <label class="video-upload" :class="{ 'has-file': videoFile }">
                <input ref="videoInput" type="file" accept="video/mp4,video/quicktime,video/webm,video/x-msvideo" :required="!editingAssetId" @change="handleVideoChange" />
                <span class="upload-icon"><AppIcon :name="videoFile ? 'check' : 'video'" :size="22" /></span>
                <span class="upload-copy"><strong>{{ videoFile ? videoFile.name : '点击上传动作视频' }}</strong><small>{{ videoFile ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB` : '支持 MP4、MOV、WEBM、AVI 视频格式' }}</small></span>
                <button v-if="videoFile" type="button" class="upload-remove" aria-label="移除动作视频" @click.prevent="clearVideo"><AppIcon name="close" :size="16" /></button>
                <span v-else class="upload-action">选择视频</span>
              </label>
              <label for="asset-linked-avatar">关联形象资产</label>
              <select id="asset-linked-avatar" v-model="associatedAssetId" class="asset-link-select" required>
                <option value="" disabled>请选择需要关联的形象资产</option>
                <option v-for="avatar in assetAvatarOptions" :key="avatar.subtitle" :value="avatar.subtitle">{{ avatar.name }}（{{ avatar.subtitle }}）</option>
              </select>
              <small v-if="!assetAvatarOptions.length" class="form-error">当前版本暂无可关联的形象资产，请先上传形象资产</small>
            </template>
            <template v-else-if="route.meta.moduleKey === 'assets' && activeAssetCategory === '音色管理'">
              <div class="voice-asset-form-grid">
                <div><label for="asset-voice-id">音色ID</label><input id="asset-voice-id" v-model.trim="assetVoiceId" required placeholder="请输入音色ID" /></div>
                <div><label for="asset-voice-gender">性别分类</label><select id="asset-voice-gender" v-model="assetVoiceGender" required><option>女声</option><option>男声</option></select></div>
              </div>
              <fieldset class="voice-type-fieldset">
                <legend>音色类型</legend>
                <div class="voice-type-options">
                  <label :class="{ selected: assetVoiceType === '标准音色' }"><input v-model="assetVoiceType" type="radio" value="标准音色" /><span class="type-radio"></span><span><strong>标准音色</strong><small>平台通用标准声音</small></span></label>
                  <label :class="{ selected: assetVoiceType === '定制音色' }"><input v-model="assetVoiceType" type="radio" value="定制音色" /><span class="type-radio"></span><span><strong>定制音色</strong><small>专属训练定制声音</small></span></label>
                </div>
              </fieldset>
              <div class="voice-range-grid">
                <label for="asset-voice-pitch"><span>语调</span><strong>{{ Number(assetVoicePitch).toFixed(1) }}</strong><input id="asset-voice-pitch" v-model.number="assetVoicePitch" type="range" min="0" max="3" step="0.1" /></label>
                <label for="asset-voice-speed"><span>音速</span><strong>{{ Number(assetVoiceSpeed).toFixed(1) }}</strong><input id="asset-voice-speed" v-model.number="assetVoiceSpeed" type="range" min="0" max="3" step="0.1" /></label>
              </div>
              <label for="asset-voice-description">描述</label>
              <textarea id="asset-voice-description" v-model.trim="assetVoiceDescription" rows="3" maxlength="200" required placeholder="请输入音色特点和适用场景"></textarea>
              <label>音色试听音频</label>
              <label class="video-upload voice-audio-upload" :class="{ 'has-file': assetAudioFile }">
                <input ref="assetAudioInput" type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4" :required="!editingAssetId" @change="handleAssetAudioChange" />
                <span class="upload-icon"><AppIcon :name="assetAudioFile ? 'check' : 'message'" :size="22" /></span>
                <span class="upload-copy"><strong>{{ assetAudioFile ? assetAudioFile.name : '点击上传音色试听音频' }}</strong><small>{{ assetAudioFile ? `${(assetAudioFile.size / 1024 / 1024).toFixed(1)} MB` : '支持 MP3、WAV、OGG、M4A 音频格式' }}</small></span>
                <button v-if="assetAudioFile" type="button" class="upload-remove" aria-label="移除试听音频" @click.prevent="clearAssetAudio"><AppIcon name="close" :size="16" /></button>
                <span v-else class="upload-action">选择音频</span>
              </label>
              <audio v-if="assetAudioPreviewUrl" class="voice-audio-preview" :src="assetAudioPreviewUrl" controls></audio>
            </template>
            <template v-else-if="route.meta.moduleKey === 'assets' && activeAssetCategory === '预设背景管理'">
              <fieldset class="background-type-fieldset">
                <legend>背景类型</legend>
                <div class="background-type-options">
                  <label v-for="type in ['透明背景', '图片背景', '视频背景', '网页背景']" :key="type" :class="{ selected: assetBackgroundType === type }">
                    <input v-model="assetBackgroundType" type="radio" name="asset-background-type" :value="type" required />
                    <span class="background-type-icon"><AppIcon :name="type === '视频背景' ? 'video' : type === '网页背景' ? 'link' : 'image'" :size="18" /></span>
                    <span><strong>{{ type }}</strong><small>{{ type === '透明背景' ? '使用透明通道素材' : type === '图片背景' ? '使用静态图片素材' : type === '视频背景' ? '使用动态视频素材' : '嵌入网页地址' }}</small></span>
                  </label>
                </div>
              </fieldset>

              <label>背景预览图片</label>
              <label class="video-upload asset-preview-upload" :class="{ 'has-file': assetBackgroundPreviewFile }">
                <input ref="assetBackgroundPreviewInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" :required="!editingAssetId" @change="handleAssetBackgroundPreviewChange" />
                <span class="upload-icon"><img v-if="assetBackgroundPreviewUrl" :src="assetBackgroundPreviewUrl" alt="背景预览图片缩略图" /><AppIcon v-else name="image" :size="22" /></span>
                <span class="upload-copy"><strong>{{ assetBackgroundPreviewFile ? assetBackgroundPreviewFile.name : editingAssetId ? '保留原背景预览图片，或点击替换' : '点击上传背景预览图片' }}</strong><small>{{ assetBackgroundPreviewFile ? `${(assetBackgroundPreviewFile.size / 1024 / 1024).toFixed(1)} MB` : '支持 JPG、PNG、WEBP、GIF' }}</small></span>
                <button v-if="assetBackgroundPreviewFile" type="button" class="upload-remove" aria-label="移除背景预览图片" @click.prevent="clearAssetBackgroundPreview"><AppIcon name="close" :size="16" /></button>
                <span v-else class="upload-action">选择图片</span>
              </label>

              <template v-if="assetBackgroundType === '网页背景'">
                <label for="asset-background-web-url">背景素材</label>
                <input id="asset-background-web-url" v-model.trim="assetBackgroundWebUrl" type="url" required placeholder="请输入网页地址，例如 https://example.com/background" />
              </template>
              <template v-else-if="assetBackgroundType !== '透明背景'">
                <label>背景素材</label>
                <label class="video-upload" :class="{ 'has-file': assetBackgroundMaterialFile }">
                  <input ref="assetBackgroundMaterialInput" type="file" :accept="assetBackgroundType === '视频背景' ? 'video/mp4,video/quicktime,video/webm' : 'image/png,image/webp,image/jpeg'" :required="!editingAssetId" @change="handleAssetBackgroundMaterialChange" />
                  <span class="upload-icon"><AppIcon :name="assetBackgroundMaterialFile ? 'check' : assetBackgroundType === '视频背景' ? 'video' : 'image'" :size="22" /></span>
                  <span class="upload-copy"><strong>{{ assetBackgroundMaterialFile ? assetBackgroundMaterialFile.name : editingAssetId ? '保留原背景素材，或点击替换' : '点击上传背景素材' }}</strong><small>{{ assetBackgroundMaterialFile ? `${(assetBackgroundMaterialFile.size / 1024 / 1024).toFixed(1)} MB` : assetBackgroundType === '视频背景' ? '支持 MP4、MOV、WEBM' : assetBackgroundType === '透明背景' ? '支持带透明通道的 PNG、WEBP' : '支持 JPG、PNG、WEBP' }}</small></span>
                  <button v-if="assetBackgroundMaterialFile" type="button" class="upload-remove" aria-label="移除背景素材" @click.prevent="clearAssetBackgroundMaterial"><AppIcon name="close" :size="16" /></button>
                  <span v-else class="upload-action">选择素材</span>
                </label>
              </template>

              <label for="asset-background-description">描述</label>
              <textarea id="asset-background-description" v-model.trim="assetBackgroundDescription" rows="3" maxlength="200" required placeholder="请输入背景特点和适用场景"></textarea>
            </template>
            <template v-else-if="route.meta.moduleKey === 'agents'">
              <label>说明 <span>选填</span></label>
              <textarea v-model.trim="agentDescription" rows="3" placeholder="补充智能体的用途和说明"></textarea>
            </template>
            <template v-else>
              <label>备注 <span>选填</span></label>
              <textarea rows="3" placeholder="补充一些说明信息"></textarea>
            </template>
            <div class="modal-actions">
              <button type="button" class="secondary-button" @click="closeModal">取消</button>
              <button type="submit" class="primary-button">{{ editingAgentId || editingAssetId ? '保存修改' : route.meta.moduleKey === 'digitalHumans' && editingDigitalHumanCode ? '保存设置' : route.meta.moduleKey === 'assets' ? '确认上传' : '确认创建' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="benefitModalOpen" class="modal-backdrop" @click.self="closeBenefitModal">
        <div class="modal-card benefit-allocation-modal" role="dialog" aria-modal="true" aria-label="分配权益">
          <button class="modal-close" aria-label="关闭" @click="closeBenefitModal"><AppIcon name="close" /></button>
          <div class="modal-icon"><AppIcon name="crown" :size="25" /></div>
          <h3>分配权益</h3>
          <p>选择需要分配的权益类型并填写分配数量。</p>
          <form @submit.prevent="submitBenefitAllocation">
            <fieldset class="benefit-type-fieldset">
              <legend>权益类型</legend>
              <div class="benefit-type-options">
                <label :class="{ selected: selectedBenefitType === '设备授权' }">
                  <input v-model="selectedBenefitType" type="radio" value="设备授权" />
                  <span class="benefit-option-icon"><AppIcon name="server" :size="20" /></span>
                  <span><strong>设备授权</strong><small>为设备分配数字人平台使用授权</small></span>
                  <i><b></b></i>
                </label>
                <label :class="{ selected: selectedBenefitType === '形象训练次数' }">
                  <input v-model="selectedBenefitType" type="radio" value="形象训练次数" />
                  <span class="benefit-option-icon"><AppIcon name="sparkles" :size="20" /></span>
                  <span><strong>形象训练次数</strong><small>用于创建并训练新的数字人形象</small></span>
                  <i><b></b></i>
                </label>
              </div>
            </fieldset>
            <template v-if="selectedBenefitType === '设备授权'">
              <div class="benefit-device-form-grid">
                <div>
                  <label for="benefit-user-phone">用户手机号</label>
                  <select id="benefit-user-phone" v-model="benefitUserPhone" required>
                    <option value="" disabled>请选择用户手机号</option>
                    <option v-for="user in benefitUserOptions" :key="user.phone" :value="user.phone">{{ user.phone }}（{{ user.name }}）</option>
                  </select>
                </div>
                <div>
                  <label for="benefit-auth-name">授权名称</label>
                  <input id="benefit-auth-name" v-model.trim="benefitAuthorizationName" maxlength="40" required placeholder="请输入授权名称" />
                </div>
                <div>
                  <label for="benefit-duration">授权时长（天）</label>
                  <input id="benefit-duration" v-model.number="benefitDuration" type="number" min="1" max="3650" required />
                </div>
                <div>
                  <label for="benefit-asr-resource">绑定ASR资源</label>
                  <select id="benefit-asr-resource" v-model="benefitAsrResource" required><option value="" disabled>请选择ASR资源</option><option>ASR标准资源池</option><option>ASR高并发资源池</option><option>ASR本地资源池</option></select>
                </div>
                <div class="full-field">
                  <label for="benefit-tts-resource">绑定TTS资源</label>
                  <select id="benefit-tts-resource" v-model="benefitTtsResource" required><option value="" disabled>请选择TTS资源</option><option>TTS标准资源池</option><option>TTS精品音色资源池</option><option>TTS本地资源池</option></select>
                </div>
                <div class="full-field">
                  <label for="benefit-description">授权描述</label>
                  <textarea id="benefit-description" v-model.trim="benefitDescription" rows="3" maxlength="200" required placeholder="请输入授权用途及说明"></textarea>
                </div>
              </div>
              <small class="benefit-balance-hint">当前可分配：12 个设备授权</small>
            </template>
            <template v-else>
              <label for="training-benefit-user-phone">用户手机号</label>
              <select id="training-benefit-user-phone" v-model="benefitUserPhone" class="benefit-user-select" required>
                <option value="" disabled>请选择用户手机号</option>
                <option v-for="user in benefitUserOptions" :key="user.phone" :value="user.phone">{{ user.phone }}（{{ user.name }}）</option>
              </select>
              <label>训练类型</label>
              <div class="training-benefit-type-options">
                <label :class="{ selected: trainingBenefitType === '2D在线版' }"><input v-model="trainingBenefitType" type="radio" value="2D在线版" /><span><strong>2D在线版</strong><small>云端训练与在线使用</small></span><i><b></b></i></label>
                <label :class="{ selected: trainingBenefitType === '2D本地版' }"><input v-model="trainingBenefitType" type="radio" value="2D本地版" /><span><strong>2D本地版</strong><small>本地部署与离线使用</small></span><i><b></b></i></label>
              </div>
              <label for="benefit-quantity">分配数量</label>
              <div class="benefit-quantity-field"><input id="benefit-quantity" v-model.number="benefitQuantity" type="number" min="1" required /><span>次</span></div>
              <small class="benefit-balance-hint">当前可分配：{{ trainingBenefitType === '2D在线版' ? '16 次2D在线版训练' : '10 次2D本地版训练' }}</small>
            </template>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="closeBenefitModal">取消</button><button type="submit" class="primary-button">确认分配</button></div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="resourceModalOpen" class="modal-backdrop" @click.self="closeResourceModal">
        <div class="modal-card resource-create-modal" role="dialog" aria-modal="true" aria-label="新增资源">
          <button class="modal-close" aria-label="关闭" @click="closeResourceModal"><AppIcon name="close" /></button>
          <div class="modal-icon"><AppIcon name="server" :size="25" /></div>
          <h3>{{ editingResourceId ? '编辑资源' : '新增资源' }}</h3>
          <p>{{ editingResourceId ? '修改资源类型和对应的接入配置。' : '选择资源类型并填写对应的接入配置。' }}</p>
          <form @submit.prevent="submitResourceCreate">
            <fieldset class="resource-type-fieldset">
              <legend>资源类型</legend>
              <div class="resource-type-options">
                <label :class="{ selected: resourceType === 'asr' }"><input v-model="resourceType" type="radio" value="asr" /><AppIcon name="message" :size="18" /><span><strong>语音识别</strong><small>ASR资源池</small></span></label>
                <label :class="{ selected: resourceType === 'tts' }"><input v-model="resourceType" type="radio" value="tts" /><AppIcon name="video" :size="18" /><span><strong>语音合成</strong><small>TTS资源池</small></span></label>
                <label :class="{ selected: resourceType === 'local' }"><input v-model="resourceType" type="radio" value="local" /><AppIcon name="server" :size="18" /><span><strong>本地授权</strong><small>数字人License</small></span></label>
              </div>
            </fieldset>

            <div v-if="resourceType === 'asr'" class="resource-form-grid">
              <div class="full-field"><label for="asr-resource-name">资源名称</label><input id="asr-resource-name" v-model.trim="resourceName" required placeholder="请输入语音识别资源名称" /></div>
              <div><label for="asr-sn">SN</label><input id="asr-sn" v-model.trim="resourceSn" required placeholder="请输入SN" /></div>
              <div><label for="asr-appid">APPID</label><input id="asr-appid" v-model.trim="resourceAppId" required placeholder="请输入APPID" /></div>
              <div><label for="asr-appkey">APPKEY</label><div class="resource-secret-field"><input id="asr-appkey" v-model.trim="resourceAppKey" :type="showResourceAppKey ? 'text' : 'password'" required autocomplete="off" placeholder="请输入APPKEY" /><button type="button" :aria-label="showResourceAppKey ? '隐藏APPKEY' : '显示APPKEY'" :title="showResourceAppKey ? '隐藏' : '显示'" @click="showResourceAppKey = !showResourceAppKey"><AppIcon :name="showResourceAppKey ? 'eye-off' : 'eye'" :size="16" /></button></div></div>
              <div><label for="asr-scene">场景</label><input id="asr-scene" v-model.trim="resourceScene" required placeholder="例如：数字人实时交互" /></div>
            </div>

            <div v-else-if="resourceType === 'tts'" class="resource-form-grid">
              <div class="full-field"><label for="tts-resource-name">资源名称</label><input id="tts-resource-name" v-model.trim="resourceName" required placeholder="请输入语音合成资源名称" /></div>
              <div><label for="tts-appid">APPID</label><input id="tts-appid" v-model.trim="resourceAppId" required placeholder="请输入APPID" /></div>
              <div><label for="tts-cluster">Cluster</label><input id="tts-cluster" v-model.trim="resourceCluster" required placeholder="请输入Cluster" /></div>
              <div class="full-field"><label for="tts-access-token">Access Token</label><div class="resource-secret-field"><input id="tts-access-token" v-model.trim="resourceAccessToken" :type="showResourceAccessToken ? 'text' : 'password'" required autocomplete="off" placeholder="请输入Access Token" /><button type="button" :aria-label="showResourceAccessToken ? '隐藏Access Token' : '显示Access Token'" :title="showResourceAccessToken ? '隐藏' : '显示'" @click="showResourceAccessToken = !showResourceAccessToken"><AppIcon :name="showResourceAccessToken ? 'eye-off' : 'eye'" :size="16" /></button></div></div>
            </div>

            <div v-else class="resource-license-field">
              <label for="local-license-key">license.key</label>
              <textarea id="local-license-key" v-model.trim="resourceLicenseKey" rows="5" required placeholder="请输入本地数字人授权license.key"></textarea>
              <small>授权示例</small>
              <code>*:1787641636:87yt5Md6-p5z0c487dkjGjIz-4kDJ2xrCopn1wYZFF7EoVn5XmL8KtA2xdqQH9rPofkgiteEVwdKt2-GGsHZBw</code>
            </div>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="closeResourceModal">取消</button><button type="submit" class="primary-button">{{ editingResourceId ? '保存修改' : '确认添加' }}</button></div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="actionModalOpen" class="modal-backdrop" @click.self="closeActionModal">
        <div class="modal-card workflow-action-modal">
          <button class="modal-close" aria-label="关闭" @click="closeActionModal"><AppIcon name="close" /></button>
          <div class="modal-icon">
            <AppIcon :name="actionType === 'reupload' ? 'video' : actionType === 'reject' ? 'close' : 'check'" :size="25" />
          </div>
          <h3>{{ actionType === 'reupload' ? '重新上传视频' : actionType === 'reject' ? '填写不通过原因' : '确认训练完成' }}</h3>
          <p>
            {{ actionType === 'reupload'
              ? '上传新的视频素材后，该任务将重新进入待训练状态。'
              : actionType === 'reject'
                ? '请填写具体原因，方便素材提交人修改后重新上传。'
                : '填写训练结果标识，确认后任务状态将变为已完成。' }}
          </p>

          <div class="training-action-context">
            <span class="entity-avatar" :class="selectedTraining?.tone">{{ selectedTraining?.name?.slice(0, 1) }}</span>
            <span><strong>{{ selectedTraining?.name }}</strong><small>{{ selectedTraining?.subtitle }}</small></span>
            <span class="type-tag">{{ selectedTraining?.type }}</span>
          </div>

          <form @submit.prevent="submitTrainingAction">
            <template v-if="actionType === 'reupload'">
              <label>视频素材</label>
              <label class="video-upload" :class="{ 'has-file': replacementVideo }">
                <input ref="replacementVideoInput" type="file" accept="video/*" required @change="handleReplacementVideo" />
                <span class="upload-icon"><AppIcon :name="replacementVideo ? 'check' : 'video'" :size="22" /></span>
                <span class="upload-copy">
                  <strong>{{ replacementVideo ? replacementVideo.name : '点击上传新的视频素材' }}</strong>
                  <small>{{ replacementVideo ? `${(replacementVideo.size / 1024 / 1024).toFixed(1)} MB` : '请选择符合当前数字人类型要求的视频文件' }}</small>
                </span>
                <button v-if="replacementVideo" type="button" class="upload-remove" aria-label="移除视频" @click.prevent="clearReplacementVideo">
                  <AppIcon name="close" :size="16" />
                </button>
                <span v-else class="upload-action">选择文件</span>
              </label>
            </template>

            <template v-else-if="actionType === 'reject'">
              <label for="failure-reason">不通过原因</label>
              <textarea id="failure-reason" v-model.trim="failureReason" rows="4" required placeholder="请输入具体的不通过原因"></textarea>
            </template>

            <template v-else-if="actionType === 'complete'">
              <template v-if="selectedTraining?.type === '2D在线版'">
                <label for="completion-api-key">API 密钥</label>
                <input id="completion-api-key" v-model.trim="completionApiKey" type="password" autocomplete="off" required placeholder="请输入 API 密钥" />
                <label for="completion-project-id">项目 ID</label>
                <input id="completion-project-id" v-model.trim="completionProjectId" required placeholder="请输入项目 ID" />
              </template>
              <template v-else>
                <label for="completion-avatar-id">形象 ID</label>
                <input id="completion-avatar-id" v-model.trim="completionAvatarId" required placeholder="请输入本地版形象 ID" />
              </template>

              <label>形象预览图片</label>
              <label class="video-upload completion-preview-upload" :class="{ 'has-file': completionPreviewFile }">
                <input ref="completionPreviewInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required @change="handleCompletionPreview" />
                <span class="upload-icon"><AppIcon :name="completionPreviewFile ? 'check' : 'image'" :size="22" /></span>
                <span class="upload-copy">
                  <strong>{{ completionPreviewFile ? completionPreviewFile.name : '点击上传形象预览图片' }}</strong>
                  <small>{{ completionPreviewFile ? `${(completionPreviewFile.size / 1024 / 1024).toFixed(1)} MB` : '支持 JPG、PNG、WEBP、GIF，建议使用 9:16 竖版图片' }}</small>
                </span>
                <button v-if="completionPreviewFile" type="button" class="upload-remove" aria-label="移除预览图片" @click.prevent="clearCompletionPreview">
                  <AppIcon name="close" :size="16" />
                </button>
                <span v-else class="upload-action">选择图片</span>
              </label>
            </template>

            <div class="modal-actions">
              <button type="button" class="secondary-button" @click="closeActionModal">取消</button>
              <button type="submit" class="primary-button">
                {{ actionType === 'reupload' ? '确认上传' : actionType === 'reject' ? '确认不通过' : '确认完成' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="knowledgeEditOpen" class="modal-backdrop" @click.self="closeKnowledgeEditor">
        <div class="modal-card knowledge-edit-modal" role="dialog" aria-modal="true" aria-label="编辑知识库">
          <button class="modal-close" aria-label="关闭" @click="closeKnowledgeEditor"><AppIcon name="close" /></button>
          <div class="modal-icon"><AppIcon name="book" :size="25" /></div>
          <h3>编辑知识库</h3>
          <p>修改知识库的名称和备注信息。</p>
          <form @submit.prevent="saveKnowledgeEditor">
            <label for="knowledge-edit-name">知识库名称</label>
            <input id="knowledge-edit-name" v-model="knowledgeEditName" maxlength="50" required autofocus placeholder="请输入知识库名称" />
            <label for="knowledge-edit-remark">备注 <span>选填</span></label>
            <textarea id="knowledge-edit-remark" v-model="knowledgeEditRemark" rows="4" maxlength="200" placeholder="补充知识库用途或内容说明"></textarea>
            <div class="knowledge-remark-count">{{ knowledgeEditRemark.length }}/200</div>
            <div class="modal-actions">
              <button type="button" class="secondary-button" @click="closeKnowledgeEditor">取消</button>
              <button type="submit" class="primary-button">保存修改</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="imagePreviewOpen" class="image-preview-backdrop" @click.self="closeImagePreview">
        <div class="image-preview-dialog" :class="{ 'background-preview-dialog': imagePreviewType === 'background' }" role="dialog" aria-modal="true" :aria-label="`${imagePreviewTitle}${imagePreviewType === 'background' ? '背景' : '形象'}预览`">
          <button class="image-preview-close" aria-label="关闭预览" @click="closeImagePreview"><AppIcon name="close" :size="20" /></button>
          <img :src="imagePreviewSrc" :alt="`${imagePreviewTitle}${imagePreviewType === 'background' ? '背景' : '形象'}大图`" />
          <div class="image-preview-caption">
            <strong>{{ imagePreviewTitle }}</strong>
            <span>{{ imagePreviewType === 'background' ? '16:9 背景预览' : '9:16 形象预览' }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="toastVisible" class="toast-message"><AppIcon name="check" :size="19" />{{ toastMessage }}</div>
    </Transition>
  </div>
</template>
