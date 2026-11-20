<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'

const router = useRouter()

const devices = ref([
  { sn: 'DH-2026-0001', name: '展厅接待屏 A01', status: '在线', tenantName: '术天科技', ip: '192.168.10.101', mac: 'A4:5E:60:12:8C:01', systemType: 'Windows', createdAt: '2026-08-06 10:28:16', softwareInfo: 'Windows数字人软件v1.0', lastRefresh: '2026-08-06 10:28:16' },
  { sn: 'DH-2026-0002', name: '政务大厅引导屏', status: '在线', tenantName: '华城政务服务中心', ip: '192.168.10.102', mac: 'A4:5E:60:12:8C:02', systemType: 'Windows', createdAt: '2026-08-05 14:16:42', softwareInfo: 'Windows数字人软件v1.0', lastRefresh: '2026-08-05 14:16:42' },
  { sn: 'DH-2026-0003', name: '品牌门店互动终端', status: '离线', tenantName: '星辰零售', ip: '192.168.20.35', mac: 'A4:5E:60:12:8C:03', systemType: 'Android', createdAt: '2026-07-29 09:40:05', softwareInfo: 'Android数字人软件v1.0', lastRefresh: '2026-08-04 18:30:12' },
  { sn: 'DH-2026-0004', name: '培训中心数字人屏', status: '在线', tenantName: '术天科技', ip: '192.168.10.108', mac: 'A4:5E:60:12:8C:04', systemType: 'Windows', createdAt: '2026-07-18 16:05:30', softwareInfo: 'Windows数字人软件v1.0', lastRefresh: '2026-08-06 09:52:08' },
])

const keyword = ref('')
const statusFilter = ref('全部状态')
const refreshingSn = ref('')
const modalMode = ref('')
const selectedDevice = ref(null)
const editDraft = ref(null)
const notice = ref('')
let noticeTimer
let refreshTimer

const filteredDevices = computed(() => devices.value.filter((device) => {
  const text = [device.name, device.sn, device.tenantName, device.ip, device.mac, device.systemType,
    device.softwareInfo].join(' ').toLowerCase()
  return (statusFilter.value === '全部状态' || device.status === statusFilter.value)
    && text.includes(keyword.value.trim().toLowerCase())
}))
const onlineCount = computed(() => devices.value.filter((device) => device.status === '在线').length)

function showNotice(text) {
  notice.value = text
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => { notice.value = '' }, 3000)
}

function refreshDevice(device) {
  if (refreshingSn.value) return
  refreshingSn.value = device.sn
  refreshTimer = window.setTimeout(() => {
    const current = devices.value.find((item) => item.sn === device.sn)
    if (current) {
      current.lastRefresh = new Date().toLocaleString('zh-CN', { hour12: false })
      showNotice(`已刷新 ${current.name} 的设备信息（模拟数据）`)
    }
    refreshingSn.value = ''
  }, 550)
}

function openEdit(device) {
  selectedDevice.value = device
  editDraft.value = { ...device }
  modalMode.value = 'edit'
}

function openDetails(device) {
  selectedDevice.value = device
  modalMode.value = 'detail'
}

function closeModal() {
  modalMode.value = ''
  selectedDevice.value = null
  editDraft.value = null
}

function saveEdit() {
  const current = devices.value.find((device) => device.sn === selectedDevice.value?.sn)
  if (!current || !editDraft.value) return
  Object.assign(current, {
    name: editDraft.value.name.trim(),
    tenantName: editDraft.value.tenantName.trim(),
    ip: editDraft.value.ip.trim(),
    mac: editDraft.value.mac.trim().toUpperCase(),
    systemType: editDraft.value.systemType,
    softwareInfo: editDraft.value.softwareInfo.trim(),
  })
  const name = current.name
  closeModal()
  showNotice(`${name} 的设备信息已更新`)
}

function deleteDevice(device) {
  if (!window.confirm(`确定删除设备“${device.name}”（${device.sn}）吗？`)) return
  devices.value = devices.value.filter((item) => item.sn !== device.sn)
  if (selectedDevice.value?.sn === device.sn) closeModal()
  showNotice('设备已删除')
}

function handleDeviceAction(action) {
  const device = selectedDevice.value
  if (!device) return
  if (action === '路线地图') {
    router.push({ name: 'deviceRouteMap', params: { sn: device.sn }, query: { deviceName: device.name } })
    return
  }
  if (!window.confirm(`演示模式：确定对“${device.name}”模拟执行${action}吗？不会向真实设备下发指令。`)) return
  showNotice(`已模拟执行${action}，未向真实设备下发指令`)
}

function handleKeydown(event) {
  if (event.key === 'Escape' && modalMode.value) closeModal()
}

