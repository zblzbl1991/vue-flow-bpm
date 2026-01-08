# Implementation Tasks: 添加全面的 BPMN 节点支持和增强属性面板

## 1. 类型定义扩展
- [ ] 1.1 扩展 `BpmnElementType` 类型，添加新的节点类型
  - [ ] 1.1.1 添加中间事件类型（timer, message, signal）
  - [ ] 1.1.2 添加边界事件类型（error, timer, message, signal）
  - [ ] 1.1.3 添加任务类型（scriptTask, businessRuleTask, manualTask, receiveTask, sendTask）
  - [ ] 1.1.4 添加网关类型（inclusiveGateway, eventGateway）
  - [ ] 1.1.5 添加其他类型（callActivity, eventSubProcess）

- [ ] 1.2 扩展 `BpmnNodeData` 接口，添加新属性
  - [ ] 1.2.1 添加异步配置属性（asyncBefore, asyncAfter, async）
  - [ ] 1.2.2 添加跳过表达式属性（skipExpression）
  - [ ] 1.2.3 添加脚本任务属性（scriptFormat, script）
  - [ ] 1.2.4 添加业务规则任务属性（ruleVariablesInput, rules, resultVariable）
  - [ ] 1.2.5 添加调用活动属性（calledElement, inheritVariables）
  - [ ] 1.2.6 添加事件配置属性（timerType, timerExpression, messageRef, signalRef, errorCode）

- [ ] 1.3 扩展 `BpmnEdgeData` 接口，添加序列流属性
  - [ ] 1.3.1 添加条件类型属性（conditionType, conditionScriptFormat, conditionScript）
  - [ ] 1.3.2 添加跳过表达式属性（skipExpression）

- [ ] 1.4 更新 `BPMN_ELEMENT_CONFIGS`，添加新节点类型的配置
  - [ ] 1.4.1 定义每个新节点类型的默认大小、图标、描述
  - [ ] 1.4.2 添加节点类型的分类（事件、任务、网关、其他）

## 2. 节点组件实现
- [ ] 2.1 实现中间事件组件
  - [ ] 2.1.1 创建 `IntermediateTimerEvent.vue`
  - [ ] 2.1.2 创建 `IntermediateMessageEvent.vue`
  - [ ] 2.1.3 创建 `IntermediateSignalEvent.vue`

- [ ] 2.2 实现边界事件组件
  - [ ] 2.2.1 创建 `BoundaryErrorEvent.vue`
  - [ ] 2.2.2 创建 `BoundaryTimerEvent.vue`
  - [ ] 2.2.3 创建 `BoundaryMessageEvent.vue`
  - [ ] 2.2.4 创建 `BoundarySignalEvent.vue`

- [ ] 2.3 实现新任务组件
  - [ ] 2.3.1 创建 `ScriptTask.vue`
  - [ ] 2.3.2 创建 `BusinessRuleTask.vue`
  - [ ] 2.3.3 创建 `ManualTask.vue`
  - [ ] 2.3.4 创建 `ReceiveTask.vue`
  - [ ] 2.3.5 创建 `SendTask.vue`

- [ ] 2.4 实现新网关组件
  - [ ] 2.4.1 创建 `InclusiveGateway.vue`
  - [ ] 2.4.2 创建 `EventGateway.vue`

- [ ] 2.5 实现其他组件
  - [ ] 2.5.1 创建 `CallActivity.vue`
  - [ ] 2.5.2 创建 `EventSubProcess.vue`

- [ ] 2.6 更新 `BpmnEditor.vue`，注册新节点类型
  - [ ] 2.6.1 在 `nodeTypes` 对象中添加新节点类型
  - [ ] 2.6.2 更新 `markRaw` 包装

## 3. 属性面板增强
- [ ] 3.1 重构 `PropertyPanel.vue`，改进标签页和分组结构
  - [ ] 3.1.1 重新设计标签页结构（Basic、Execution、Form、IO、Advanced）
  - [ ] 3.1.2 添加可折叠的属性分组
  - [ ] 3.1.3 改进属性验证和错误提示 UI

- [ ] 3.2 创建通用属性配置组件
  - [ ] 3.2.1 创建 `AsyncConfig.vue`（异步配置）
  - [ ] 3.2.2 创建 `SkipConfig.vue`（跳过表达式）
  - [ ] 3.2.3 创建 `PriorityConfig.vue`（优先级和到期日期）
  - [ ] 3.2.4 创建 `CandidateConfig.vue`（候选用户/组）

- [ ] 3.3 创建脚本任务属性组件
  - [ ] 3.3.1 创建 `ScriptTaskProperties.vue`
  - [ ] 3.3.2 支持脚本格式选择和脚本编辑

- [ ] 3.4 创建业务规则任务属性组件
  - [ ] 3.4.1 创建 `BusinessRuleTaskProperties.vue`
  - [ ] 3.4.2 支持规则变量输入和规则引用

- [ ] 3.5 创建调用活动属性组件
  - [ ] 3.5.1 创建 `CallActivityProperties.vue`
  - [ ] 3.5.2 支持调用元素配置和变量继承

- [ ] 3.6 增强事件属性配置
  - [ ] 3.6.1 更新 `EventProperties.vue`，支持所有事件类型
  - [ ] 3.6.2 添加定时器配置 UI（duration、date、cycle）
  - [ ] 3.6.3 添加消息/信号引用配置
  - [ ] 3.6.4 添加错误代码配置

- [ ] 3.7 增强序列流属性配置
  - [ ] 3.7.1 更新 `SequenceFlowProperties.vue`
  - [ ] 3.7.2 支持条件表达式和条件脚本

