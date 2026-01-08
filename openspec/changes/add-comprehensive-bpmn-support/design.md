# Design: 添加全面的 BPMN 节点支持和增强属性面板

## Context

vue-flow-bpm 是一个基于 Vue 3 和 vue-flow 的 BPMN 2.0 流程建模工具。当前实现支持基础的节点类型和有限的属性配置。为了满足实际业务需求并与主流 BPMN 工具（如 bpmnjs）和引擎（如 Flowable）保持兼容，需要扩展节点类型支持和属性配置功能。

**约束条件：**
- 必须保持与现有 BPMN 文件的向后兼容性
- 必须符合 BPMN 2.0 规范
- 必须支持 Flowable 的扩展属性
- UI 应该简洁直观，参考 bpmnjs 的设计

**相关方：**
- 最终用户：业务分析师、开发人员
- BPMN 引擎：Flowable（主要）、Activiti、Camunda

## Goals / Non-Goals

**Goals:**
1. 扩展节点类型支持到至少 15 种 BPMN 元素
2. 实现与 bpmnjs 和 Flowable 兼容的属性面板
3. 支持所有关键的 Flowable 扩展属性
4. 保持代码的可维护性和可扩展性
5. 提供清晰的属性验证和错误提示

**Non-Goals:**
1. 完整的 BPMN 2.0 规范实现（优先支持最常用的 80% 功能）
2. 可视化流程模拟和执行
3. 协作编辑功能
4. 流程版本管理和比较

## Decisions

### 1. 节点类型架构

**决策：** 使用组合模式和工厂模式创建节点组件

**理由：**
- 每种节点类型都有独立的 Vue 组件
- 共享基础功能通过组合式函数（composables）实现
- 节点配置集中在 `BPMN_ELEMENT_CONFIGS` 中管理

**实现：**
```typescript
// src/types/bpmn.ts
export type BpmnElementType =
  // 现有类型
  | 'startEvent' | 'endEvent' | 'userTask' | 'serviceTask'
  | 'exclusiveGateway' | 'parallelGateway' | 'subProcess'
  // 新增事件类型
  | 'intermediateTimerEvent' | 'intermediateMessageEvent'
  | 'intermediateSignalEvent' | 'boundaryErrorEvent'
  | 'boundaryTimerEvent' | 'boundaryMessageEvent'
  // 新增任务类型
  | 'scriptTask' | 'businessRuleTask' | 'manualTask'
  | 'receiveTask' | 'sendTask'
  // 新增网关类型
  | 'inclusiveGateway' | 'eventGateway'
  // 其他
  | 'callActivity' | 'eventSubProcess'
```

**替代方案考虑：**
- 使用单一通用节点组件，通过 props 区分类型 → 被否决，会导致组件过于复杂
- 使用第三方 BPMN 库 → 被否决，增加了依赖且不够灵活

### 2. 属性面板组件结构

**决策：** 使用分组和标签页结构，每个属性组独立组件

**理由：**
- 参考 bpmnjs 的设计，用户熟悉
- 属性按功能分组，易于查找
- 支持渐进式显示（基础 vs 高级属性）

**实现：**
```
PropertyPanel.vue
├── BasicTab
│   ├── CommonProperties（ID、名称、文档）
│   ├── TypeSpecificProperties（任务、网关、事件特定属性）
├── AdvancedTab
│   ├── AsyncConfig（异步配置）
│   ├── MultiInstanceConfig（多实例）
│   ├── SkipConfig（跳过表达式）
├── ExecutionTab
│   ├── ListenerConfig（执行监听器）
│   ├── TaskListenerConfig（任务监听器）
├── FormTab
│   ├── FormPropertiesConfig（表单属性）
└── IOTab
    ├── ParametersConfig（输入/输出参数）
```

**替代方案考虑：**
- 单一长表单 → 被否决，不利于查找和编辑
- 模态对话框 → 被否决，无法同时查看画布和属性

### 3. 监听器配置