onBeforeUnmount(() => {
  window.clearTimeout(noticeTimer)
  window.clearTimeout(refreshTimer)
})
</script>

<template>
  <div class="device-page" style="--accent: #3886e8" @keydown="handleKeydown">
    <header class="device-page-heading">
      <div>
        <div class="device-eyebrow"><span></span> DEVICE MANAGEMENT</div>
        <h1>设备管理</h1>
        <p>查看已接入设备的连接状态、软件版本及基础信息。</p>
      </div>
      <div class="device-page-summary"><AppIcon name="devices" :size="20" /><span>设备总数 <strong>{{ devices.length }}</strong></span><i></i><span>在线 <strong>{{ onlineCount }}</strong></span></div>
    </header>

    <section class="device-list-card">
      <div class="device-list-heading">
        <div><h2>设备列表</h2><p>共 {{ filteredDevices.length }} 条设备记录</p></div>
        <div class="device-list-toolbar">
          <label class="device-search"><AppIcon name="search" :size="17" /><input v-model="keyword" type="search" aria-label="搜索设备" placeholder="搜索名称、SN、IP 或租户" /></label>
          <select v-model="statusFilter" aria-label="在线状态筛选"><option>全部状态</option><option>在线</option><option>离线</option></select>
        </div>
      </div>

      <div class="device-table-scroll">
        <table class="device-table">
          <thead><tr><th>设备名称</th><th>设备 SN</th><th>在线状态</th><th>软件信息</th><th>租户名称</th><th>IP</th><th>MAC</th><th>系统类型</th><th>创建时间</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="device in filteredDevices" :key="device.sn">
              <td><strong class="device-name">{{ device.name }}</strong></td>
              <td><code>{{ device.sn }}</code></td>
              <td><span class="device-status" :class="device.status === '在线' ? 'online' : 'offline'"><i></i>{{ device.status }}</span></td>
              <td><span class="device-software">{{ device.softwareInfo }}</span></td>
              <td>{{ device.tenantName }}</td>
              <td><code>{{ device.ip }}</code></td>
              <td><code>{{ device.mac }}</code></td>
              <td>{{ device.systemType }}</td>
              <td class="device-created-at">{{ device.createdAt }}</td>
              <td><div class="device-row-actions">
                <button type="button" :disabled="Boolean(refreshingSn)" @click="refreshDevice(device)"><AppIcon name="refresh" :size="14" />{{ refreshingSn === device.sn ? '刷新中' : '刷新' }}</button>
                <button type="button" @click="openEdit(device)"><AppIcon name="edit" :size="14" />编辑</button>
                <button type="button" @click="openDetails(device)"><AppIcon name="eye" :size="14" />详情</button>
                <button type="button" class="danger" @click="deleteDevice(device)"><AppIcon name="trash" :size="14" />删除</button>
              </div></td>
            </tr>
            <tr v-if="!filteredDevices.length"><td colspan="10" class="device-empty">没有找到匹配的设备</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="modalMode" class="device-modal-backdrop" @click.self="closeModal">
      <div class="device-modal" role="dialog" aria-modal="true" :aria-label="modalMode === 'edit' ? '编辑设备' : '设备详情'">
        <div class="device-modal-heading"><div><span class="device-modal-icon"><AppIcon name="devices" :size="21" /></span><div><h2>{{ modalMode === 'edit' ? '编辑设备' : '设备详情' }}</h2><p>{{ selectedDevice?.sn }}</p></div></div><button type="button" aria-label="关闭" @click="closeModal"><AppIcon name="close" :size="20" /></button></div>
        <form v-if="modalMode === 'edit' && editDraft" class="device-edit-form" @submit.prevent="saveEdit">
          <label>设备名称<input v-model.trim="editDraft.name" required maxlength="60" /></label>
          <label>租户名称<input v-model.trim="editDraft.tenantName" required maxlength="60" /></label>
          <label>IP<input v-model.trim="editDraft.ip" required /></label>
          <label>MAC<input v-model.trim="editDraft.mac" required /></label>
          <label>系统类型<select v-model="editDraft.systemType" required><option>Android</option><option>Windows</option></select></label>
          <label>软件信息<input v-model.trim="editDraft.softwareInfo" required placeholder="例如：Windows数字人软件v1.0" /></label>
          <div class="device-modal-actions"><button type="button" @click="closeModal">取消</button><button type="submit" class="primary">保存修改</button></div>
        </form>
        <template v-else-if="selectedDevice">
          <dl class="device-detail-grid">
            <div><dt>设备名称</dt><dd>{{ selectedDevice.name }}</dd></div>
            <div><dt>设备 SN</dt><dd>{{ selectedDevice.sn }}</dd></div>
            <div><dt>在线状态</dt><dd><span class="device-status" :class="selectedDevice.status === '在线' ? 'online' : 'offline'"><i></i>{{ selectedDevice.status }}</span></dd></div>
            <div><dt>租户名称</dt><dd>{{ selectedDevice.tenantName }}</dd></div>
            <div><dt>IP</dt><dd>{{ selectedDevice.ip }}</dd></div>
            <div><dt>MAC</dt><dd>{{ selectedDevice.mac }}</dd></div>
            <div><dt>系统类型</dt><dd>{{ selectedDevice.systemType }}</dd></div>
            <div><dt>创建时间</dt><dd>{{ selectedDevice.createdAt }}</dd></div>
            <div><dt>最近刷新</dt><dd>{{ selectedDevice.lastRefresh }}</dd></div>
          </dl>
          <div class="device-detail-software"><strong>软件信息</strong><div><span>{{ selectedDevice.softwareInfo }}</span></div></div>
          <div class="device-detail-remote-actions" aria-label="设备远程操作">
            <button type="button" @click="handleDeviceAction('路线地图')"><AppIcon name="route-map" :size="17" />路线地图</button>
            <button type="button" @click="handleDeviceAction('重启')"><AppIcon name="refresh" :size="17" />重启</button>
            <button type="button" class="danger" @click="handleDeviceAction('关机')"><AppIcon name="power" :size="17" />关机</button>
          </div>
          <div class="device-modal-actions"><button type="button" @click="closeModal">关闭</button><button type="button" class="primary" @click="openEdit(selectedDevice)">编辑设备</button></div>
        </template>
      </div>
    </div>
    <Transition name="fade"><div v-if="notice" class="device-notice" role="status"><AppIcon name="check" :size="17" />{{ notice }}</div></Transition>
  </div>