- [ ] 3.8 更新现有属性组件
  - [ ] 3.8.1 更新 `CommonProperties.vue`，添加异步配置选项
  - [ ] 3.8.2 更新 `UserTaskProperties.vue`，添加优先级和到期日期
  - [ ] 3.8.3 更新 `ServiceTaskProperties.vue`，添加跳过表达式

## 4. BPMN 导入/导出更新
- [ ] 4.1 更新 `bpmn-importer.ts`，支持新节点类型的导入
  - [ ] 4.1.1 添加中间事件导入逻辑
  - [ ] 4.1.2 添加边界事件导入逻辑
  - [ ] 4.1.3 添加新任务类型导入逻辑
  - [ ] 4.1.4 添加新网关类型导入逻辑
  - [ ] 4.1.5 添加调用活动导入逻辑
  - [ ] 4.1.6 添加事件子流程导入逻辑

- [ ] 4.2 更新 `bpmn-converter.ts`，支持新节点类型的导出
  - [ ] 4.2.1 添加中间事件导出逻辑
  - [ ] 4.2.2 添加边界事件导出逻辑
  - [ ] 4.2.3 添加新任务类型导出逻辑
  - [ ] 4.2.4 添加新网关类型导出逻辑
  - [ ] 4.2.5 添加调用活动导出逻辑
  - [ ] 4.2.6 添加事件子流程导出逻辑

- [ ] 4.3 扩展 BPMN 导入，支持 Flowable 扩展属性
  - [ ] 4.3.1 添加异步属性导入（async, asyncBefore, asyncAfter）
  - [ ] 4.3.2 添加跳过表达式导入
  - [ ] 4.3.3 添加脚本任务属性导入
  - [ ] 4.3.4 添加业务规则任务属性导入
  - [ ] 4.3.5 添加调用活动属性导入
  - [ ] 4.3.6 添加事件扩展属性导入
  - [ ] 4.3.7 添加序列流条件类型导入

- [ ] 4.4 扩展 BPMN 导出，支持 Flowable 扩展属性
  - [ ] 4.4.1 添加异步属性导出
  - [ ] 4.4.2 添加跳过表达式导出
  - [ ] 4.4.3 添加脚本任务属性导出
  - [ ] 4.4.4 添加业务规则任务属性导出
  - [ ] 4.4.5 添加调用活动属性导出
  - [ ] 4.4.6 添加事件扩展属性导出
  - [ ] 4.4.7 添加序列流条件类型导出

## 5. 编辑器功能更新
- [ ] 5.1 更新 `ControlPanel.vue`，添加新节点类型
  - [ ] 5.1.1 在工具面板中添加新节点类型按钮
  - [ ] 5.1.2 改进节点类型分组（事件、任务、网关、其他）
  - [ ] 5.1.3 添加节点类型搜索功能

- [ ] 5.2 更新 `useBpmnEditor.ts`，支持新节点类型
  - [ ] 5.2.1 更新 `addNode` 函数，处理新节点类型
  - [ ] 5.2.2 添加节点类型验证逻辑
  - [ ] 5.2.3 改进节点连接验证规则

- [ ] 5.3 更新 `useBpmnValidator.ts`，添加新节点类型验证
  - [ ] 5.3.1 添加中间事件验证规则
  - [ ] 5.3.2 添加边界事件验证规则
  - [ ] 5.3.3 添加新任务类型验证规则
  - [ ] 5.3.4 添加新网关类型验证规则
  - [ ] 5.3.5 添加调用活动验证规则

## 6. 测试
- [ ] 6.1 添加节点组件单元测试
  - [ ] 6.1.1 测试中间事件组件
  - [ ] 6.1.2 测试边界事件组件
  - [ ] 6.1.3 测试新任务组件
  - [ ] 6.1.4 测试新网关组件

- [ ] 6.2 添加属性面板组件测试
  - [ ] 6.2.1 测试新增属性配置组件
  - [ ] 6.2.2 测试属性验证逻辑
  - [ ] 6.2.3 测试属性更新和持久化

- [ ] 6.3 添加 BPMN 导入/导出集成测试
  - [ ] 6.3.1 测试新节点类型导入
  - [ ] 6.3.2 测试新节点类型导出
  - [ ] 6.3.3 测试 Flowable 扩展属性导入/导出
  - [ ] 6.3.4 测试往返转换（导入→导出→导入）

- [ ] 6.4 添加端到端测试
  - [ ] 6.4.1 测试完整流程创建（使用新节点类型）
  - [ ] 6.4.2 测试属性配置和验证
  - [ ] 6.4.3 测试 BPMN 文件导出和 Flowable 兼容性

## 7. 文档
- [ ] 7.1 更新用户文档
  - [ ] 7.1.1 添加新节点类型使用说明
  - [ ] 7.1.2 添加属性面板使用指南
  - [ ] 7.1.3 添加 Flowable 扩展属性说明

- [ ] 7.2 更新开发者文档
  - [ ] 7.2.1 更新类型定义文档
  - [ ] 7.2.2 添加新组件使用说明
  - [ ] 7.2.3 添加扩展指南

## 8. 优化和发布
- [ ] 8.1 性能优化
  - [ ] 8.1.1 优化属性面板渲染性能
  - [ ] 8.1.2 优化大型流程图加载性能

- [ ] 8.2 UI/UX 优化
  - [ ] 8.2.1 改进属性面板视觉设计
  - [ ] 8.2.2 添加工具提示和帮助文本
  - [ ] 8.2.3 添加属性配置预设和模板

- [ ] 8.3 发布准备
  - [ ] 8.3.1 创建迁移指南（如果需要）
  - [ ] 8.3.2 准备发布说明
  - [ ] 8.3.3 创建示例流程和演示
