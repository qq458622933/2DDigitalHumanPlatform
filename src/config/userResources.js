import { ref } from 'vue'

// 前端原型在页面切换时保留资源，刷新后恢复为三条演示数据。
export const userAgentResources = ref([
  {
    id: 'demo-agent-customer',
    name: '客服问答智能体',
    baseUrl: 'https://customer-agent.example.com/v1',
    apiKey: 'sk-demo-customer-001',
    model: 'customer-chat-demo',
    description: '用于客户咨询场景的演示资源',
    createdAt: '2026-11-20 10:00:00',
    isMock: true,
  },
  {
    id: 'demo-agent-guide',
    name: '展厅讲解智能体',
    baseUrl: 'https://guide-agent.example.com/v1',
    apiKey: 'sk-demo-guide-002',
    model: 'guide-chat-demo',
    description: '用于展厅导览场景的演示资源',
    createdAt: '2026-11-20 10:05:00',
    isMock: true,
  },
  {
    id: 'demo-agent-sales',
    name: '产品推荐智能体',
    baseUrl: 'https://sales-agent.example.com/v1',
    apiKey: 'sk-demo-sales-003',
    model: 'sales-chat-demo',
    description: '用于产品推荐场景的演示资源',
    createdAt: '2026-11-20 10:10:00',
    isMock: true,
  },
])
