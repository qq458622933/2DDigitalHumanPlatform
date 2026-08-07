<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'

const rows = ref([
  { id: 1, type: '云端热词', word: '良渚博物馆', mistakes: [], createdAt: '2026-03-12 01:43:44' },
  { id: 2, type: '本地热词', word: '术天', mistakes: ['数天', '树天'], createdAt: '2026-03-12 01:43:09' },
  { id: 3, type: '云端热词', word: '术天', mistakes: [], createdAt: '2026-03-12 01:41:51' },
  { id: 4, type: '云端热词', word: '游戏设计微课', mistakes: [], createdAt: '2026-03-12 01:41:45' },
  { id: 5, type: '云端热词', word: '介绍一下', mistakes: [], createdAt: '2026-03-12 01:41:30' },
  { id: 6, type: '云端热词', word: '讲解一下', mistakes: [], createdAt: '2026-03-12 01:41:24' },
  { id: 7, type: '云端热词', word: '马蹄金', mistakes: [], createdAt: '2026-03-06 01:49:44' },
  { id: 8, type: '云端热词', word: '金饼', mistakes: [], createdAt: '2026-02-05 08:08:10' },
  { id: 9, type: '本地热词', word: '海昏侯', mistakes: ['海魂厚'], createdAt: '2026-02-05 08:07:19' },
  { id: 10, type: '云端热词', word: '海昏侯', mistakes: [], createdAt: '2026-02-05 08:06:32' },
])

const page = ref(1)
const pageSize = 10
const importInput = ref(null)
const modalVisible = ref(false)
const editingId = ref(null)
const form = ref({ type: '云端热词', word: '', mistakes: '' })
const formError = ref('')

const pageCount = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize)))
const visibleRows = computed(() => rows.value.slice((page.value - 1) * pageSize, page.value * pageSize))

function openCreate() {
  editingId.value = null
  form.value = { type: '云端热词', word: '', mistakes: '' }
  formError.value = ''
  modalVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  form.value = { type: row.type, word: row.word, mistakes: row.mistakes.join('、') }
  formError.value = ''
  modalVisible.value = true
}

function formatNow() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function saveHotword() {
  const word = form.value.word.trim()
  if (!word) {
    formError.value = '请输入热词'
    return
  }
  const mistakes = form.value.type === '本地热词'
    ? form.value.mistakes.split(/[、,，\s]+/).map((item) => item.trim()).filter(Boolean)
    : []
  if (form.value.type === '本地热词' && !mistakes.length) {
    formError.value = '本地热词需要填写错误词列表'
    return
  }
  if (editingId.value) {
    const row = rows.value.find((item) => item.id === editingId.value)
    if (row) Object.assign(row, { type: form.value.type, word, mistakes })
  } else {
    rows.value.unshift({ id: Date.now(), type: form.value.type, word, mistakes, createdAt: formatNow() })
    page.value = 1
  }
  modalVisible.value = false
}

function removeHotword(id) {
  rows.value = rows.value.filter((item) => item.id !== id)
  if (page.value > pageCount.value) page.value = pageCount.value
}

function handleImport(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const imported = String(reader.result || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    imported.forEach((line, index) => {
      const [word, ...mistakes] = line.split(/[,，]/).map((item) => item.trim()).filter(Boolean)
      if (word) rows.value.unshift({ id: Date.now() + index, type: '云端热词', word, mistakes, createdAt: formatNow() })
    })
    page.value = 1
  }
  reader.readAsText(file)
  event.target.value = ''
}

function exportHotwords() {
  const content = ['热词类型,热词,错误词列表,创建时间', ...rows.value.map((row) => `${row.type},${row.word},${row.mistakes.join('、')},${row.createdAt}`)].join('\n')
  const url = URL.createObjectURL(new Blob([`\ufeff${content}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = '热词配置.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <main class="hotword-config-page">
    <section class="hotword-config-card">
      <div class="hotword-toolbar">
        <div><strong>热词列表</strong><span>共 {{ rows.length }} 条配置</span></div>
        <div>
          <input ref="importInput" type="file" accept=".csv,.txt" hidden @change="handleImport" />
          <button type="button" class="hotword-tool-button" @click="importInput?.click()"><AppIcon name="file" :size="14" />导入</button>
          <button type="button" class="hotword-tool-button" @click="exportHotwords"><AppIcon name="logout" :size="14" />导出</button>
          <button type="button" class="primary-button hotword-add-button" @click="openCreate"><AppIcon name="plus" :size="15" />添加热词</button>
        </div>
      </div>
      <div class="hotword-table-scroll">
        <table class="hotword-table">
          <thead><tr><th>热词类型</th><th>热词</th><th>错误词列表</th><th>创建时间</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="row in visibleRows" :key="row.id">
              <td><span class="hotword-type-tag" :class="row.type === '本地热词' ? 'local' : 'cloud'">{{ row.type }}</span></td>
              <td><strong>{{ row.word }}</strong></td>
              <td>{{ row.mistakes.join(' | ') || '—' }}</td>
              <td>{{ row.createdAt }}</td>
              <td><div class="hotword-row-actions"><button type="button" @click="openEdit(row)"><AppIcon name="edit" :size="13" />编辑</button><button type="button" @click="removeHotword(row.id)"><AppIcon name="trash" :size="13" />删除</button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer class="hotword-table-footer">
        <span>共 {{ rows.length }} 条</span>
        <div><button type="button" :disabled="page === 1" @click="page--"><AppIcon name="chevron" :size="13" /></button><button v-for="number in pageCount" :key="number" type="button" :class="{ active: page === number }" @click="page = number">{{ number }}</button><button type="button" class="next" :disabled="page === pageCount" @click="page++"><AppIcon name="chevron" :size="13" /></button></div>
      </footer>
    </section>

    <Transition name="fade">
      <div v-if="modalVisible" class="modal-backdrop" @click.self="modalVisible = false">
        <div class="modal-card hotword-modal" role="dialog" aria-modal="true" :aria-label="editingId ? '编辑热词' : '添加热词'">
          <button class="modal-close" aria-label="关闭" @click="modalVisible = false"><AppIcon name="close" :size="18" /></button>
          <h3>{{ editingId ? '编辑热词' : '添加热词' }}</h3>
          <p>配置热词以及可能被错误识别的近音词。</p>
          <form @submit.prevent="saveHotword">
            <label for="hotword-type">热词类型</label>
            <select id="hotword-type" v-model="form.type"><option>云端热词</option><option>本地热词</option></select>
            <label for="hotword-name">热词</label>
            <input id="hotword-name" v-model="form.word" maxlength="30" placeholder="请输入热词" />
            <template v-if="form.type === '本地热词'">
              <label for="hotword-mistakes">错误词列表</label>
              <textarea id="hotword-mistakes" v-model="form.mistakes" rows="3" placeholder="多个错误词使用逗号或顿号分隔"></textarea>
            </template>
            <span v-if="formError" class="form-error">{{ formError }}</span>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="modalVisible = false">取消</button><button type="submit" class="primary-button">保存</button></div>
          </form>
        </div>
      </div>
    </Transition>
  </main>
</template>
