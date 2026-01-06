# bpmn-import Specification

## Purpose
TBD - created by archiving change add-bpmnjs-testing. Update Purpose after archive.
## Requirements
### Requirement: BPMN XML 到 Vue Flow JSON 转换

系统 SHALL 将符合 BPMN 2.0 规范的 XML 转换为 vue-flow 可用的节点和连接数据格式。

#### Scenario: 导入简单流程
- **GIVEN** 一个包含开始事件、用户任务、结束事件的 BPMN XML 文件
- **WHEN** 用户上传并导入该文件
- **THEN** 系统解析 XML 并生成对应的 vue-flow 节点和边
- **AND** 节点类型正确映射（startEvent → startEvent, userTask → userTask, 等）
- **AND** 节点之间的连接关系正确建立

#### Scenario: 导入包含网关的流程
- **GIVEN** 一个包含排他网关和多个分支的 BPMN XML 文件
- **WHEN** 用户上传并导入该文件
- **THEN** 系统生成正确的网关节点
- **AND** 每条序列流的条件表达式被正确提取并存储在边数据中

#### Scenario: 导入失败处理
- **WHEN** 导入过程遇到错误（如无效的 XML 格式、不支持的元素类型）
- **THEN** 显示清晰的错误消息
- **AND** 消息包含错误发生的位置和原因
- **AND** 不修改当前编辑器状态

### Requirement: BPMN 元素类型反向映射

导入器 SHALL 正确映射 BPMN 元素类型到 vue-flow 节点类型。

#### Scenario: 开始事件反向映射
- **WHEN** 解析 `<bpmn:startEvent>` 元素
- **THEN** 创建类型为 `startEvent` 的 vue-flow 节点
- **AND** 节点的 label 设置为 `name` 属性值

#### Scenario: 用户任务反向映射
- **WHEN** 解析 `<bpmn:userTask>` 元素
- **THEN** 创建类型为 `userTask` 的 vue-flow 节点
- **AND** `camunda:assignee` 扩展属性映射到 `data.assignee`

#### Scenario: 服务任务反向映射
- **WHEN** 解析 `<bpmn:serviceTask>` 元素
- **THEN** 创建类型为 `serviceTask` 的 vue-flow 节点
- **AND** `camunda:async` 扩展属性映射到 `data.async`

#### Scenario: 排他网关反向映射
- **WHEN** 解析 `<bpmn:exclusiveGateway>` 元素
- **THEN** 创建类型为 `exclusiveGateway` 的 vue-flow 节点

#### Scenario: 并行网关反向映射
- **WHEN** 解析 `<bpmn:parallelGateway>` 元素
- **THEN** 创建类型为 `parallelGateway` 的 vue-flow 节点

### Requirement: BPMN DI 布局信息提取

导入器 SHALL 从 BPMN DI (Diagram Interchange) 信息中提取节点位置。

#### Scenario: 提取节点位置
- **GIVEN** BPMN XML 包含 BPMN DI 信息（BPMNShape/BPMNEdge）
- **WHEN** 导入该文件
- **THEN** 节点的 position 使用 DI 中的坐标（x, y）
- **AND** 坐标正确转换为 vue-flow 的位置格式

#### Scenario: 缺少 DI 信息时的处理
- **GIVEN** BPMN XML 不包含 BPMN DI 信息
- **WHEN** 导入该文件
- **THEN** 系统使用自动布局算法为节点分配位置
- **AND** 所有节点在画布上可见且不重叠

#### Scenario: DI 边界信息提取
- **GIVEN** BPMN DI 包含元素的边界（bounds）信息
- **WHEN** 导入该文件
- **THEN** 节点的大小和位置基于 bounds 信息设置

### Requirement: 序列流条件解析

导入器 SHALL 正确解析序列流上的条件表达式。

#### Scenario: 解析条件序列流
- **WHEN** 解析带有 `<bpmn:conditionExpression>` 的序列流
- **THEN** 条件表达式存储在边的 `data.condition` 字段
- **AND** 表达式格式与导出时保持一致

#### Scenario: 解析网关默认流
- **WHEN** 解析网关的默认流出序列流
- **THEN** 标记该边为默认流
- **AND** 在网关节点的 `data.defaultFlow` 字段中记录该边 ID

