import { createRouter, createWebHashHistory } from 'vue-router'
import ModuleView from '../views/ModuleView.vue'
import OrchestrationView from '../views/OrchestrationView.vue'
import DigitalHumanDetailView from '../views/DigitalHumanDetailView.vue'
import AgentDetailView from '../views/AgentDetailView.vue'
import KnowledgeUploadView from '../views/KnowledgeUploadView.vue'
import KnowledgeDetailView from '../views/KnowledgeDetailView.vue'
import KnowledgeDocumentDetailView from '../views/KnowledgeDocumentDetailView.vue'
import VersionManagementView from '../views/VersionManagementView.vue'
import AgentRealtimeEditorView from '../views/AgentRealtimeEditorView.vue'
import VoiceTrainingView from '../views/VoiceTrainingView.vue'
import DeviceManagementView from '../views/DeviceManagementView.vue'
import DeviceRouteMapView from '../views/DeviceRouteMapView.vue'
import DeviceRouteCreateView from '../views/DeviceRouteCreateView.vue'
import DevicePointGuideView from '../views/DevicePointGuideView.vue'
import UserResourcesView from '../views/UserResourcesView.vue'

const routes = [
  { path: '/', redirect: '/training' },
  { path: '/training', name: 'training', component: ModuleView, meta: { moduleKey: 'training' } },
  { path: '/voice-training', name: 'voiceTraining', component: VoiceTrainingView },
  { path: '/agents', name: 'agents', component: ModuleView, meta: { moduleKey: 'agents' } },
  { path: '/agents/:agentId', name: 'agentDetail', component: AgentDetailView },
  { path: '/agents/:agentId/realtime-editor', name: 'agentRealtimeEditor', component: AgentRealtimeEditorView },
  { path: '/digital-humans', name: 'digitalHumans', component: ModuleView, meta: { moduleKey: 'digitalHumans' } },
  { path: '/digital-humans/:appCode', name: 'digitalHumanDetail', component: DigitalHumanDetailView },
  { path: '/digital-humans/:digitalHumanCode/agent/:agentId', name: 'digitalHumanAgentDetail', component: AgentDetailView },
  { path: '/devices', name: 'devices', component: DeviceManagementView },
  { path: '/devices/:sn/route-map', name: 'deviceRouteMap', component: DeviceRouteMapView },
  { path: '/devices/:sn/route-map/new', name: 'deviceRouteCreate', component: DeviceRouteCreateView },
  { path: '/devices/:sn/route-map/:routeId/edit', name: 'deviceRouteEdit', component: DeviceRouteCreateView },
  { path: '/devices/:sn/route-map/point-guide', name: 'devicePointGuide', component: DevicePointGuideView },
  { path: '/orchestration', name: 'orchestration', component: OrchestrationView },
  { path: '/knowledge', name: 'knowledge', component: ModuleView, meta: { moduleKey: 'knowledge' } },
  { path: '/knowledge/upload', name: 'knowledgeUpload', component: KnowledgeUploadView },
  { path: '/knowledge/:knowledgeId', name: 'knowledgeDetail', component: KnowledgeDetailView },
  { path: '/knowledge/:knowledgeId/documents/:documentId', name: 'knowledgeDocumentDetail', component: KnowledgeDocumentDetailView },
  { path: '/benefits', name: 'benefits', component: ModuleView, meta: { moduleKey: 'benefits' } },
  { path: '/resources', name: 'resources', component: ModuleView, meta: { moduleKey: 'resources' } },
  { path: '/user-resources', name: 'userResources', component: UserResourcesView },
  { path: '/assets', name: 'assets', component: ModuleView, meta: { moduleKey: 'assets' } },
  { path: '/versions', name: 'versions', component: VersionManagementView, meta: { moduleKey: 'versions' } },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
