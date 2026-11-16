import { ref } from 'vue'
import { moduleData } from './modules'

// 平台内共享资源选择；切换页面时保留每类资源的当前使用项。
export const resourcePoolRows = ref(moduleData.resources.rows.map((row) => ({ ...row })))

export function getActiveResource(type) {
  return resourcePoolRows.value.find((row) => row.type === type && row.isActive) || null
}
