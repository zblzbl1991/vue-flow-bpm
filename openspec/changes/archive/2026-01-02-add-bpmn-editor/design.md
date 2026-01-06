## Context

这是一个全新的 BPMN 工作流编辑器项目，需要实现：
1. 基于 vue-flow 的可视化拖拽编辑器
2. 自定义节点类型映射到 BPMN 元素
3. JSON 到 BPMN 2.0 XML 的格式转换
4. 使用 bpmn-js 进行预览验证

技术栈：Vue 3 + TypeScript

## Goals / Non-Goals

**Goals:**
- 提供直观的可视化工作流编辑界面
- 支持常用 BPMN 元素的绘制
- 生成符合 BPMN 2.0 规范的 XML
- 通过 bpmn-js 验证 XML 正确性

**Non-Goals:**
- 支持完整 BPMN 2.0 规范的所有元素
- 实时验证（仅在用户请求时验证）
- 流程执行引擎集成
- 流程仿真功能

## Decisions

### Decision 1: 使用 vue-flow 作为编辑器基础

**原因：**
- 原生 Vue 3 支持，与项目技术栈一致
- 提供完整的拖拽、连接、缩放等交互功能
- 高度可定制的节点和边
- 活跃的社区维护

**Alternatives considered:**
- bpmn-js 作为编辑器：功能完整但与 React 绑定紧密，Vue 集成复杂
- JointJS：商业许可限制，学习曲线陡峭
- G6：主要面向数据可视化，BPMN 支持需要大量定制

### Decision 2: 自定义节点类型映射 BPMN 元素

**原因：**
- vue-flow 的自定义节点可以完全控制渲染
- 可以在节点上添加 BPMN 特有的视觉标识
- 便于存储额外的 BPMN 属性（如任务类型、网关条件）

**映射设计：**
```
vue-flow node.type -> BPMN element
- 'startEvent' -> bpmn:startEvent
- 'endEvent' -> bpmn:endEvent
- 'userTask' -> bpmn:userTask
- 'serviceTask' -> bpmn:serviceTask
- 'exclusiveGateway' -> bpmn:exclusiveGateway
- 'parallelGateway' -> bpmn:parallelGateway
```

### Decision 3: 基于 xmlbuilder2 生成 BPMN XML

**原因：**
- 类型安全的 XML 构建器
- 支持命名空间处理（BPMN 2.0 需要）
- 比 DOM API 更轻量

**Alternatives considered:**
- js2xmlparser：功能较简单，命名空间支持有限
- xml2js：主要用于解析，生成 XML 不够直观
- 手动拼接字符串：容易出错，无类型安全

### Decision 4: bpmn-js 仅用于预览验证

**原因：**
- 预览模式按需加载，减少初始化开销
- 用户明确意图后才进行验证
- 可以清晰地展示验证结果

**集成方式：**
- 使用 bpmn-js 的 Viewer 模式（只读）
- 在模态框或侧边栏中展示
- 验证失败时高亮错误位置

## Data Model

### Vue Flow Node Structure

```typescript
interface BpmnNode extends Node {
  id: string;
  type: 'startEvent' | 'endEvent' | 'userTask' | 'serviceTask' | 'exclusiveGateway' | 'parallelGateway';
  data: {
    label: string;
    // BPMN 特定属性
    assignee?: string;  // 用户任务
    async?: boolean;    // 服务任务
    default?: string;   // 网关默认流
  };
}
```

### Vue Flow Edge Structure

```typescript
interface BpmnEdge extends Edge {
  id: string;
  source: string;
  target: string;
  data: {
    condition?: string;  // 网关条件表达式
  };
}
```

### BPMN Process Structure (XML Output)

```xml
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="process-1">
    <startEvent id="start-1" name="Start"/>
    <userTask id="task-1" name="User Task"/>
    <sequenceFlow id="flow-1" sourceRef="start-1" targetRef="task-1"/>
    ...
  </process>
</definitions>
```

## Architecture

```
src/
├── components/
│   ├── BpmnEditor/
│   │   ├── BpmnEditor.vue        # 主编辑器组件
│   │   ├── BpmnNode.vue          # 通用 BPMN 节点组件
│   │   ├── ControlPanel.vue      # 工具面板（节点拖拽源）
│   │   └── PreviewModal.vue      # bpmn-js 预览模态框
│   └── nodes/
│       ├── StartEvent.vue
│       ├── EndEvent.vue
│       ├── UserTask.vue
│       ├── ServiceTask.vue
│       └── Gateway.vue
├── composables/
│   ├── useBpmnEditor.ts          # 编辑器状态管理
│   └── useBpmnConverter.ts       # JSON 转 XML
├── utils/
│   ├── bpmn-converter.ts         # 转换逻辑
│   ├── bpmn-validator.ts         # 验证逻辑
│   └── bpmn-types.ts             # 类型定义
└── types/
    └── bpmn.ts                   # BPMN 类型定义
```

## Risks / Trade-offs

### Risk 1: BPMN 命名空间复杂性

BPMN 2.0 XML 需要正确的命名空间声明，错误会导致 Flowable 解析失败。

**Mitigation:**
- 使用 xmlbuilder2 处理命名空间
- 建立完整的测试用例覆盖
- 使用 bpmn-js 验证作为最终检查

### Risk 2: ID 管理冲突

vue-flow 生成的 ID 与 BPMN 要求的 ID 格式可能不一致。

**Mitigation:**
- 在转换时统一使用 `bpmn-` 前缀
- 保证 ID 在整个流程中的唯一性
- 支持用户自定义 ID

### Trade-off: 简化 vs 完整性

当前方案支持常用子集，但无法满足复杂场景（如子流程、事件子流程）。

**Decision:**
- 优先实现常用场景
- 预留扩展接口，便于后续添加更多元素类型

## Migration Plan

新功能，无需迁移。

## Open Questions

1. 是否需要支持流程图导入（从 BPMN XML 导入到编辑器）？
2. 是否需要支持连接线的样式定制（如条件线用虚线）？
3. 用户任务的属性编辑是否需要表单配置？