### Requirement: Flowable/Camunda 扩展属性支持

导入器 SHALL 支持 Flowable 和 Camunda 引擎的扩展属性。

#### Scenario: 导入用户任务扩展属性
- **GIVEN** 用户任务包含 Flowable 扩展属性（assignee, candidateUsers, candidateGroups, priority, dueDate）
- **WHEN** 导入该文件
- **THEN** 所有扩展属性正确映射到节点数据

#### Scenario: 导入服务任务扩展属性
- **GIVEN** 服务任务包含 Flowable 扩展属性（expression, class, async）
- **WHEN** 导入该文件
- **THEN** 所有扩展属性正确映射到节点数据

#### Scenario: 导入任务监听器
- **GIVEN** 任务包含 `flowable:taskListener` 扩展元素
- **WHEN** 导入该文件
- **THEN** 监听器信息被解析并存储在节点数据中

#### Scenario: 导入多实例配置
- **GIVEN** 任务包含 `flowable:multiInstanceLoopCharacteristics` 扩展元素
- **WHEN** 导入该文件
- **THEN** 多实例配置被解析并存储在节点数据中

### Requirement: 不支持元素类型的处理

导入器 SHALL 遇到不支持的 BPMN 元素类型时提供清晰的错误信息。

#### Scenario: 检测到不支持的事件类型
- **WHEN** BPMN XML 包含不支持的事件类型（如中间事件、边界事件）
- **THEN** 导入失败并显示错误消息
- **AND** 错误消息列出不支持元素的 ID 和类型
- **AND** 建议用户移除或替换这些元素

#### Scenario: 检测到不支持的任务类型
- **WHEN** BPMN XML 包含不支持的任务类型（如接收任务、发送任务）
- **THEN** 导入失败并显示错误消息
- **AND** 错误消息指出不支持的元素

#### Scenario: 检测到子流程
- **WHEN** BPMN XML 包含子流程（subProcess）
- **THEN** 导入失败并显示错误消息
- **AND** 提示当前版本不支持子流程

### Requirement: 导入验证

导入器 SHALL 在导入后验证生成的工作流结构是否有效。

#### Scenario: 验证导入的工作流结构
- **WHEN** 导入成功完成
- **THEN** 系统运行工作流结构验证
- **AND** 检查是否有开始和结束事件
- **AND** 检查是否有孤立节点
- **AND** 检查是否有自环

#### Scenario: 导入后显示验证结果
- **GIVEN** 导入的工作流存在结构问题
- **WHEN** 导入完成
- **THEN** 显示验证警告
- **AND** 列出发现的问题
- **AND** 允许用户继续编辑或重新导入

### Requirement: 命名空间兼容性

导入器 SHALL 兼容不同命名空间的 BPMN XML（BPMN 2.0、Flowable、Camunda）。

#### Scenario: 导入标准 BPMN 2.0 XML
- **GIVEN** BPMN XML 使用标准 BPMN 2.0 命名空间
- **WHEN** 导入该文件
- **THEN** 正确解析所有元素和属性

#### Scenario: 导入 Flowable 扩展的 XML
- **GIVEN** BPMN XML 使用 Flowable 扩展命名空间
- **WHEN** 导入该文件
- **THEN** 正确解析 Flowable 扩展属性

#### Scenario: 导入 Camunda 扩展的 XML
- **GIVEN** BPMN XML 使用 Camunda 扩展命名空间
- **WHEN** 导入该文件
- **THEN** 正确解析 Camunda 扩展属性

### Requirement: 导入性能

导入器 SHALL 在合理时间内完成 BPMN XML 的解析和转换。

#### Scenario: 小型流程导入
- **GIVEN** 流程包含少于 20 个元素
- **WHEN** 用户导入 BPMN XML
- **THEN** 导入在 2 秒内完成

#### Scenario: 大型流程导入
- **GIVEN** 流程包含 20-100 个元素
- **WHEN** 用户导入 BPMN XML
- **THEN** 导入在 5 秒内完成
- **AND** 显示加载进度提示

#### Scenario: 超大流程导入
- **GIVEN** 流程包含超过 100 个元素
- **WHEN** 用户导入 BPMN XML
- **THEN** 导入在 30 秒内完成
- **AND** 显示持续更新的加载进度