**决策：** 支持三种类型的监听器：class、expression、delegateExpression

**理由：**
- Flowable 支持这三种类型
- 覆盖了大部分使用场景

**实现：**
```typescript
export interface Listener {
  id: string
  event: 'start' | 'end' | 'take' | 'create' | 'assignment' | 'complete' | 'delete'
  type: 'class' | 'expression' | 'delegateExpression'
  value: string
  fields?: ListenerField[]
}
```

### 4. 多实例配置

**决策：** 支持串行和并行多实例，配置集合变量、元素变量、完成条件

**理由：**
- Flowable 的多实例功能是关键特性
- 支持常见的循环和并行执行场景

**实现：**
```typescript
export interface MultiInstanceConfig {
  isSequential: boolean
  collection?: string          // 集合变量名
  elementVariable?: string     // 元素变量名
  completionCondition?: string // 完成条件表达式
  cardinality?: string         // 基数（可选）
}
```

### 5. 表单属性配置

**决策：** 支持表单属性列表，每个属性包含类型、验证规则、默认值

**理由：**
- Flowable 的表单属性用于动态表单生成
- 支持内置类型（string、long、double、boolean、date、enum）

**实现：**
```typescript
export interface FormProperty {
  id: string
  name: string
  type: 'string' | 'long' | 'double' | 'boolean' | 'date' | 'enum'
  required: boolean
  readable: boolean
  writable: boolean
  defaultValue?: string
  values?: FormPropertyValue[] // 用于 enum 类型
}
```

## Data Model

### 节点数据模型扩展

```typescript
export interface BpmnNodeData {
  // 现有属性
  label: string
  bpmnId?: string
  documentation?: string

  // 新增：通用配置
  asyncBefore?: boolean
  asyncAfter?: boolean
  async?: boolean
  skipExpression?: string

  // 新增：任务特定属性
  assignee?: string
  candidateUsers?: string[]
  candidateGroups?: string[]
  priority?: string
  dueDate?: string
  formKey?: string

  // 新增：脚本任务
  scriptFormat?: string
  script?: string

  // 新增：业务规则任务
  ruleVariablesInput?: string
  rules?: string
  resultVariable?: string

  // 新增：调用活动
  calledElement?: string
  inheritVariables?: boolean

  // 新增：事件配置
  timerType?: 'duration' | 'date' | 'cycle'
  timerExpression?: string
  messageRef?: string
  signalRef?: string
  errorCode?: string
  escalationCode?: string

  // 新增：扩展配置
  listeners?: Listener[]
  formProperties?: FormProperty[]
  multiInstance?: MultiInstanceConfig
  inputParameters?: Parameter[]
  outputParameters?: Parameter[]
}
```

### 边数据模型扩展

```typescript
export interface BpmnEdgeData {
  // 现有属性
  condition?: string
  label?: string
  name?: string
  documentation?: string
  bpmnId?: string
  waypoints?: Array<{ x: number; y: number }>
  path?: string

  // 新增：序列流条件类型
  conditionType?: 'expression' | 'script'
  conditionScriptFormat?: string
  conditionScript?: string

  // 新增：跳过表达式
  skipExpression?: string
}
```

## UI/UX Design

### 属性面板布局

```
┌─────────────────────────────────────┐
│ Properties                    [×]   │
├─────────────────────────────────────┤
│ [Basic] [Execution] [Form] [IO]    │
├─────────────────────────────────────┤
│ Basic Tab                           │
│ ┌─────────────────────────────┐     │
│ │ ID                          │     │
│ │ [userTask_1]                │     │
│ │                             │     │
│ │ Name / Label                │     │
│ │ [Review Request]            │     │
│ │                             │     │
│ │ Documentation               │     │
│ │ [Task for reviewing...]     │     │
│ └─────────────────────────────┘     │
│                                     │
│ ┌─────────────────────────────┐     │
│ │ Assignee                    │     │
│ │ [${initiator}]              │     │
│ │                             │     │
│ │ Candidate Users             │     │
│ │ [user1, user2]              │     │
│ │                             │     │
│ │ Priority                    │     │
│ │ [50]                        │     │
│ └─────────────────────────────┘     │
│                                     │
│ [+ Advanced Settings]               │
└─────────────────────────────────────┘
```

