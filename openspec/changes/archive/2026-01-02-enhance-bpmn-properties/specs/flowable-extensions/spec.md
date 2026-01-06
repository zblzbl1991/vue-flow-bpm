# Spec: Flowable Extensions Support

## ADDED Requirements

### Requirement: 配置执行监听器

The system MUST allow users to add execution listeners to processes, nodes, and sequence flows to execute custom logic during lifecycle events.

#### Scenario: 为流程添加启动事件监听器

**Given** 用户选中流程定义（或在属性面板选择"流程属性"）

**When** 用户在"Execution Listeners"部分添加监听器：
  - Event: "start"
  - Type: "class"
  - Value: "com.example.ProcessStartListener"

**Then**
- 监听器配置应保存到流程定义中
- 导出 XML 时应在 `bpmn:extensionElements` 中生成 `flowable:executionListener` 元素

#### Scenario: 为节点添加完成事件监听器

**Given** 用户选中一个用户任务节点

**When** 用户添加执行监听器：
  - Event: "end"
  - Type: "expression"
  - Value: "${taskListener.notifyComplete()}"

**Then** 导出 XML 时应在节点的 `bpmn:extensionElements` 中生成对应监听器

#### Scenario: 为监听器配置字段

**Given** 用户正在配置一个执行监听器

**When** 用户添加字段：
  - Field Name: "emailService"
  - Field Value: "${emailService}"

**Then** 导出 XML 时应生成 `flowable:field` 元素嵌套在监听器中

### Requirement: 配置任务监听器

The system MUST allow users to add task listeners to user tasks.

#### Scenario: 添加任务创建监听器

**Given** 用户选中一个用户任务节点

**When** 用户添加任务监听器：
  - Event: "create"
  - Type: "delegateExpression"
  - Value: "${taskCreateHandler}"

**Then** 导出 XML 时应生成 `flowable:taskListener` 元素

#### Scenario: 配置任务分配监听器

**Given** 用户选中一个用户任务节点

**When** 用户添加任务监听器：
  - Event: "assignment"
  - Type: "class"
  - Value: "com.example.TaskAssignmentListener"

**Then** 导出 XML 时应生成对应的任务监听器，event 为 "assignment"

### Requirement: 配置表单属性

The system MUST allow users to define form properties for user tasks to be used in Flowable task forms.

#### Scenario: 添加基本表单属性

**Given** 用户选中一个用户任务节点

**When** 用户添加表单属性：
  - ID: "requestReason"
  - Name: "Request Reason"
  - Type: "string"
  - Required: true
  - Writable: true

**Then** 导出 XML 时应生成 `flowable:formProperty` 元素

#### Scenario: 添加枚举类型表单属性

**Given** 用户正在添加表单属性

**When** 用户：
  - 设置 Type 为 "enum"
  - 添加枚举值：
    - ID: "approve", Name: "Approve"
    - ID: "reject", Name: "Reject"

**Then** 导出 XML 时应生成包含 `flowable:formProperty` 及其 `flowable:value` 子元素

#### Scenario: 添加日期类型表单属性

**Given** 用户正在添加表单属性

**When** 用户：
  - 设置 Type 为 "date"
  - 设置 Default Value 为 "${today()}"

**Then** 导出 XML 时应生成对应的日期类型表单属性

### Requirement: 配置输入输出参数

The system MUST allow users to configure input and output parameters for service tasks to pass variables before and after task execution.

#### Scenario: 添加输入参数

**Given** 用户选中一个服务任务节点

**When** 用户添加输入参数：
  - Name: "inputVar"
  - Value: "${processVariable}"

**Then** 导出 XML 时应在 `flowable:extensionElements` 中生成 `flowable:inputParameter` 元素

#### Scenario: 添加输出参数

**Given** 用户选中一个服务任务节点

**When** 用户添加输出参数：
  - Name: "outputVar"
  - Value: "${resultVariable}"

**Then** 导出 XML 时应生成 `flowable:outputParameter` 元素

### Requirement: 配置跳过表达式

The system MUST allow users to configure skip expressions for user tasks to conditionally skip task execution.

#### Scenario: 设置任务跳过表达式

**Given** 用户选中一个用户任务节点

**When** 用户在"Skip Expression"字段输入：`${alreadyApproved}`

**Then**
- 表达式应保存到任务配置中
- 导出 XML 时应生成 `flowable:skipExpression` 属性

### Requirement: 配置异步前后执行

The system MUST allow users to have fine-grained control over task async execution timing.

#### Scenario: 设置异步前置执行

**Given** 用户选中一个服务任务节点

**When** 用户勾选"Async Before"复选框

**Then** 导出 XML 时应生成 `flowable:asyncBefore="true"` 属性

#### Scenario: 同时设置异步前后执行

**Given** 用户选中一个服务任务节点

**When** 用户同时勾选"Async Before"和"After"复选框

**Then** 导出 XML 时应同时生成 `flowable:asyncBefore="true"` 和 `flowable:asyncAfter="true"` 属性

### Requirement: 配置可触发标志

The system MUST allow users to mark async service tasks as triggerable to allow triggering via messages during execution.

#### Scenario: 设置服务任务可触发

**Given** 用户选中一个异步服务任务节点

**When** 用户勾选"Triggerable"复选框

**Then** 导出 XML 时应生成 `flowable:triggerable="true"` 属性

## MODIFIED Requirements

### Requirement: XML 命名空间使用

All Flowable extension properties MUST use the correct namespace.

#### Scenario: 生成 Flowable 命名空间的 XML

**Given** 用户已配置包含 Flowable 扩展属性的工作流

**When** 用户导出 BPMN XML

**Then** XML 根元素应包含：
  - `xmlns:flowable="http://flowable.org/bpmn"`
  - 所有扩展属性使用 `flowable:` 前缀

#### Scenario: 不使用 Camunda 命名空间

**Given** 用户导出 BPMN XML

**When** 检查生成的 XML

**Then** 不应包含任何 `camunda:` 前缀的属性
