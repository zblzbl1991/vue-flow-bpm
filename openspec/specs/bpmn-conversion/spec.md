# bpmn-conversion Specification

## Purpose
TBD - created by archiving change add-bpmn-editor. Update Purpose after archive.
## Requirements
### Requirement: Vue Flow JSON 到 BPMN 2.0 XML 转换

系统 SHALL 将 vue-flow 的节点和连接数据转换为符合 BPMN 2.0 规范的 XML 格式,并确保导出的 XML 可以被成功重新导入。

#### Scenario: 转换简单流程
- **GIVEN** 一个包含开始事件、用户任务、结束事件的流程
- **WHEN** 用户点击导出按钮
- **THEN** 生成符合 BPMN 2.0 规范的 XML
- **AND** XML 包含正确的命名空间声明
- **AND** 每个节点被转换为对应的 BPMN 元素
- **AND** 导出的 XML 可以被成功重新导入系统

#### Scenario: 转换包含网关的流程
- **GIVEN** 一个包含排他网关和多个分支的流程
- **WHEN** 用户点击导出按钮
- **THEN** 生成的 XML 包含正确的网关定义
- **AND** 每条序列流包含条件表达式（如果有配置）
- **AND** 网关的默认流正确标记
- **AND** 导出的 XML 可以被成功重新导入系统

#### Scenario: 转换失败处理
- **WHEN** 转换过程遇到错误（如无效数据）
- **THEN** 显示清晰的错误消息
- **AND** 指出错误发生的位置和原因

#### Scenario: 导出包含往返转换所需元数据
- **GIVEN** 一个需要往返转换的流程
- **WHEN** 生成 BPMN XML
- **THEN** XML 包含足够的信息用于重建 vue-flow 结构
- **AND** BPMN DI 信息包含节点位置和大小
- **AND** 自定义属性和扩展属性被正确导出
- **AND** 确保重新导入时可以恢复原始结构

### Requirement: BPMN 元素类型映射

转换器 SHALL 正确映射 vue-flow 节点类型到 BPMN 元素类型,并支持反向映射。

#### Scenario: 开始事件映射
- **WHEN** 转换类型为 `startEvent` 的节点
- **THEN** 生成 `<bpmn:startEvent>` 元素
- **AND** 节点的 label 映射到 `name` 属性
- **AND** 反向映射时能正确识别 `<bpmn:startEvent>` 并转换为 `startEvent` 节点

#### Scenario: 用户任务映射
- **WHEN** 转换类型为 `userTask` 的节点
- **THEN** 生成 `<bpmn:userTask>` 元素
- **AND** `assignee` 数据映射到 `flowable:assignee` 扩展属性
- **AND** 反向映射时能正确解析 `flowable:assignee` 并恢复到 `data.assignee`

#### Scenario: 服务任务映射
- **WHEN** 转换类型为 `serviceTask` 的节点
- **THEN** 生成 `<bpmn:serviceTask>` 元素
- **AND** `async` 数据映射到 `flowable:async` 扩展属性
- **AND** 反向映射时能正确解析 `flowable:async` 并恢复到 `data.async`

#### Scenario: 排他网关映射
- **WHEN** 转换类型为 `exclusiveGateway` 的节点
- **THEN** 生成 `<bpmn:exclusiveGateway>` 元素
- **AND** 反向映射时能正确识别 `<bpmn:exclusiveGateway>`

#### Scenario: 并行网关映射
- **WHEN** 转换类型为 `parallelGateway` 的节点
- **THEN** 生成 `<bpmn:parallelGateway>` 元素
- **AND** 反向映射时能正确识别 `<bpmn:parallelGateway>`

### Requirement: 序列流转换

转换器 SHALL 将 vue-flow 的边（edges）转换为 BPMN 序列流元素,并支持反向转换。

#### Scenario: 基本序列流
- **WHEN** 转换一条普通的连接边
- **THEN** 生成 `<bpmn:sequenceFlow>` 元素
- **AND** `sourceRef` 属性指向源节点 ID
- **AND** `targetRef` 属性指向目标节点 ID
- **AND** 反向转换时能正确重建边连接

#### Scenario: 条件序列流
- **WHEN** 转换一条带有条件表达式的边
- **THEN** 生成的 `<bpmn:sequenceFlow>` 包含条件表达式
- **AND** 表达式包裹在 `<bpmn:conditionExpression>` 元素中
- **AND** 反向转换时能正确解析条件表达式到 `data.condition`

#### Scenario: 网关默认流
- **WHEN** 转换一条网关的默认流出边
- **THEN** 生成带有 `default` 属性的网关元素
- **AND** 对应的序列流不包含条件表达式
- **AND** 反向转换时能正确识别默认流并恢复到 `data.defaultFlow`

### Requirement: BPMN 命名空间处理

转换器 SHALL 生成包含正确命名空间声明的 BPMN XML,并能解析不同命名空间的 XML。

