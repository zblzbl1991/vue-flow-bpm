## ADDED Requirements

### Requirement: Vue Flow JSON 到 BPMN 2.0 XML 转换

系统 SHALL 将 vue-flow 的节点和连接数据转换为符合 BPMN 2.0 规范的 XML 格式。

#### Scenario: 转换简单流程
- **GIVEN** 一个包含开始事件、用户任务、结束事件的流程
- **WHEN** 用户点击导出按钮
- **THEN** 生成符合 BPMN 2.0 规范的 XML
- **AND** XML 包含正确的命名空间声明
- **AND** 每个节点被转换为对应的 BPMN 元素

#### Scenario: 转换包含网关的流程
- **GIVEN** 一个包含排他网关和多个分支的流程
- **WHEN** 用户点击导出按钮
- **THEN** 生成的 XML 包含正确的网关定义
- **AND** 每条序列流包含条件表达式（如果有配置）

#### Scenario: 转换失败处理
- **WHEN** 转换过程遇到错误（如无效数据）
- **THEN** 显示清晰的错误消息
- **AND** 指出错误发生的位置和原因

### Requirement: BPMN 元素类型映射

转换器 SHALL 正确映射 vue-flow 节点类型到 BPMN 元素类型。

#### Scenario: 开始事件映射
- **WHEN** 转换类型为 `startEvent` 的节点
- **THEN** 生成 `<bpmn:startEvent>` 元素
- **AND** 节点的 label 映射到 `name` 属性

#### Scenario: 用户任务映射
- **WHEN** 转换类型为 `userTask` 的节点
- **THEN** 生成 `<bpmn:userTask>` 元素
- **AND** `assignee` 数据映射到 `camunda:assignee` 扩展属性

#### Scenario: 服务任务映射
- **WHEN** 转换类型为 `serviceTask` 的节点
- **THEN** 生成 `<bpmn:serviceTask>` 元素
- **AND** `async` 数据映射到 `camunda:async` 扩展属性

#### Scenario: 排他网关映射
- **WHEN** 转换类型为 `exclusiveGateway` 的节点
- **THEN** 生成 `<bpmn:exclusiveGateway>` 元素

#### Scenario: 并行网关映射
- **WHEN** 转换类型为 `parallelGateway` 的节点
- **THEN** 生成 `<bpmn:parallelGateway>` 元素

### Requirement: 序列流转换

转换器 SHALL 将 vue-flow 的边（edges）转换为 BPMN 序列流元素。

#### Scenario: 基本序列流
- **WHEN** 转换一条普通的连接边
- **THEN** 生成 `<bpmn:sequenceFlow>` 元素
- **AND** `sourceRef` 属性指向源节点 ID
- **AND** `targetRef` 属性指向目标节点 ID

#### Scenario: 条件序列流
- **WHEN** 转换一条带有条件表达式的边
- **THEN** 生成的 `<bpmn:sequenceFlow>` 包含条件表达式
- **AND** 表达式包裹在 `<bpmn:conditionExpression>` 元素中

#### Scenario: 网关默认流
- **WHEN** 转换一条网关的默认流出边
- **THEN** 生成带有 `default` 属性的网关元素
- **AND** 对应的序列流不包含条件表达式

### Requirement: BPMN 命名空间处理

转换器 SHALL 生成包含正确命名空间声明的 BPMN XML。

#### Scenario: 标准命名空间
- **WHEN** 生成 BPMN XML
- **THEN** 根元素包含 BPMN 2.0 命名空间：`http://www.omg.org/spec/BPMN/20100524/MODEL`
- **AND** 包含 BPMN DI 命名空间：`http://www.omg.org/spec/BPMN/20100524/DI`
- **AND** 包含 DC 命名空间：`http://www.omg.org/spec/DD/20100524/DC`
- **AND** 包含 DI 命名空间：`http://www.omg.org/spec/DD/20100524/DI`

#### Scenario: Flowable 扩展命名空间
- **WHEN** 生成的 XML 包含 Flowable 特有属性（如 assignee）
- **THEN** 包含 Flowable 扩展命名空间声明

### Requirement: 流程 ID 和版本管理

转换器 SHALL 支持为生成的 BPMN 流程分配可配置的 ID 和版本信息。

#### Scenario: 自动生成流程 ID
- **WHEN** 用户未指定流程 ID
- **THEN** 转换器自动生成唯一的流程 ID（如 `process-<timestamp>`）

#### Scenario: 使用自定义流程 ID
- **WHEN** 用户在属性面板中设置了流程 ID
- **THEN** 生成的 XML 使用用户指定的 ID

#### Scenario: 流程版本信息
- **WHEN** 生成的 XML
- **THEN** 包含流程的版本信息（默认为 1）

### Requirement: 导出格式化

转换器 SHALL 生成格式化良好、易于阅读的 BPMN XML。

#### Scenario: XML 缩进
- **WHEN** 生成 BPMN XML
- **THEN** 使用 2 空格缩进
- **AND** 每个元素独占一行

#### Scenario: XML 编码
- **WHEN** 生成 BPMN XML
- **THEN** XML 声明包含 `encoding="UTF-8"`

### Requirement: ID 唯一性保证

转换器 SHALL 确保 BPMN XML 中所有元素的 ID 都是唯一的。

#### Scenario: 节点 ID 转换
- **WHEN** 转换 vue-flow 节点
- **THEN** 为每个 BPMN 元素生成唯一 ID
- **AND** ID 格式为 `bpmn-<原始节点ID>`

#### Scenario: 边 ID 转换
- **WHEN** 转换 vue-flow 边
- **THEN** 为每个序列流生成唯一 ID
- **AND** ID 格式为 `flow-<原始边ID>`

#### Scenario: ID 冲突处理
- **WHEN** 检测到潜在的 ID 冲突
- **THEN** 自动添加后缀确保唯一性
- **AND** 记录冲突解决日志

### Requirement: 转换日志和调试

转换器 SHALL 提供详细的转换日志以支持调试。

#### Scenario: 成功转换日志
- **WHEN** 转换成功完成
- **THEN** 输出转换摘要（节点数、序列流数、生成时间）

#### Scenario: 转换错误日志
- **WHEN** 转换过程中发生错误
- **THEN** 输出详细的错误堆栈
- **AND** 标识导致错误的具体节点或边

#### Scenario: 调试模式
- **WHEN** 调试模式开启
- **THEN** 输出每个元素的转换详情
- **AND** 包含源数据和生成 XML 的对照
