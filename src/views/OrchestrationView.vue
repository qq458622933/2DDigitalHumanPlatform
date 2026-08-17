<script setup>
import { computed, inject, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'

const platformTutorial = inject('platformTutorial', null)
const router = useRouter()

const localAvatars = [
  '沐晴 · 本地主播',
  '星野 · 产品体验官',
  '安安 · 客服助手',
]

const avatarActionCatalog = reactive({
  '沐晴 · 本地主播': [
    { name: '标准讲解形象', id: 'AVT-ACT-001', genericAction: '标准讲解', genericActionId: 'COMMON-001', linked: true },
    { name: '右手指引形象', id: 'AVT-ACT-003', genericAction: '右手指引', genericActionId: 'COMMON-003', linked: true },
    { name: '双手展示形象', id: 'AVT-ACT-004', genericAction: '双手展示', genericActionId: 'COMMON-004', linked: true },
    { name: '欢迎挥手形象', id: 'AVT-ACT-002', genericAction: '欢迎挥手', genericActionId: 'COMMON-002', linked: false },
    { name: '点赞互动形象', id: 'AVT-ACT-005', genericAction: '点赞互动', genericActionId: 'COMMON-005', linked: false },
    { name: '结束致意形象', id: 'AVT-ACT-006', genericAction: '结束致意', genericActionId: 'COMMON-006', linked: false },
  ],
  '星野 · 产品体验官': [
    { name: '欢迎挥手形象', id: 'AVT-ACT-102', genericAction: '欢迎挥手', genericActionId: 'COMMON-002', linked: true },
    { name: '标准讲解形象', id: 'AVT-ACT-101', genericAction: '标准讲解', genericActionId: 'COMMON-001', linked: true },
    { name: '结束致意形象', id: 'AVT-ACT-106', genericAction: '结束致意', genericActionId: 'COMMON-006', linked: true },
    { name: '右手指引形象', id: 'AVT-ACT-103', genericAction: '右手指引', genericActionId: 'COMMON-003', linked: false },
    { name: '双手展示形象', id: 'AVT-ACT-104', genericAction: '双手展示', genericActionId: 'COMMON-004', linked: false },
  ],
  '安安 · 客服助手': [
    { name: '标准讲解形象', id: 'AVT-ACT-201', genericAction: '标准讲解', genericActionId: 'COMMON-001', linked: true },
    { name: '右手指引形象', id: 'AVT-ACT-203', genericAction: '右手指引', genericActionId: 'COMMON-003', linked: true },
    { name: '欢迎挥手形象', id: 'AVT-ACT-202', genericAction: '欢迎挥手', genericActionId: 'COMMON-002', linked: false },
    { name: '结束致意形象', id: 'AVT-ACT-206', genericAction: '结束致意', genericActionId: 'COMMON-006', linked: false },
  ],
})

const extraActionCandidates = {
  '沐晴 · 本地主播': [
    { name: '自然站姿形象', id: 'AVT-ACT-007' },
    { name: '左手指引形象', id: 'AVT-ACT-008' },
  ],
  '星野 · 产品体验官': [
    { name: '自然站姿形象', id: 'AVT-ACT-107' },
    { name: '侧身展示形象', id: 'AVT-ACT-108' },
  ],
  '安安 · 客服助手': [
    { name: '自然站姿形象', id: 'AVT-ACT-207' },
    { name: '双手展示形象', id: 'AVT-ACT-208' },
  ],
}

const actionAvatarCandidateCatalog = Object.fromEntries(Object.entries(avatarActionCatalog).map(([avatar, actions]) => [
  avatar,
  [...actions.map(({ name, id }) => ({ name, id })), ...(extraActionCandidates[avatar] || [])],
]))

const orchestrations = ref([
  {
    id: 'ACT-20260803',
    name: '产品直播标准动作',
    mainAvatar: '沐晴 · 本地主播',
    actionAvatars: ['标准讲解形象', '右手指引形象', '双手展示形象'],
    description: '用于产品直播讲解，在重点信息处切换指引和展示动作。',
    updatedAt: '2026-08-03 16:20',
  },
  {
    id: 'ACT-20260726',
    name: '品牌欢迎动作组',
    mainAvatar: '星野 · 产品体验官',
    actionAvatars: ['欢迎挥手形象', '标准讲解形象', '结束致意形象'],
    description: '适用于品牌介绍视频的开场欢迎、内容讲解和结束致意。',
    updatedAt: '2026-07-26 10:45',
  },
])

const modalOpen = ref(false)
const editingId = ref(null)
const formError = ref('')
const toastVisible = ref(false)
const toastText = ref('')
const editingMappingId = ref('')
const mappingActionId = ref('')
const form = ref(createEmptyForm())
const highlightCreateOrchestration = computed(() => platformTutorial?.tutorialOpen.value && platformTutorial?.tutorialStep.value === 4)
const selectedAvatarActions = computed(() => avatarActionCatalog[form.value.mainAvatar] || [])
const linkedActionAvatars = computed(() => selectedAvatarActions.value.filter((action) => action.linked))
const availableActionAvatars = computed(() => selectedAvatarActions.value.filter((action) => !action.linked))
const selectedActionCandidates = computed(() => actionAvatarCandidateCatalog[form.value.mainAvatar] || [])

function createEmptyForm() {
  return { name: '', mainAvatar: '', actionAvatars: [], description: '' }
}

function openCreate() {
  editingId.value = null
  form.value = createEmptyForm()
  formError.value = ''
  modalOpen.value = true
}

function handleCreateClick() {
  if (highlightCreateOrchestration.value) {
    platformTutorial?.completeTutorialStep(4)
    return
  }
  openCreate()
}

function openEdit(item) {
  editingId.value = item.id
  form.value = {
    name: item.name,
    mainAvatar: item.mainAvatar,
    actionAvatars: [...item.actionAvatars],
    description: item.description,
  }
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingId.value = null
  formError.value = ''
  editingMappingId.value = ''
  mappingActionId.value = ''
}

function handleMainAvatarChange() {
  form.value.actionAvatars = linkedActionAvatars.value.map((action) => action.name)
  formError.value = ''
  editingMappingId.value = ''
  mappingActionId.value = ''
}

function startMappingEdit(action) {
  editingMappingId.value = action.genericActionId
  mappingActionId.value = action.id
}

function cancelMappingEdit() {
  editingMappingId.value = ''
  mappingActionId.value = ''
}

function saveMappingEdit(action) {
  const candidate = selectedActionCandidates.value.find((item) => item.id === mappingActionId.value)
  if (!candidate) return
  const previousName = action.name
  action.name = candidate.name
  action.id = candidate.id
  action.linked = true
  form.value.actionAvatars = form.value.actionAvatars.filter((name) => name !== previousName && name !== candidate.name)
  form.value.actionAvatars.push(candidate.name)
  cancelMappingEdit()
  formError.value = ''
  showToast(`“${action.genericAction}”已关联到“${candidate.name}”`)
}

function createActionAvatar() {
  closeModal()
  router.push({
    name: 'training',
    query: { createTraining: '1', type: 'local', avatarType: 'broadcast' },
  })
}

function submitForm() {
  if (form.value.actionAvatars.length === 0) {
    formError.value = '请至少选择一个动作形象'
    return
  }

  if (editingId.value) {
    const index = orchestrations.value.findIndex((item) => item.id === editingId.value)
    if (index !== -1) {
      orchestrations.value[index] = {
        ...orchestrations.value[index],
        ...form.value,
        actionAvatars: [...form.value.actionAvatars],
        updatedAt: '刚刚',
      }
    }
    showToast('编排已更新')
  } else {
    orchestrations.value.unshift({
      id: `ACT-${Date.now().toString().slice(-8)}`,
      ...form.value,
      actionAvatars: [...form.value.actionAvatars],
      updatedAt: '刚刚',
    })
    showToast('编排创建成功')
  }
  closeModal()
}

function showToast(message) {
  toastText.value = message
  toastVisible.value = true
  window.setTimeout(() => { toastVisible.value = false }, 2600)
}
</script>

<template>
  <div class="module-page orchestration-page" style="--accent: #6c5ce7">
    <section class="page-heading">
      <div>
        <div class="eyebrow"><span></span>ACTION ORCHESTRATION</div>
        <h1>动作编排</h1>
        <p>为数字人组合和管理不同场景下的形象动作。</p>
      </div>
      <button class="primary-button" :class="{ 'tutorial-target-action': highlightCreateOrchestration }" @click="handleCreateClick">
        <AppIcon name="plus" :size="18" :stroke-width="2.2" />
        新增编排
      </button>
    </section>

    <section class="orchestration-notice">
      <span class="notice-icon"><AppIcon name="info" :size="21" /></span>
      <div>
        <strong>动作编排仅支持 2D 本地版数字人</strong>
        <p>请先完成 2D 本地版形象训练，再选择对应的播报形象和动作形象进行编排。</p>
      </div>
    </section>

    <section class="data-card orchestration-card">
      <div class="data-card-header">
        <div>
          <h2>编排列表</h2>
          <p>共 {{ orchestrations.length }} 条编排</p>
        </div>
      </div>

      <div class="table-scroll">
        <table class="orchestration-table">
          <thead>
            <tr>
              <th>编排名称</th>
              <th>播报形象</th>
              <th>动作形象列表</th>
              <th>描述</th>
              <th>更新时间</th>
              <th class="action-column">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orchestrations" :key="item.id">
              <td>
                <div class="entity-cell">
                  <span class="entity-avatar violet"><AppIcon name="workflow" :size="17" /></span>
                  <span><strong>{{ item.name }}</strong><small>{{ item.id }}</small></span>
                </div>
              </td>
              <td><span class="main-avatar-tag">{{ item.mainAvatar }}</span></td>
              <td>
                <div class="action-avatar-tags">
                  <span v-for="action in item.actionAvatars.slice(0, 2)" :key="action">{{ action }}</span>
                  <span v-if="item.actionAvatars.length > 2">+{{ item.actionAvatars.length - 2 }}</span>
                </div>
              </td>
              <td><p class="orchestration-description" :title="item.description">{{ item.description }}</p></td>
              <td>{{ item.updatedAt }}</td>
              <td class="action-column">
                <button class="edit-button" @click="openEdit(item)"><AppIcon name="edit" :size="15" />编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Transition name="fade">
      <div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-card orchestration-modal">
          <button class="modal-close" aria-label="关闭" @click="closeModal"><AppIcon name="close" /></button>
          <div class="modal-icon"><AppIcon name="workflow" :size="25" /></div>
          <h3>{{ editingId ? '编辑编排' : '新增编排' }}</h3>
          <p>{{ editingId ? '修改当前动作编排的形象和说明。' : '选择本地版数字人形象，创建新的动作编排。' }}</p>

          <form @submit.prevent="submitForm">
            <label for="orchestration-name">名称</label>
            <input id="orchestration-name" v-model.trim="form.name" autofocus required placeholder="请输入编排名称" />

            <label for="main-avatar">播报形象</label>
            <select id="main-avatar" v-model="form.mainAvatar" required @change="handleMainAvatarChange">
              <option value="" disabled>请选择 2D 本地版播报形象</option>
              <option v-for="avatar in localAvatars" :key="avatar" :value="avatar">{{ avatar }}</option>
            </select>

            <div v-if="form.mainAvatar" class="avatar-action-association-panel">
              <fieldset class="action-avatar-fieldset linked-actions-fieldset">
                <legend><span>已关联的动作形象</span><em>{{ linkedActionAvatars.length }}</em></legend>
                <div class="action-avatar-options">
                  <label v-for="action in linkedActionAvatars" :key="action.id" :class="{ selected: form.actionAvatars.includes(action.name) }">
                    <input v-model="form.actionAvatars" type="checkbox" :value="action.name" @change="formError = ''" />
                    <span class="action-check"><AppIcon name="check" :size="13" :stroke-width="2.5" /></span>
                    <span class="action-option-copy"><strong>{{ action.name }}</strong><small>{{ action.id }}</small></span>
                    <em>已关联</em>
                  </label>
                </div>
                <small v-if="linkedActionAvatars.length === 0" class="field-hint">该播报形象暂无已关联动作形象</small>
              </fieldset>

              <fieldset class="action-avatar-fieldset available-actions-fieldset">
                <legend><span>可关联的动作形象</span><em>{{ availableActionAvatars.length }}</em></legend>
                <div class="action-avatar-options">
                  <label v-for="action in availableActionAvatars" :key="action.id" :class="{ selected: form.actionAvatars.includes(action.name) }">
                    <input v-model="form.actionAvatars" type="checkbox" :value="action.name" @change="formError = ''" />
                    <span class="action-check"><AppIcon name="check" :size="13" :stroke-width="2.5" /></span>
                    <span class="action-option-copy"><strong>{{ action.name }}</strong><small>{{ action.id }}</small></span>
                    <em>{{ form.actionAvatars.includes(action.name) ? '本次已选' : '可关联' }}</em>
                  </label>
                </div>
                <small v-if="availableActionAvatars.length === 0" class="field-hint">暂无其他可关联动作形象</small>
              </fieldset>

              <section class="generic-action-mapping" aria-label="通用动作和动作形象关联关系">
                <div class="generic-action-mapping-heading">
                  <div><strong>通用动作关联关系</strong><span>查看当前播报形象下通用动作与实际动作形象的映射</span></div>
                  <em>共 {{ selectedAvatarActions.length }} 组</em>
                </div>
                <div class="generic-action-mapping-list">
                  <div v-for="action in selectedAvatarActions" :key="action.genericActionId" :class="{ selected: form.actionAvatars.includes(action.name), editing: editingMappingId === action.genericActionId }">
                    <span class="generic-action-node"><AppIcon name="workflow" :size="14" /><span><strong>{{ action.genericAction }}</strong><small>{{ action.genericActionId }}</small></span></span>
                    <span class="mapping-arrow"><AppIcon name="chevron" :size="14" /></span>
                    <select v-if="editingMappingId === action.genericActionId" v-model="mappingActionId" class="mapping-target-select" aria-label="选择关联动作形象">
                      <option v-for="candidate in selectedActionCandidates" :key="candidate.id" :value="candidate.id">{{ candidate.name }}（{{ candidate.id }}）</option>
                    </select>
                    <span v-else class="trained-action-node"><AppIcon name="user" :size="14" /><span><strong>{{ action.name }}</strong><small>{{ action.id }}</small></span></span>
                    <div v-if="editingMappingId === action.genericActionId" class="mapping-edit-actions">
                      <button type="button" class="save" @click="saveMappingEdit(action)"><AppIcon name="check" :size="12" />保存</button>
                      <button type="button" @click="cancelMappingEdit">取消</button>
                    </div>
                    <div v-else class="mapping-row-actions">
                      <em :class="action.linked ? 'linked' : 'available'">{{ action.linked ? '已关联' : '可关联' }}</em>
                      <button type="button" @click="startMappingEdit(action)"><AppIcon name="edit" :size="12" />修改</button>
                    </div>
                  </div>
                </div>
              </section>

              <small v-if="formError" class="form-error">{{ formError }}</small>
              <small v-else class="field-hint">勾选需要加入本次编排的动作形象，请至少选择一个</small>
            </div>
            <div v-else class="action-association-empty">
              <AppIcon name="workflow" :size="22" />
              <div><strong>请先选择播报形象</strong><span>选择后将展示已关联动作、可关联动作和通用动作映射关系</span></div>
            </div>

            <button type="button" class="create-action-avatar-button" @click="createActionAvatar">
              <AppIcon name="plus" :size="15" :stroke-width="2.2" />
              创建动作形象
              <span>前往形象训练</span>
              <AppIcon name="chevron" :size="14" />
            </button>

            <label for="orchestration-description">描述</label>
            <textarea id="orchestration-description" v-model.trim="form.description" rows="3" required placeholder="请描述该编排的用途和适用场景"></textarea>

            <div class="modal-actions">
              <button type="button" class="secondary-button" @click="closeModal">取消</button>
              <button type="submit" class="primary-button">{{ editingId ? '保存修改' : '确认创建' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="toastVisible" class="toast-message"><AppIcon name="check" :size="19" />{{ toastText }}</div>
    </Transition>
  </div>
</template>
