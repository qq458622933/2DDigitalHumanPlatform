import presenterFemale from '../assets/avatar-previews/presenter-female.png'
import instructorMale from '../assets/avatar-previews/instructor-male.png'
import presenterCreative from '../assets/avatar-previews/presenter-creative.png'

export const navItems = [
  { key: 'training', label: '形象训练', path: '/training', icon: 'sparkles' },
  { key: 'orchestration', label: '动作编排', path: '/orchestration', icon: 'workflow' },
  { key: 'digitalHumans', label: '数字人', path: '/digital-humans', icon: 'video' },
  { key: 'knowledge', label: '知识库', path: '/knowledge', icon: 'book' },
  { key: 'benefits', label: '权益管理', path: '/benefits', icon: 'crown' },
  { key: 'resources', label: '资源池管理', path: '/resources', icon: 'server' },
  { key: 'assets', label: '资产管理', path: '/assets', icon: 'folder' },
  { key: 'versions', label: '版本管理', path: '/versions', icon: 'layers' },
]

export const moduleData = {
  training: {
    title: '形象训练',
    eyebrow: 'DIGITAL AVATAR',
    description: '创建和训练专属数字人形象，实时掌握训练进度。',
    action: '新建训练',
    icon: 'sparkles',
    accent: '#6c5ce7',
    stats: [
      { label: '形象总数', value: '24', change: '+3 本月', icon: 'user' },
      { label: '训练中', value: '3', change: '运行正常', icon: 'clock' },
      { label: '已完成', value: '19', change: '完成率 86%', icon: 'check' },
      { label: '2D在线版可训练次数', value: '16', change: '当前可用', icon: 'sparkles' },
      { label: '2D本地版可训练次数', value: '10', change: '当前可用', icon: 'server' },
    ],
    columns: ['项目名称', '训练类型', '创建时间', '状态'],
    rows: [
      { name: '企业讲解员 · 小雅', subtitle: 'ID: AVT-20260801', type: '2D在线版', date: '2026-08-01 14:26', progress: 100, status: '已完成', preview: presenterFemale, tone: 'violet' },
      { name: '品牌推荐官 · 林夕', subtitle: 'ID: AVT-20260728', type: '2D在线版', date: '2026-07-28 09:42', progress: 72, status: '训练中', preview: presenterCreative, tone: 'blue' },
      { name: '客服助手 · 安安', subtitle: 'ID: AVT-20260725', type: '2D本地版', date: '2026-07-25 16:08', progress: 36, status: '训练中', preview: presenterFemale, tone: 'cyan' },
      { name: '课程导师 · 陈老师', subtitle: 'ID: AVT-20260722', type: '2D在线版', date: '2026-07-22 11:30', progress: 100, status: '已完成', preview: instructorMale, tone: 'orange' },
      { name: '产品体验官 · 星野', subtitle: 'ID: AVT-20260718', type: '2D本地版', date: '2026-07-18 18:05', progress: 0, status: '待训练', preview: presenterCreative, tone: 'pink' },
      { name: '直播主播 · 沐晴', subtitle: 'ID: AVT-20260715', type: '2D在线版', date: '2026-07-15 13:48', progress: 0, status: '不通过', failureReason: '视频中存在黑帧，请重新上传符合要求的视频素材', preview: presenterFemale, tone: 'violet' },
    ],
  },
  agents: {
    title: '智能体', eyebrow: 'AI AGENT', description: '编排智能体能力，连接知识与业务流程。', action: '创建智能体', icon: 'bot', accent: '#3877f5',
    stats: [
      { label: '智能体总数', value: '16', change: '+2 本月', icon: 'bot' },
      { label: '运行中', value: '12', change: '可用率 99.8%', icon: 'check' },
      { label: '今日会话', value: '3,842', change: '+18.2%', icon: 'message' },
      { label: '平均响应', value: '0.8s', change: '-0.12s', icon: 'clock' },
    ],
    columns: ['智能体名称', '应用场景', '关联知识库', '更新时间', '状态'],
    rows: [
      { name: '售前咨询助手', subtitle: 'Agent-028', type: '产品咨询', extra: '产品知识中心', date: '2026-08-04 10:26:18', createdAt: '2026-08-01 09:36:22', owner: 'admin', status: '运行中', isTemplate: true, tone: 'blue' },
      { name: '直播运营助手', subtitle: 'Agent-024', type: '直播互动', extra: '直播话术库', date: '2026-08-03 18:40:06', createdAt: '2026-07-27 14:18:35', owner: 'admin', status: '运行中', isTemplate: false, tone: 'violet' },
      { name: '课程答疑助手', subtitle: 'Agent-019', type: '教育培训', extra: '课程资料库', date: '2026-07-30 15:12:44', createdAt: '2026-07-21 11:05:16', owner: '何文斌', status: '调试中', isTemplate: false, tone: 'cyan' },
      { name: '企业介绍助手', subtitle: 'Agent-012', type: '品牌宣传', extra: '企业资料库', date: '2026-07-26 09:08:52', createdAt: '2026-07-16 05:53:56', owner: 'admin', status: '已停用', isTemplate: true, tone: 'orange' },
    ],
  },
  digitalHumans: {
    title: '数字人', eyebrow: 'DIGITAL HUMAN', description: '统一管理数字人员工，快速配置声音与驱动策略。', action: '创建数字人', icon: 'video', accent: '#8b5cf6',
    stats: [
      { label: '数字人总数', value: '32', change: '+5 本月', icon: 'user' },
      { label: '已上线', value: '21', change: '在线 18 个', icon: 'check' },
      { label: '驱动时长', value: '486h', change: '+8.4%', icon: 'clock' },
      { label: '互动次数', value: '28.6k', change: '+23.1%', icon: 'chart' },
    ],
    columns: ['数字人名称', '形象类型', '绑定智能体'],
    rows: [
      { name: '小雅', subtitle: '品牌讲解员', type: '2D在线版', extra: '售前咨询助手', description: '专注企业品牌介绍与产品功能讲解。', createdAt: '2026-08-01 14:26', appCode: 'APP-X7K2-9QMP', resolution: '9:16', preview: presenterFemale, tone: 'violet' },
      { name: '林夕', subtitle: '直播推荐官', type: '2D在线版', extra: '直播运营助手', description: '用于直播间产品推荐与活动信息播报。', createdAt: '2026-07-28 09:42', appCode: 'APP-B4NT-6LQ8', resolution: '9:16', preview: presenterCreative, tone: 'pink' },
      { name: '安安', subtitle: '智能客服', type: '2D本地版', extra: '客服接待助手', description: '提供业务咨询、问题解答和服务引导。', createdAt: '2026-07-25 16:08', appCode: 'APP-M3CA-8VPR', resolution: '16:9', preview: presenterFemale, tone: 'cyan' },
      { name: '陈老师', subtitle: '课程导师', type: '2D本地版', extra: '课程答疑助手', description: '适用于在线课程讲授和知识内容演示。', createdAt: '2026-07-22 11:30', appCode: 'APP-T9HW-2DF5', resolution: '16:9', preview: instructorMale, tone: 'orange' },
    ],
  },
  knowledge: {
    title: '知识库', eyebrow: 'KNOWLEDGE BASE', description: '沉淀企业知识，为智能体提供准确、可靠的内容来源。', action: '新建知识库', icon: 'book', accent: '#0ea5e9',
    stats: [
      { label: '知识库', value: '12', change: '+1 本月', icon: 'book' },
      { label: '文档总数', value: '2,460', change: '+126', icon: 'file' },
      { label: '切片数量', value: '86.4k', change: '向量化完成', icon: 'database' },
      { label: '今日命中', value: '9,021', change: '命中率 92%', icon: 'chart' },
    ],
    columns: ['知识库名称', '内容类型', '文档数量', '最后更新', '状态'],
    rows: [
      { name: '产品知识中心', subtitle: 'KB-20260801', type: '文档 / 网页', extra: '842 篇', documentCount: 842, characterCount: 125860, linkedApp: '售前咨询助手', creator: 'admin', createdAt: '2026-08-01 14:26:18', date: '10 分钟前', status: '已启用', tone: 'blue' },
      { name: '直播话术库', subtitle: 'KB-20260716', type: '文本 / 表格', extra: '326 篇', documentCount: 326, characterCount: 86420, linkedApp: '直播运营助手', creator: 'admin', createdAt: '2026-07-16 16:28:05', date: '昨天 16:28', status: '已启用', tone: 'violet' },
      { name: '课程资料库', subtitle: 'KB-20260622', type: '文档 / 音频', extra: '1,128 篇', documentCount: 1128, characterCount: 298640, linkedApp: '课程答疑助手', creator: '何文斌', createdAt: '2026-06-22 11:20:32', date: '07-30 11:20', status: '处理中', tone: 'cyan' },
      { name: '企业资料库', subtitle: 'KB-20260508', type: '网页 / 文档', extra: '164 篇', documentCount: 164, characterCount: 5593, linkedApp: '暂无', creator: 'wyt2026', createdAt: '2026-05-08 09:40:16', date: '07-21 09:40', status: '已启用', tone: 'orange' },
    ],
  },
  benefits: {
    title: '权益管理', eyebrow: 'BENEFITS', description: '查看套餐用量、资源配额与权益消耗明细。', action: '分配权益', icon: 'crown', accent: '#f59e0b',
    stats: [
      { label: '设备授权数量', value: '2', change: '当前用户', icon: 'server' },
      { label: '形象训练次数', value: '24', change: '当前用户', icon: 'sparkles' },
    ],
    columns: ['授权名称', '授权码', '使用状态', '到期时间', '创建时间', '绑定设备MAC地址'],
    rows: [
      { name: '展厅一号设备授权', subtitle: 'AUTH-7K2M-9Q4XPL', status: '已使用', expiryAt: '2027-06-26 23:59:59', createdAt: '2026-07-01 10:18:26', macAddress: '3C:52:82:9A:17:B4', userPhone: '13800138001', tone: 'orange' },
      { name: '直播间主机授权', subtitle: 'AUTH-B8NT-6LQ2VR', status: '已使用', expiryAt: '2027-03-15 23:59:59', createdAt: '2026-06-18 14:35:09', macAddress: 'A4:83:E7:20:6D:91', userPhone: '13900139002', tone: 'violet' },
      { name: '培训教室设备授权', subtitle: 'AUTH-M3CA-8V5PRD', status: '未使用', expiryAt: '2027-08-01 23:59:59', createdAt: '2026-08-01 09:42:17', macAddress: '—', userPhone: '18600186003', tone: 'blue' },
      { name: '移动演示设备授权', subtitle: 'AUTH-T9HW-2D7FKS', status: '未使用', expiryAt: '2026-12-31 23:59:59', createdAt: '2026-07-28 16:08:42', macAddress: '—', userPhone: '18800188004', tone: 'cyan' },
    ],
  },
  resources: {
    title: '资源池管理', eyebrow: 'RESOURCE POOL', description: '监控算力、并发和存储资源，保障业务稳定运行。', action: '新增资源', icon: 'server', accent: '#14b8a6',
    stats: [
      { label: '语音识别资源', value: '3', change: '全部可用', icon: 'message' },
      { label: '语音合成资源', value: '2', change: '全部可用', icon: 'video' },
      { label: '本地授权资源', value: '4', change: '3 个已启用', icon: 'server' },
      { label: '可用资源', value: '8', change: '运行正常', icon: 'check' },
    ],
    columns: ['资源名称', '资源类型', '资源配置', '创建时间', '状态'],
    rows: [
      { name: '实时交互ASR资源', subtitle: 'RES-ASR-001', type: '语音识别资源池', extra: '场景：数字人实时交互', date: '2026-08-05 10:26:18', status: '已启用', tone: 'blue', sn: 'ASR-SN-202608001', appId: 'ASR-APP-1028', appKey: 'asr_sk_8Kp3YvN6mQ2xR9tL', scene: '数字人实时交互' },
      { name: '标准语音合成资源', subtitle: 'RES-TTS-001', type: '语音合成资源池', extra: 'Cluster：volcano_tts', date: '2026-08-03 14:08:32', status: '已启用', tone: 'violet', appId: 'TTS-APP-2086', cluster: 'volcano_tts', accessToken: 'tts_at_7Hx92LmQ4vK8pN3sY6cR' },
      { name: '本地数字人授权资源', subtitle: 'RES-LICENSE-001', type: '本地数字人授权资源', extra: 'License 已配置', date: '2026-08-01 09:42:17', status: '已启用', tone: 'orange', licenseKey: '*:1787641636:87yt5Md6-p5z0c487dkjGjIz-4kDJ2xrCopn1wYZFF7EoVn5XmL8KtA2xdqQH9rPofkgiteEVwdKt2-GGsHZBw' },
    ],
  },
  assets: {
    title: '资产管理', eyebrow: 'DIGITAL ASSETS', description: '集中管理图片、音频、视频与数字人项目资产。', action: '上传资产', icon: 'folder', accent: '#ec4899',
    stats: [
      { label: '全部资产', value: '8,642', change: '+286 本月', icon: 'folder' },
      { label: '视频素材', value: '1,208', change: '占用 1.8TB', icon: 'video' },
      { label: '音频素材', value: '3,426', change: '占用 486GB', icon: 'message' },
      { label: '图片素材', value: '4,008', change: '占用 926GB', icon: 'file' },
    ],
    columns: ['资产名称', '文件类型', '文件大小', '更新时间', '状态'],
    rows: [
      { name: '企业宣传片_终版.mp4', subtitle: 'AST-86021', type: 'MP4 视频', extra: '286.4 MB', date: '今天 11:30', status: '可用', tone: 'pink' },
      { name: '产品介绍话术.wav', subtitle: 'AST-86008', type: 'WAV 音频', extra: '42.8 MB', date: '昨天 17:12', status: '可用', tone: 'violet' },
      { name: '品牌背景_科技蓝.png', subtitle: 'AST-85976', type: 'PNG 图片', extra: '8.2 MB', date: '07-30 15:42', status: '可用', tone: 'blue' },
      { name: '直播项目源文件.zip', subtitle: 'AST-85921', type: 'ZIP 压缩包', extra: '1.26 GB', date: '07-28 09:20', status: '审核中', tone: 'orange' },
    ],
  },
  versions: {
    title: '版本管理', eyebrow: 'VERSION CONTROL', description: '管理数字人应用版本，支持灰度发布与快速回滚。', action: '发布新版本', icon: 'layers', accent: '#6366f1',
    stats: [
      { label: '当前版本', value: 'v3.8.2', change: '稳定版本', icon: 'layers' },
      { label: '本月发布', value: '8', change: '+3 次', icon: 'check' },
      { label: '待发布', value: '2', change: '等待审核', icon: 'clock' },
      { label: '运行实例', value: '36', change: '全部正常', icon: 'server' },
    ],
    columns: ['版本号', '版本类型', '发布范围', '发布时间', '状态'],
    rows: [
      { name: 'v3.8.2', subtitle: '构建号 20260801.4', type: '正式版本', extra: '全量发布', date: '2026-08-01 18:30', status: '当前版本', tone: 'violet' },
      { name: 'v3.9.0-beta.2', subtitle: '构建号 20260803.1', type: '测试版本', extra: '测试环境', date: '2026-08-03 10:12', status: '测试中', tone: 'blue' },
      { name: 'v3.8.1', subtitle: '构建号 20260724.2', type: '正式版本', extra: '全量发布', date: '2026-07-24 16:40', status: '历史版本', tone: 'cyan' },
      { name: 'v3.8.0', subtitle: '构建号 20260712.6', type: '正式版本', extra: '全量发布', date: '2026-07-12 09:00', status: '历史版本', tone: 'orange' },
    ],
  },
}