</template>

<style scoped>
.device-page { min-width: 0; padding-bottom: 12px; color: #353a4e; }
.device-page-heading, .device-list-heading, .device-list-toolbar, .device-page-summary, .device-row-actions, .device-modal-heading, .device-modal-heading > div, .device-modal-actions { display: flex; align-items: center; }
.device-page-heading { justify-content: space-between; gap: 24px; margin-bottom: 27px; }
.device-eyebrow { display: flex; align-items: center; gap: 8px; color: #8b95a9; font-size: 11px; font-weight: 700; letter-spacing: 1.8px; }
.device-eyebrow span { width: 7px; height: 7px; border-radius: 50%; background: #3986e8; }
.device-page h1 { margin: 10px 0 7px; font-size: 28px; }
.device-page-heading p, .device-list-heading p { margin: 0; color: #9199aa; font-size: 13px; }
.device-page-summary { gap: 12px; padding: 13px 17px; border: 1px solid #e4e9f3; border-radius: 12px; background: #fff; white-space: nowrap; box-shadow: 0 8px 25px #3547740a; }
.device-page-summary > .app-icon { color: #3886e8; }
.device-page-summary span { color: #778398; font-size: 12px; }
.device-page-summary strong { margin-left: 4px; color: #323c54; font-size: 17px; }
.device-page-summary i { width: 1px; height: 22px; background: #e6eaf2; }
.device-list-card { overflow: hidden; border: 1px solid #e9edf4; border-radius: 16px; background: #fff; box-shadow: 0 12px 34px #283d660a; }
.device-list-heading { justify-content: space-between; gap: 18px; padding: 22px 24px; border-bottom: 1px solid #edf0f5; }
.device-list-heading h2 { margin: 0 0 5px; font-size: 17px; }
.device-list-toolbar { gap: 10px; }
.device-search { display: flex; align-items: center; gap: 8px; width: 270px; padding: 0 12px; color: #9ca5b5; border: 1px solid #e3e8f0; border-radius: 9px; background: #fafbfe; }
.device-search input { width: 100%; height: 37px; border: 0; outline: 0; background: transparent; font: inherit; font-size: 12px; }
.device-list-toolbar select { height: 39px; padding: 0 12px; border: 1px solid #e3e8f0; border-radius: 9px; background: #fafbfe; color: #555f72; font-size: 12px; }
.device-table-scroll { overflow-x: auto; }
.device-table { width: 100%; min-width: 1460px; border-collapse: collapse; text-align: left; }
.device-table th { padding: 15px 14px; color: #8791a4; background: #fafbfe; font-size: 11px; font-weight: 700; white-space: nowrap; }
.device-table td { padding: 16px 14px; color: #637086; border-top: 1px solid #f0f2f6; font-size: 12px; white-space: nowrap; }
.device-table tbody tr:hover { background: #fbfcff; }
.device-table th:first-child, .device-table td:first-child { padding-left: 24px; }
.device-table th:last-child, .device-table td:last-child { padding-right: 24px; }
.device-name { color: #343c50; font-size: 12px; }
.device-table code { color: #58657d; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; }
.device-status { display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px; border-radius: 99px; font-size: 11px; font-weight: 650; }
.device-status i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.device-status.online { color: #22a877; background: #ebfaf4; }
.device-status.offline { color: #98a1ae; background: #f0f2f5; }
.device-software { color: #5e7190; font-size: 11px; }
.device-created-at { color: #8791a2 !important; font-size: 11px !important; }
.device-row-actions { gap: 5px; }
.device-row-actions button { display: inline-flex; align-items: center; gap: 4px; padding: 6px 7px; color: #55729b; border: 0; border-radius: 6px; background: transparent; font-size: 11px; cursor: pointer; }
.device-row-actions button:hover { background: #edf4ff; color: #347ee0; }
.device-row-actions button.danger { color: #d66569; }
.device-row-actions button.danger:hover { background: #fff0f0; }
.device-row-actions button:disabled { opacity: .5; cursor: wait; }
.device-empty { padding: 52px !important; text-align: center; color: #a0a8b6 !important; }
.device-modal-backdrop { position: fixed; z-index: 120; inset: 0; display: grid; place-items: center; padding: 20px; background: #17243a91; }
.device-modal { width: min(620px, 100%); max-height: min(760px, calc(100vh - 40px)); overflow-y: auto; padding: 25px; border-radius: 16px; background: #fff; box-shadow: 0 26px 80px #101d3652; }
.device-modal-heading { justify-content: space-between; margin-bottom: 22px; }
.device-modal-heading > div { gap: 11px; }
.device-modal-icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px; color: #3886e8; background: #edf4ff; }
.device-modal-heading h2 { margin: 0 0 4px; font-size: 18px; }
.device-modal-heading p { margin: 0; color: #9da6b5; font-size: 11px; }
.device-modal-heading button { padding: 5px; color: #919bab; border: 0; background: transparent; cursor: pointer; }
.device-edit-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
.device-edit-form label { display: grid; gap: 7px; color: #626d80; font-size: 12px; font-weight: 650; }
.device-edit-form input, .device-edit-form select { min-width: 0; width: 100%; height: 39px; padding: 0 11px; color: #404a5d; border: 1px solid #e2e7ef; border-radius: 8px; outline: 0; background: #fbfcff; font: inherit; font-weight: 400; }
.device-edit-form input:focus, .device-edit-form select:focus { border-color: #70a4ee; box-shadow: 0 0 0 3px #3986e817; }
.device-modal-actions { grid-column: 1 / -1; justify-content: flex-end; gap: 9px; margin-top: 11px; }
.device-modal-actions button { min-height: 38px; padding: 0 16px; border: 1px solid #e2e7ef; border-radius: 8px; background: #fff; color: #667287; font-size: 12px; font-weight: 650; cursor: pointer; }
.device-modal-actions button.primary { border-color: #3986e8; background: #3986e8; color: #fff; }
.device-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 17px 20px; margin: 0; }
.device-detail-grid div { min-width: 0; }
.device-detail-grid dt { margin-bottom: 5px; color: #939eaf; font-size: 11px; }
.device-detail-grid dd { margin: 0; color: #3e4a60; font-size: 13px; overflow-wrap: anywhere; }
.device-detail-software { margin-top: 23px; padding: 17px; border: 1px solid #e8eef8; border-radius: 10px; background: #f7faff; }
.device-detail-software > strong { display: block; margin-bottom: 12px; font-size: 13px; }
.device-detail-software > div { display: flex; flex-wrap: wrap; gap: 12px; }
.device-detail-software span { color: #7d8ba1; font-size: 12px; }
.device-detail-remote-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 17px; }
.device-detail-remote-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 38px; padding: 0 14px; color: #4279ba; border: 1px solid #d9e7f8; border-radius: 8px; background: #f5f9ff; font-size: 12px; font-weight: 650; cursor: pointer; }
.device-detail-remote-actions button:hover { border-color: #7daeea; background: #edf5ff; }
.device-detail-remote-actions button.danger { color: #d36568; border-color: #f4dddd; background: #fff8f8; }
.device-detail-remote-actions button.danger:hover { border-color: #e9a3a5; background: #fff0f0; }
.device-notice { position: fixed; z-index: 140; right: 28px; bottom: 26px; display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 9px; color: #fff; background: #354765; box-shadow: 0 12px 30px #17243a35; font-size: 12px; }
@media (max-width: 760px) { .device-page-heading, .device-list-heading { align-items: flex-start; flex-direction: column; } .device-list-toolbar { width: 100%; } .device-search { flex: 1; width: auto; } .device-edit-form, .device-detail-grid { grid-template-columns: 1fr; } }
</style>
