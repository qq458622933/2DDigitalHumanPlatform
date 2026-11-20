<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { deviceMapNames, deviceMapPointOptions, devicePointGuideRows, deviceRouteMapRows } from '../config/deviceRouteMaps'

const route = useRoute()
const router = useRouter()
const deviceName = computed(() => String(route.query.deviceName || route.params.sn || '当前设备'))
const rows = devicePointGuideRows
const search = ref('')
const availableMaps = computed(() => [...new Set([...deviceMapNames, ...deviceRouteMapRows.value.map((item) => item.mapName), ...rows.value.map((item) => item.mapName)])])
const visibleRows = computed(() => rows.value.filter((item) => {
  if (item.deviceSn && item.deviceSn !== route.params.sn) return false
  const keyword = search.value.trim().toLowerCase()
  return !keyword || `${item.locationName} ${item.mapName} ${item.endPoint}`.toLowerCase().includes(keyword)
}).sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)))
const modalOpen = ref(false)
const editingId = ref('')
const form = ref({ displayOrder: 1, locationName: '', mapName: '', departureSpeech: '', yieldPrompt: '', arrivalSpeech: '', endPoint: '' })
const availablePointNames = computed(() => {
  const name = form.value.mapName
  if (!name) return []
  const defaults = deviceMapPointOptions[name] || ['接待点', '展厅', '充电桩', '出口']
  const guidePoints = rows.value.filter((item) => item.mapName === name).flatMap((item) => [item.locationName, item.endPoint])
  const routePoints = deviceRouteMapRows.value.filter((item) => item.mapName === name).flatMap((item) => (item.points || []).map((point) => point.name))
  return [...new Set([...defaults, ...guidePoints, ...routePoints].filter(Boolean))]
})
const formError = ref('')
const notice = ref('')
let noticeTimer

function showNotice(message) {
  notice.value = message
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => { notice.value = '' }, 3000)
}

function returnToRoutes() {
  router.push({ name: 'deviceRouteMap', params: { sn: route.params.sn }, query: { deviceName: deviceName.value } })
}

function nextDisplayOrder(map) {
  return Math.max(0, ...rows.value.filter((item) => item.mapName === map).map((item) => Number(item.displayOrder) || 0)) + 1
}

function handleMapChange() {
  form.value.locationName = ''
  form.value.endPoint = ''
  if (!editingId.value) form.value.displayOrder = nextDisplayOrder(form.value.mapName)
  formError.value = ''
}

function openCreate() {
  editingId.value = ''
  const map = String(route.query.mapName || availableMaps.value[0] || '')
  form.value = { displayOrder: nextDisplayOrder(map), locationName: '', mapName: map, departureSpeech: '', yieldPrompt: '', arrivalSpeech: '', endPoint: '' }
  formError.value = ''
  modalOpen.value = true
}

function openEdit(item) {
  editingId.value = item.id
  form.value = { displayOrder: item.displayOrder, locationName: item.locationName, mapName: item.mapName, departureSpeech: item.departureSpeech, yieldPrompt: item.yieldPrompt || '', arrivalSpeech: item.arrivalSpeech, endPoint: item.endPoint }
  formError.value = ''
  modalOpen.value = true
}

