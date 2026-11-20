import { ref } from 'vue'

// 原型共享数据：未绑定设备的示例路线在各设备页面展示，新建路线仅属于当前设备。
export const deviceRouteMapRows = ref([
  { id: 'route-1', name: '带我参观', mapName: '8月5日地图', type: '导览路线', status: 'published' },
  { id: 'route-2', name: '新版本测试', mapName: '8月5日地图', type: '导览路线', status: 'published' },
  { id: 'route-3', name: '参观公司导入测试', mapName: '8月5日地图', type: '导览路线', status: 'published' },
  { id: 'route-4', name: '展厅讲解', mapName: '8.27', type: '导览路线', status: 'published' },
  { id: 'route-5', name: '智能工厂大厅参观路线', mapName: '111', type: '导览路线', status: 'published' },
  { id: 'route-6', name: '带我看展品', mapName: '9月22日展会路线图', type: '导览路线', status: 'published' },
  { id: 'route-7', name: '新功能测试', mapName: '8月5日地图', type: '导览路线', status: 'published' },
  { id: 'route-8', name: '测试', mapName: '何文斌测试地图', type: '导览路线', status: 'published' },
])

export const deviceMapNames = ['场景测试1', '8月5日地图', '8.27', '9月22日展会路线图', '何文斌测试地图', '111']

export const deviceRoutePublicConfigs = ref({})

export const deviceMapPointOptions = {
  '场景测试1': ['2', '电梯厅', '展厅', '透明屏', '8', '12', '充电桩', '806', '802'],
  '8月5日地图': ['4展厅', '3电梯厅', '7办公室', '接待点'],
  '9月22日展会路线图': ['接待点', '展厅', '充电桩', '出口'],
}

export const devicePointGuideRows = ref([
  { id: 'guide-1', displayOrder: 1, locationName: '4展厅', mapName: '8月5日地图', departureSpeech: '好的，现在出发展厅', yieldPrompt: '请稍作避让，我即将通过。', arrivalSpeech: '我们已到达展厅，请问有什么向我咨询的吗？', endPoint: '4展厅' },
  { id: 'guide-2', displayOrder: 2, locationName: '3电梯厅', mapName: '8月5日地图', departureSpeech: '出发去电梯厅', yieldPrompt: '请留意通行路线。', arrivalSpeech: '到达电梯厅', endPoint: '3电梯厅' },
  { id: 'guide-3', displayOrder: 3, locationName: '7办公室', mapName: '8月5日地图', departureSpeech: '跟着我出发去办公室区域', yieldPrompt: '前方通行，请注意避让。', arrivalSpeech: '到达办公室', endPoint: '7办公室' },
  { id: 'guide-4', displayOrder: 4, locationName: '接待点', mapName: '9月22日展会路线图', departureSpeech: '好的，我现在出发去接待点', yieldPrompt: '请给我让出通道，谢谢。', arrivalSpeech: '我已到达，你可以跟我交互了', endPoint: '接待点' },
])
