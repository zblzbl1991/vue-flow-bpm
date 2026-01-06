# Spec: BPMN Properties Configuration

## ADDED Requirements

### Requirement: 配置流程级别属性

The system MUST allow users to configure metadata properties for the entire process definition.

#### Scenario: 编辑流程名称和版本

**Given** 用户在 BPMN 编辑器中

**When** 用户打开属性面板的"流程属性"部分

**Then** 应能编辑：
  - Process ID（流程唯一标识符）
  - Process Name（流程显示名称）
  - Process Version（流程版本号）

#### Scenario: 设置流程可执行标志

**Given** 用户正在编辑流程属性

**When** 用户切换"Executable"复选框

**Then** 生成的 BPMN XML 中流程定义应包含对应的 `executable` 属性

### Requirement: 配置用户任务属性

The system MUST allow users to configure all standard BPMN 2.0 properties for user tasks.

#### Scenario: 设置任务处理人

**Given** 用户选中一个用户任务节点

**When** 用户在"Assignee"字段输入 `${initiator}` 或具体的用户 ID

**Then**
- 属性应保存到节点的 data 中
- 导出 XML 时应生成 `flowable:assignee` 属性

#### Scenario: 设置候选用户和候选组

**Given** 用户选中一个用户任务节点

**When** 用户在"Candidate Users"字段输入逗号分隔的用户 ID 列表

**Then**
- 属性应保存到节点的 data 中
- 导出 XML 时应生成 `flowable:candidateUsers` 属性

**When** 用户在"Candidate Groups"字段输入逗号分隔的组 ID 列表

**Then**
- 属性应保存到节点的 data 中
- 导出 XML 时应生成 `flowable:candidateGroups` 属性

#### Scenario: 配置任务优先级和到期日期

**Given** 用户选中一个用户任务节点

**When** 用户在"Priority"字段输入数字（如 50）

**Then** 导出 XML 时应生成 `flowable:priority` 属性

**When** 用户在"Due Date"字段输入日期表达式（如 `${dueDate}`）

**Then** 导出 XML 时应生成 `flowable:dueDate` 属性

### Requirement: 配置服务任务属性

The system MUST allow users to configure the execution method for service tasks.

#### Scenario: 使用表达式配置服务任务

**Given** 用户选中一个服务任务节点

**When** 用户在"Expression"字段输入表达式（如 `${myService.doSomething()}`）

**Then** 导出 XML 时应生成 `flowable:expression` 属性

#### Scenario: 使用 Java 类配置服务任务

**Given** 用户选中一个服务任务节点

**When** 用户在"Class"字段输入完整的 Java 类名（如 `com.example.MyDelegate`）

**Then** 导出 XML 时应生成 `flowable:class` 属性

#### Scenario: 配置异步执行

**Given** 用户选中一个服务任务节点

**When** 用户勾选"Async"复选框

**Then** 导出 XML 时应生成 `flowable:async="true"` 属性

### Requirement: 配置网关属性

The system MUST allow users to set a default flow for exclusive gateways.

#### Scenario: 设置网关默认流

**Given** 用户选中一个排他网关节点

**When** 用户从"Default Flow"下拉框选择一条出口序列流

**Then**
- 网关的 `default` 属性应被设置
- 导出 XML 时应生成对应的 `default` 属性引用

### Requirement: 配置序列流条件

The system MUST allow users to set condition expressions for outgoing sequence flows from gateways.

#### Scenario: 设置序列流条件

**Given** 用户选中一条从网关节点引出的序列流

**When** 用户在"Condition"字段输入条件表达式（如 `${approved == true}`）

**Then**
- 条件应保存到序列流的 data 中
- 导出 XML 时应生成 `bpmn:conditionExpression` 元素

#### Scenario: 序列流显示条件标签

**Given** 一条序列流设置了条件表达式

**When** 该序列流在画布上渲染

**Then** 应在序列流附近显示条件标签（简短形式）

### Requirement: 添加文档说明

The system MUST allow users to add documentation to any BPMN element.

#### Scenario: 为节点添加文档

**Given** 用户选中任意节点

**When** 用户在"Documentation"多行文本框输入说明文字

**Then**
- 文档内容应保存到节点的 data 中
- 导出 XML 时应生成 `bpmn:documentation` 元素

### Requirement: 配置多实例任务

The system MUST allow users to configure tasks for multi-instance execution.

#### Scenario: 启用并行多实例

**Given** 用户选中一个用户任务或服务任务

**When** 用户勾选"Multi-instance"复选框，并选择"Parallel"模式

**Then** 导出 XML 时应生成 `multiInstanceLoopCharacteristics` 元素，`isSequential` 为 `false`

#### Scenario: 配置多实例集合变量

**Given** 用户已启用任务的多实例

**When** 用户在"Collection"字段输入集合变量名（如 `${assigneeList}`）

**Then** 导出 XML 时应生成 `flowable:collection` 属性

#### Scenario: 配置完成条件

**Given** 用户已启用任务的多实例

**When** 用户在"Completion Condition"字段输入条件（如 `${nrOfCompletedInstances >= nrOfInstances}`）

**Then** 导出 XML 时应生成 `completionCondition` 元素