### 监听器配置 UI

```
┌─────────────────────────────────────┐
│ Execution Listeners                 │
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐     │
│ │ Event: [start ▼]            │     │
│ │ Type:  [class ▼]            │     │
│ │ Value: [com.example.MyListener]│  │
│ │                             │     │
│ │ Fields:                     │     │
│ │ ┌─ [fieldName] [value] [×] │     │
│ │ └─ [+ Add Field]            │     │
│ │ [Save] [Cancel] [Delete]    │     │
│ └─────────────────────────────┘     │
│                                     │
│ [+ Add Listener]                    │
└─────────────────────────────────────┘
```

## Risks / Trade-offs

### 风险 1: 属性面板过于复杂

**描述：** 大量的属性配置选项可能让用户感到困惑

**缓解措施：**
- 使用标签页和分组组织属性
- 默认隐藏高级属性
- 提供属性预设和模板
- 添加工具提示和文档链接

### 风险 2: BPMN 2.0 规范兼容性

**描述：** 可能无法 100% 符合 BPMN 2.0 规范

**缓解措施：**
- 优先实现最常用的 80% 功能
- 使用 bpmn-js 作为参考实现
- 添加验证和测试用例
- 清楚地文档化不支持的功能

### 风险 3: Flowable 扩展属性的可移植性

**描述：** 使用 Flowable 特定属性会降低与其他 BPMN 引擎的兼容性

**缓解措施：**
- 使用标准的 `flowable:` 命名空间
- 在导出时提供兼容性选项
- 文档化 Flowable 特定功能

### 权衡 1: 开发时间 vs 功能完整性

**描述：** 完整实现所有 BPMN 节点类型和属性需要大量时间

**权衡：**
- 优先实现最常用的节点类型和属性
- 使用迭代开发，分阶段发布功能
- 从社区收集反馈，确定优先级

## Migration Plan

### 阶段 1: 基础扩展（2-3 周）
- 添加 5-8 个新节点类型（脚本任务、接收任务、发送任务、边界事件等）
- 增强现有属性配置（监听器、多实例）
- 更新 BPMN 导入/导出逻辑

### 阶段 2: 高级功能（3-4 周）
- 添加剩余节点类型（调用活动、事件子流程、包容网关等）
- 实现表单属性配置
- 实现输入/输出参数配置
- 添加属性验证和错误提示

### 阶段 3: 优化和测试（2 周）
- UI/UX 优化
- 添加单元测试和集成测试
- 性能优化
- 文档编写

### 回滚计划

- 所有新功能通过特性标志控制
- 保持向后兼容性
- 可以通过配置禁用新功能
- 提供数据迁移脚本（如果需要）

## Open Questions

1. **表达式编辑器复杂度**：是否需要实现完整的表达式语法高亮和验证？
   - 建议：先实现简单的文本输入，后续可以添加插件支持高级功能

2. **池/泳道支持**：是否在本次迭代中实现？
   - 建议：延迟到后续版本，优先实现单流程的完整功能

3. **流程变量支持**：是否需要实现流程变量的管理和验证？
   - 建议：先实现基本的变量名验证，后续可以添加变量管理面板

4. **预设模板**：是否需要提供常用的节点属性预设？
   - 建议：实现一个简单的预设系统，用户可以保存和加载属性配置

## Testing Strategy

### 单元测试
- 节点组件测试
- 属性配置组件测试
- 类型定义测试

### 集成测试
- BPMN 导入/导出测试
- 属性面板交互测试
- 验证规则测试

### 端到端测试
- 完整流程创建和导出
- 与 Flowable 引擎集成测试

### 测试数据
- 使用 Flowable 官方示例 BPMN 文件
- 创建覆盖所有节点类型的测试用例
