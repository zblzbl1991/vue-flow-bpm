# Design: Enhanced BPMN Editor Properties System

## Architecture Overview

本设计采用模块化的属性编辑系统，将不同类型元素的属性配置分离到独立的子组件中，便于维护和扩展。

### Component Structure

```
BpmnEditor.vue
├── ControlPanel.vue (工具面板)
├── PropertyPanel.vue (重构 - 属性面板容器)
│   ├── ProcessProperties.vue (流程属性)
│   ├── CommonProperties.vue (通用属性)
│   ├── UserTaskProperties.vue (用户任务属性)
│   ├── ServiceTaskProperties.vue (服务任务属性)
│   ├── GatewayProperties.vue (网关属性)
│   ├── SequenceFlowProperties.vue (序列流属性)
│   ├── EventProperties.vue (事件属性)
│   ├── ListenerConfig.vue (监听器配置)
│   ├── FormPropertiesConfig.vue (表单属性配置)
│   └── MultiInstanceConfig.vue (多实例配置)
├── ContextMenu.vue (新增 - 右键菜单)
└── KeyboardShortcuts.ts (新增 - 快捷键处理)
```

### Data Flow

```
User Input → Property Sub-component → PropertyPanel (emit events)
                                                   ↓
                                            BpmnEditor.vue
                                                   ↓
                                          useBpmnEditor (state)
                                                   ↓
                                            bpmn-converter.ts
                                                   ↓
                                          BPMN 2.0 XML Output
```

## Key Design Decisions

### 1. 属性面板分层设计

**决策**：将属性面板拆分为多个子组件，按元素类型组织

**理由**：
- 单一职责原则：每个组件只负责一类元素的属性
- 可维护性：修改某个元素的属性不影响其他元素
- 可扩展性：添加新元素类型时只需添加新组件

**实现**：
```typescript
// PropertyPanel.vue 使用动态组件
<component :is="getPropertyComponent(selectedElement.type)"
           :data="selectedElement.data"
           @update="onUpdateProperty" />
```

### 2. Flowable 扩展属性命名空间

**决策**：使用 `flowable:` 命名空间前缀（而非当前的 `camunda:`）

**理由**：
- 项目目标是 Flowable 兼容
- Flowable 使用自己的命名空间 `http://flowable.org/bpmn`
- 虽然 Flowable 也支持部分 Camunda 属性，但使用原生命名空间更可靠

**影响**：
```xml
<!-- 当前 -->
<userTask id="task1" camunda:assignee="${userId}" />

<!-- 修改后 -->
<userTask id="task1" flowable:assignee="${userId}" />
```

### 3. 监听器配置结构

**决策**：监听器作为数组存储在元素的 data 中

**数据结构**：
```typescript
interface Listener {
  id: string
  event: string // 'start' | 'end' | 'take' | 'create' | 'complete' | ...
  type: 'class' | 'expression' | 'delegateExpression'
  value: string
  fields?: ListenerField[]
}

interface ListenerField {
  name: string
  value: string
  stringValue?: string
  expression?: string
}
```

### 4. 表单属性配置结构

**决策**：表单属性使用独立数组，支持嵌套枚举值

**数据结构**：
```typescript
interface FormProperty {
  id: string
  name: string
  type: 'string' | 'long' | 'double' | 'boolean' | 'date' | 'enum'
  required: boolean
  readable: boolean
  writable: boolean
  defaultValue?: string
  values?: Array<{ id: string; name: string }>
}
```

### 5. 多实例配置结构

**决策**：多实例配置作为嵌套对象存储

**数据结构**：
```typescript
interface MultiInstanceConfig {
  isSequential: boolean
  collection?: string // 变量名
  elementVariable?: string
  completionCondition?: string
  cardinality?: string
}

// 在元素 data 中
data: {
  ...
  multiInstance?: MultiInstanceConfig
}
```

### 6. 删除功能实现策略

**决策**：提供三种删除方式的统一实现

**实现**：
1. 键盘快捷键（Delete/Backspace）
2. 属性面板删除按钮
3. 右键菜单删除选项

所有删除操作都通过 `useBpmnEditor.deleteNode()` / `deleteEdge()` 进行，确保状态一致性。

### 7. ID 可编辑性

**决策**：允许用户编辑元素 ID，但需要验证

**规则**：
- ID 必须唯一
- ID 必须符合 XML NCName 规则（字母或下划线开头，只包含字母、数字、下划线、连字符）
- 修改 ID 时需要同步更新相关的序列流引用

## Implementation Considerations

### 扩展的 BpmnNodeData 接口

```typescript
export interface BpmnNodeData {
  // 通用属性
  id?: string // 用户可编辑的 BPMN ID
  label: string
  width?: number
  height?: number
  documentation?: string

  // 流程属性（仅用于流程定义）
  processName?: string
  processVersion?: string
  executable?: boolean
  candidateStarterGroups?: string[]

  // 任务属性
  assignee?: string
  candidateUsers?: string[]
  candidateGroups?: string[]
  priority?: string
  dueDate?: string
  formKey?: string
  skipExpression?: string

  // 异步配置
  asyncBefore?: boolean
  asyncAfter?: boolean
  async?: boolean // 简写，等同于 asyncBefore

  // 服务任务属性
  expression?: string
  delegateExpression?: string
  class?: string
  triggerable?: boolean

  // 网关属性
  defaultFlow?: string // 默认流的 ID

  // 扩展配置
  listeners?: Listener[]
  formProperties?: FormProperty[]
  multiInstance?: MultiInstanceConfig
  inputParameters?: Parameter[]
  outputParameters?: Parameter[]
}
```

### XML 转换扩展

```typescript
// 新的转换函数
function convertListenerToXml(listener: Listener): any { ... }
function convertFormPropertiesToXml(props: FormProperty[]): any { ... }
function convertMultiInstanceToXml(config: MultiInstanceConfig): any { ... }
function convertParametersToXml(params: Parameter[]): any { ... }
```

## Trade-offs

### 1. 复杂性 vs 功能完整性

**选择**：优先功能完整性

**理由**：
- Flowable 工作流通常需要复杂的配置
- 分层设计控制了复杂度
- 用户可以逐步使用高级功能

### 2. 性能 vs 实时性

**选择**：属性变更实时保存到状态

**理由**：
- 编辑器状态在内存中，性能影响小
- 实时保存提供更好的用户体验
- 无需额外的"保存"按钮

### 3. 向后兼容

**选择**：保持现有数据结构，扩展而非替换

**理由**：
- 现有的 JSON 格式继续支持
- 新增属性使用可选字段
- 已有的流程不会破坏