#### Scenario: 标准命名空间
- **WHEN** 生成 BPMN XML
- **THEN** 根元素包含 BPMN 2.0 命名空间：`http://www.omg.org/spec/BPMN/20100524/MODEL`
- **AND** 包含 BPMN DI 命名空间：`http://www.omg.org/spec/BPMN/20100524/DI`
- **AND** 包含 DC 命名空间：`http://www.omg.org/spec/DD/20100524/DC`
- **AND** 包含 DI 命名空间：`http://www.omg.org/spec/DD/20100524/DI`

#### Scenario: Flowable 扩展命名空间
- **WHEN** 生成的 XML 包含 Flowable 特有属性（如 assignee）
- **THEN** 包含 Flowable 扩展命名空间声明
- **AND** 反向转换时能正确识别 Flowable 命名空间

#### Scenario: Camunda 扩展命名空间兼容性
- **GIVEN** 包含 Camunda 扩展命名空间的 BPMN XML
- **WHEN** 导入该 XML
- **THEN** 系统能正确解析 Camunda 扩展属性
- **AND** 属性被映射到相应的数据字段

### Requirement: 流程 ID 和版本管理

转换器 SHALL 支持为生成的 BPMN 流程分配可配置的 ID 和版本信息,并在导入时保留这些信息。

#### Scenario: 自动生成流程 ID
- **WHEN** 用户未指定流程 ID
- **THEN** 转换器自动生成唯一的流程 ID（如 `process-<timestamp>`）
- **AND** 反向转换时保留流程 ID

#### Scenario: 使用自定义流程 ID
- **WHEN** 用户在属性面板中设置了流程 ID
- **THEN** 生成的 XML 使用用户指定的 ID
- **AND** 反向转换时恢复自定义流程 ID

#### Scenario: 流程版本信息
- **WHEN** 生成的 XML
- **THEN** 包含流程的版本信息（默认为 1）
- **AND** 反向转换时保留版本信息

### Requirement: 导出格式化

转换器 SHALL 生成格式化良好、易于阅读的 BPMN XML。

#### Scenario: XML 缩进
- **WHEN** 生成 BPMN XML
- **THEN** 使用 2 空格缩进
- **AND** 每个元素独占一行

#### Scenario: XML 编码
- **WHEN** 生成 BPMN XML
- **THEN** XML 声明包含 `encoding="UTF-8"`

#### Scenario: XML 可解析性
- **GIVEN** 生成的 BPMN XML
- **WHEN** 使用标准 XML 解析器解析
- **THEN** XML 格式正确,无语法错误
- **AND** 可以被成功重新导入系统

### Requirement: ID 唯一性保证

转换器 SHALL 确保 BPMN XML 中所有元素的 ID 都是唯一的,并在导入时处理 ID 冲突。

#### Scenario: 节点 ID 转换
- **WHEN** 转换 vue-flow 节点
- **THEN** 为每个 BPMN 元素生成唯一 ID
- **AND** ID 格式为 `bpmn-<原始节点ID>`
- **AND** 反向转换时能恢复原始节点 ID

#### Scenario: 边 ID 转换
- **WHEN** 转换 vue-flow 边
- **THEN** 为每个序列流生成唯一 ID
- **AND** ID 格式为 `flow-<原始边ID>`
- **AND** 反向转换时能恢复原始边 ID

#### Scenario: ID 冲突处理
- **WHEN** 检测到潜在的 ID 冲突
- **THEN** 自动添加后缀确保唯一性
- **AND** 记录冲突解决日志
- **AND** 反向转换时能正确处理生成的 ID

### Requirement: 转换日志和调试

转换器 SHALL 提供详细的转换日志以支持调试,并为双向转换提供追踪信息。

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

#### Scenario: 往返转换追踪
- **WHEN** 执行往返转换（JSON → XML → JSON）
- **THEN** 记录转换过程中的变更
- **AND** 标识丢失或变更的属性
- **AND** 提供差异报告用于调试

### Requirement: BPMN 2.0 XML 到 Vue Flow JSON 转换

转换器 SHALL 支持将符合 BPMN 2.0 规范的 XML 转换回 vue-flow 的节点和连接数据格式,实现双向转换。

#### Scenario: 导入并验证往返转换
- **GIVEN** 一个从 vue-flow 导出的 BPMN XML 文件
- **WHEN** 该 XML 文件被重新导入到系统
- **THEN** 系统将 XML 转换回 vue-flow JSON 格式
- **AND** 转换后的数据结构与原始数据在功能上等价
- **AND** 节点类型、连接关系和关键属性保持一致

#### Scenario: 导入第三方 BPMN 工具生成的 XML
- **GIVEN** 一个由第三方 BPMN 工具（如 Camunda Modeler、Flowable Designer）生成的 BPMN XML 文件
- **WHEN** 该文件被导入到系统
- **THEN** 系统解析 XML 并生成对应的 vue-flow 节点和边
- **AND** 支持的元素类型被正确识别和转换
- **AND** 不支持的元素类型生成清晰的错误信息

#### Scenario: 往返转换的一致性验证
- **GIVEN** 任意 vue-flow workflow
- **WHEN** 执行 JSON → XML → JSON 的完整转换循环
- **THEN** 最终的 JSON 数据与原始 JSON 在关键方面保持一致
- **AND** 节点类型、连接关系、业务属性（assignee、条件等）不变
- **AND** 允许 ID、位置、格式等次要属性的差异

