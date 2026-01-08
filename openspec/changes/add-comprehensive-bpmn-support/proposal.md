# Change: 添加全面的 BPMN 节点支持和增强属性面板

## Why

当前 vue-flow-bpm 项目只实现了基础的 BPMN 节点类型（开始事件、结束事件、用户任务、服务任务、排他网关、并行网关、子流程），无法满足实际业务流程建模的需求。同时，属性面板功能有限，缺少 bpmnjs 和 flowable 中常见的属性配置功能，如：
- 执行监听器（Execution Listener）
- 任务监听器（Task Listener）
- 多实例（Multi-instance）
- 表单属性（Form Properties）
- 输入/输出参数（Input/Output Parameters）
- 高级事件配置（定时器、消息、信号、错误等）

这些功能对于将工作流部署到 Flowable 等 BPMN 引擎至关重要。

## What Changes

### 1. 扩展 BPMN 节点类型支持
添加以下缺失的 BPMN 2.0 节点类型：
- **事件类型**：
  - 中间捕获事件（Intermediate Catch Event）：定时器、消息、信号、条件
  - 中间抛出事件（Intermediate Throw Event）：信号、 escalation
  - 边界事件（Boundary Event）：错误、定时器、消息、信号、补偿、条件
- **任务类型**：
  - 脚本任务（Script Task）
  - 业务规则任务（Business Rule Task）
  - 手动任务（Manual Task）
  - 接收任务（Receive Task）
  - 发送任务（Send Task）
- **网关类型**：
  - 包容网关（Inclusive Gateway）
  - 事件网关（Event Gateway）
  - 复杂网关（Complex Gateway）
- **其他**：
  - 调用活动（Call Activity）
  - 事件子流程（Event Sub-process）
  - 事务子流程（Transaction Sub-process）
  - 池/泳道（Pool/Lane）

### 2. 增强属性面板功能
参考 bpmnjs 和 flowable 的属性面板设计，添加：
- **基础属性增强**：
  - ID 验证和自动生成
  - 名称、文档说明
  - 异步配置（async before/after）
- **任务属性**：
  - 执行监听器配置（支持 Java 类、表达式、委托表达式）
  - 任务监听器配置（支持 create、assignment、complete、delete 事件）
  - 多实例配置（串行/并行、集合变量、完成条件）
  - 表单属性配置（用于用户任务）
  - 输入/输出参数配置（用于服务任务）
  - 跳过表达式（Skip Expression）
  - 优先级、到期日期
- **网关属性**：
  - 默认流转设置
  - 条件表达式配置
- **事件属性**：
  - 定时器配置（duration、date、cycle）
  - 消息/信号引用
  - 错误代码
  - 重试配置
- **流程属性**：
  - 流程版本、可执行标志
  - 候选启动组
  - 流程监听器

### 3. 改进属性面板 UI/UX
- 添加属性分类和分组（基础、高级、执行、表单等）
- 支持折叠/展开分组
- 添加属性验证和错误提示
- 支持表达式编辑器（语法高亮、变量提示）
- 添加属性模板和预设

## Impact

- Affected specs:
  - `bpmn-editor` - 需要扩展编辑器以支持新的节点类型
  - `bpmn-conversion` - 需要更新 BPMN XML 导入/导出逻辑
  - `bpmn-validation` - 需要为新节点类型添加验证规则

- Affected code:
  - `src/types/bpmn.ts` - 扩展 BpmnElementType 和相关类型定义
  - `src/components/nodes/` - 添加新节点组件
  - `src/components/BpmnEditor/properties/` - 添加/更新属性配置组件
  - `src/components/BpmnEditor/PropertyPanel.vue` - 更新属性面板主逻辑
  - `src/components/BpmnEditor/ControlPanel.vue` - 添加新节点类型到工具面板
  - `src/utils/bpmn-importer.ts` - 更新 BPMN 导入逻辑
  - `src/utils/bpmn-converter.ts` - 更新 BPMN 导出逻辑
  - `src/composables/useBpmnEditor.ts` - 更新编辑器状态管理

- Breaking changes: None（向后兼容现有节点类型）

- Migration: 无需迁移（新增功能不影响现有数据）

## Dependencies

- 需要研究 bpmn-js 的属性面板实现作为参考
- 需要参考 Flowable 的 BPMN XML 扩展属性
- 可能需要添加表达式语言解析库（如 simple-expression-parser）

## Open Questions

1. 是否需要支持所有 BPMN 2.0 节点类型，还是优先支持最常用的子集？
2. 表达式编辑器是否需要完整的语法高亮和验证，还是简单的文本输入即可？
3. 是否需要支持流程变量的自动补全和验证？
4. 池/泳道功能是否优先级较低，可以在后续版本实现？

## Success Criteria

1. 支持至少 15 种 BPMN 节点类型（目前 7 种）
2. 属性面板支持所有 Flowable 扩展属性
3. 可以成功导入和导出包含新节点类型的 BPMN 文件
4. 生成的 BPMN 文件可以被 Flowable 引擎正确解析和执行
5. 属性面板 UI 清晰易用，参考 bpmnjs 的设计