function saveGuide() {
  const value = Object.fromEntries(Object.entries(form.value).map(([key, text]) => [key, String(text).trim()]))
  value.displayOrder = Number(value.displayOrder)
  if (!Number.isInteger(value.displayOrder) || value.displayOrder < 1) {
    formError.value = '显示顺序请输入大于 0 的整数'
    return
  }
  if (!value.mapName || !value.locationName || !value.endPoint || !value.departureSpeech || !value.yieldPrompt || !value.arrivalSpeech) {
    formError.value = '请填写所有必填项'
    return
  }
  if (!availablePointNames.value.includes(value.locationName) || !availablePointNames.value.includes(value.endPoint)) {
    formError.value = '地点名和结束点请选择当前地图的点位'
    return
  }
  if (editingId.value) {
    const index = rows.value.findIndex((item) => item.id === editingId.value)
    if (index < 0) { formError.value = '该地点已被删除，请关闭后重试'; return }
    rows.value.splice(index, 1, { ...rows.value[index], ...value })
    showNotice('地点已更新')
  } else {
    rows.value.push({ id: `guide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, deviceSn: String(route.params.sn), ...value })
    showNotice('地点已添加')
  }
  modalOpen.value = false
}

function deleteGuide(item) {
  if (!window.confirm(`确定删除地点“${item.locationName}”吗？`)) return
  rows.value = rows.value.filter((row) => row.id !== item.id)
  showNotice('地点已删除')
}

function refreshPoints() {
  showNotice('点位列表已刷新')
}

onBeforeUnmount(() => window.clearTimeout(noticeTimer))
</script>

<template>
  <div class="point-guide-page">
    <header class="point-guide-toolbar">
      <button type="button" class="point-guide-back" aria-label="返回路线地图" @click="returnToRoutes"><AppIcon name="chevron" :size="20" /></button>
      <span class="point-guide-device">{{ deviceName }} · 点位引领</span>
      <div class="point-guide-actions">
        <label class="point-guide-search"><input v-model="search" aria-label="搜索地点名称" placeholder="请输入地点名称" /><AppIcon name="search" :size="15" /></label>
        <button type="button" class="point-guide-refresh" @click="refreshPoints"><AppIcon name="refresh" :size="14" />点位刷新</button>
        <button type="button" class="point-guide-add" @click="openCreate"><AppIcon name="plus" :size="16" />添加地点</button>
      </div>
    </header>

    <div class="point-guide-table-wrap">
      <table class="point-guide-table">
        <thead><tr><th scope="col">显示顺序</th><th scope="col">地点名</th><th scope="col">地图归属</th><th scope="col">出发时播报</th><th scope="col">让路提示</th><th scope="col">到达后播报</th><th scope="col">结束点</th><th scope="col">操作</th></tr></thead>
        <tbody>
          <tr v-for="item in visibleRows" :key="item.id">
            <td>{{ item.displayOrder }}</td>
            <td>{{ item.locationName }}</td>
            <td>{{ item.mapName }}</td>
            <td><span :title="item.departureSpeech">{{ item.departureSpeech || '—' }}</span></td>
            <td><span :title="item.yieldPrompt">{{ item.yieldPrompt || '—' }}</span></td>
            <td><span :title="item.arrivalSpeech">{{ item.arrivalSpeech || '—' }}</span></td>
            <td>{{ item.endPoint }}</td>
            <td><div class="point-guide-row-actions"><button type="button" @click="openEdit(item)"><AppIcon name="edit" :size="13" />编辑</button><button type="button" @click="deleteGuide(item)"><AppIcon name="trash" :size="13" />删除</button></div></td>
          </tr>
          <tr v-if="!visibleRows.length"><td colspan="8" class="point-guide-empty">暂无匹配的地点</td></tr>
        </tbody>
      </table>
    </div>

    <div v-if="modalOpen" class="point-guide-backdrop" @click.self="modalOpen = false">
      <div class="point-guide-modal" role="dialog" aria-modal="true" :aria-label="editingId ? '编辑地点' : '添加地点'">
        <div class="point-guide-modal-head"><h2>{{ editingId ? '编辑地点' : '添加地点' }}</h2><button type="button" aria-label="关闭" @click="modalOpen = false"><AppIcon name="close" :size="18" /></button></div>
        <form @submit.prevent="saveGuide">
          <div class="point-guide-form-grid">
            <label for="guide-display-order"><span class="point-guide-field-label">显示顺序 <b>*</b></span><input id="guide-display-order" v-model.number="form.displayOrder" type="number" min="1" step="1" autofocus placeholder="请输入显示顺序" /></label>
            <label for="guide-map-name"><span class="point-guide-field-label">地图选择 <b>*</b></span><select id="guide-map-name" v-model="form.mapName" @change="handleMapChange"><option value="" disabled>请选择地图</option><option v-for="name in availableMaps" :key="name" :value="name">{{ name }}</option></select></label>
            <label for="guide-location-name"><span class="point-guide-field-label">地点名 <b>*</b></span><select id="guide-location-name" v-model="form.locationName" :disabled="!form.mapName"><option value="" disabled>请选择点位</option><option v-for="name in availablePointNames" :key="name" :value="name">{{ name }}</option></select></label>
            <label for="guide-end-point"><span class="point-guide-field-label">结束点 <b>*</b></span><select id="guide-end-point" v-model="form.endPoint" :disabled="!form.mapName"><option value="" disabled>请选择点位</option><option v-for="name in availablePointNames" :key="name" :value="name">{{ name }}</option></select></label>
            <label for="guide-departure-speech" class="wide"><span class="point-guide-field-label">出发时播报 <b>*</b></span><textarea id="guide-departure-speech" v-model="form.departureSpeech" rows="3" maxlength="500" placeholder="请输入出发时播报内容" /></label>
            <label for="guide-yield-prompt" class="wide"><span class="point-guide-field-label">让路提示 <b>*</b></span><textarea id="guide-yield-prompt" v-model="form.yieldPrompt" rows="3" maxlength="500" placeholder="请输入让路提示内容" /></label>
            <label for="guide-arrival-speech" class="wide"><span class="point-guide-field-label">到达后播报 <b>*</b></span><textarea id="guide-arrival-speech" v-model="form.arrivalSpeech" rows="3" maxlength="500" placeholder="请输入到达后播报内容" /></label>
          </div>
          <p v-if="formError" class="point-guide-error" role="alert">{{ formError }}</p>
          <div class="point-guide-modal-actions"><button type="button" @click="modalOpen = false">取消</button><button type="submit" class="primary">{{ editingId ? '保存修改' : '确认添加' }}</button></div>
        </form>
      </div>
    </div>
    <div v-if="notice" class="point-guide-notice" role="status">{{ notice }}</div>
  </div>
</template>

<style scoped>
.point-guide-page { min-height: calc(100vh - 72px); margin: -36px; padding: 28px 9px; background: #fff; color: #253a59; }
.point-guide-toolbar { display: flex; align-items: center; gap: 16px; min-height: 36px; margin-bottom: 31px; }
.point-guide-back { display: grid; place-items: center; flex: 0 0 33px; width: 33px; height: 33px; padding: 0; border: 0; border-radius: 50%; background: #346bfa; color: #fff; cursor: pointer; transform: rotate(180deg); }
.point-guide-device { color: #90a0b7; font-size: 12px; }
.point-guide-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.point-guide-search { display: flex; align-items: center; width: 240px; height: 33px; overflow: hidden; border: 1px solid #d9e1eb; border-radius: 4px; }
.point-guide-search input { width: 100%; height: 100%; min-width: 0; padding: 0 11px; border: 0; outline: 0; color: #314969; font-size: 12px; }
.point-guide-search input::placeholder { color: #adb9c9; }
.point-guide-search :deep(svg) { box-sizing: content-box; flex: 0 0 auto; width: 16px; height: 16px; padding: 8px 14px; border-left: 1px solid #d9e1eb; color: #889ab4; background: #f5f7fa; }
.point-guide-actions > button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; height: 33px; padding: 0 14px; border-radius: 4px; font-size: 12px; white-space: nowrap; cursor: pointer; }
.point-guide-refresh { border: 1px solid #8faaff; background: #f2f6ff; color: #3569f7; }
.point-guide-add { border: 1px solid #3569f7; background: #3569f7; color: #fff; }
.point-guide-table-wrap { width: 100%; overflow-x: auto; }
.point-guide-table { width: 100%; min-width: 1250px; border-collapse: collapse; table-layout: fixed; font-size: 12px; }
.point-guide-table th { height: 45px; background: #f4f7fc; color: #375578; font-weight: 500; text-align: center; }
.point-guide-table th:first-child { width: 8%; }
.point-guide-table th:nth-child(2) { width: 11%; }
.point-guide-table th:nth-child(3) { width: 12%; }
.point-guide-table th:nth-child(4) { width: 17%; }
.point-guide-table th:nth-child(5) { width: 15%; }
.point-guide-table th:nth-child(6) { width: 17%; }
.point-guide-table th:nth-child(7) { width: 8%; }
.point-guide-table th:nth-child(8) { width: 12%; }
.point-guide-table td { height: 54px; padding: 0 12px; border-bottom: 1px solid #dce4ed; text-align: center; color: #203958; }
.point-guide-table tbody tr:nth-child(even) { background: #fbfcff; }
.point-guide-table tbody tr:hover { background: #f5f8ff; }
.point-guide-table td > span { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.point-guide-row-actions { display: flex; align-items: center; justify-content: center; gap: 12px; }
.point-guide-row-actions button { display: inline-flex; align-items: center; gap: 3px; padding: 3px 0; border: 0; background: none; color: #346bfa; font-size: 12px; white-space: nowrap; cursor: pointer; }
.point-guide-row-actions button:hover { text-decoration: underline; }
.point-guide-table td.point-guide-empty { height: 90px; color: #9aabc1; }
.point-guide-backdrop { position: fixed; z-index: 150; inset: 0; display: grid; place-items: center; padding: 20px; background: #17284691; }
.point-guide-modal { width: min(650px, 100%); max-height: calc(100vh - 40px); overflow-y: auto; padding: 24px; border-radius: 12px; background: #fff; box-shadow: 0 24px 65px #15294c50; }
.point-guide-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.point-guide-modal-head h2 { margin: 0; color: #233b60; font-size: 18px; }
.point-guide-modal-head button { padding: 4px; border: 0; background: none; color: #8998af; cursor: pointer; }
.point-guide-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.point-guide-form-grid label { display: grid; gap: 7px; color: #526987; font-size: 12px; }
.point-guide-form-grid label.wide { grid-column: 1 / -1; }
.point-guide-field-label b { color: #e65a63; font-weight: 500; }
.point-guide-form-grid input, .point-guide-form-grid select, .point-guide-form-grid textarea { width: 100%; min-width: 0; padding: 9px 10px; border: 1px solid #d9e2f0; border-radius: 6px; background: #fff; color: #263f61; font: inherit; font-size: 13px; }
.point-guide-form-grid textarea { resize: vertical; line-height: 1.5; }
.point-guide-error { margin: 12px 0 0; color: #d65359; font-size: 12px; }
.point-guide-modal-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 20px; }
.point-guide-modal-actions button { min-height: 36px; padding: 0 15px; border: 1px solid #d8e1ef; border-radius: 6px; background: #fff; color: #61728c; font-size: 12px; cursor: pointer; }
.point-guide-modal-actions button.primary { color: #fff; border-color: #3769ff; background: #3769ff; }
.point-guide-notice { position: fixed; z-index: 160; right: 28px; bottom: 28px; padding: 11px 15px; border-radius: 8px; background: #354765; color: #fff; box-shadow: 0 10px 25px #14234140; font-size: 12px; }
@media (max-width: 900px) { .point-guide-toolbar { flex-wrap: wrap; } .point-guide-actions { width: 100%; justify-content: flex-end; } }
@media (max-width: 600px) { .point-guide-page { margin: -20px; padding: 18px 10px; } .point-guide-device { display: none; } .point-guide-actions { flex-wrap: wrap; } .point-guide-search { width: 100%; } .point-guide-form-grid { grid-template-columns: 1fr; } .point-guide-form-grid label.wide { grid-column: auto; } }
</style>
