# BPMN 属性配置指南

本文档介绍如何配置 BPMN 编辑器中各种元素的属性。

## 目录

- [流程属性](#流程属性)
- [用户任务属性](#用户任务属性)
- [服务任务属性](#服务任务属性)
- [网关属性](#网关属性)
- [序列流属性](#序列流属性)
- [事件属性](#事件属性)

## 流程属性

流程属性定义了整个流程的元数据。当没有选中任何元素时，属性面板会显示流程属性。

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Process ID | string | 是 | 流程的唯一标识符，必须符合 XML NCName 规则 |
| Process Name | string | 是 | 流程的显示名称 |
| Version | number | 是 | 流程版本号 |
| Executable | boolean | 否 | 流程是否可执行，默认为 `true` |
| Documentation | string | 否 | 流程的说明文档 |
| Candidate Starter Groups | string | 否 | 可启动此流程的用户组，逗号分隔 |

### ID 命名规则

- 必须以字母或下划线开头
- 只能包含字母、数字、下划线、连字符
- 不能包含空格或特殊字符
- 示例：`myProcess`, `approval_workflow`, `order-process-v2`

## 用户任务属性

用户任务代表需要人工完成的任务。

### 基本属性

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| Assignee | string | 任务的处理人 | `${initiator}`, `user123` |
| Candidate Users | string | 候选用户列表，逗号分隔 | `user1, user2, ${userList}` |
| Candidate Groups | string | 候选组列表，逗号分隔 | `managers, ${userGroups}` |
| Priority | string | 任务优先级（数字） | `50`, `100` |
| Due Date | string | 任务到期日期 | `${dueDate}`, `2024-12-31` |
| Form Key | string | 外部表单的键 | `formKey`, `embedded:app:form-name` |
| Skip Expression | string | 跳过任务的表达式 | `${alreadyApproved}` |

### 异步执行

| 选项 | 说明 |
|------|------|
| Async Before | 在任务执行前异步执行 |
| Async After | 在任务执行后异步执行 |

### 表达式语法

在分配人字段中，可以使用以下表达式类型：

- **变量表达式**：`${variableName}` - 引用流程变量
- **Spring Bean**：`${beanName}` - 引用 Spring 容器中的 Bean
- **固定值**：直接输入用户 ID 或用户名

示例：
```
${initiator}           # 流程启动者
${userApprover}        # 从流程变量获取
user123                # 固定用户
management             # 固定用户组
```

## 服务任务属性

服务任务代表自动执行的系统任务。

### 执行方式

服务任务支持三种执行方式，按优先级使用：

| 字段 | 说明 | 示例 |
|------|------|------|
| Expression | 表达式执行 | `${myService.doSomething()}` |
| Delegate Expression | 委托表达式 | `${myServiceBean}` |
| Class | Java 类全限定名 | `com.example.MyDelegate` |

### 异步配置

| 选项 | 说明 |
|------|------|
| Async | 异步执行（简写，等同于 Async Before） |
| Async Before | 在任务执行前异步执行 |
| Async After | 在任务执行后异步执行 |
| Triggerable | 异步任务是否可被触发（仅异步任务有效） |

### 表达式示例

```java
// 调用 Spring Bean 方法
${emailService.sendNotification()}

// 调用带参数的方法
${calculationService.calculate(amount, rate)}

// 调用静态方法
${com.example.Utils.formatDate(date)}
```

## 网关属性

网关用于控制流程的分支和合并。

### 排他网关 (Exclusive Gateway)

排他网关根据条件选择一条出口路径。

| 字段 | 说明 |
|------|------|
| Default Flow | 默认流向，当所有条件都不满足时使用 |

**注意**：建议为排他网关设置默认流，以避免所有条件都不满足时流程中断。

### 并行网关 (Parallel Gateway)

并行网关同时执行所有出口路径。

并行网关不需要额外配置，它会自动：
- **分流**：将流程分成多个并行路径
- **汇合**：等待所有并行路径完成后继续

## 序列流属性

序列流连接两个节点，定义流程的流向。

### 基本属性

| 字段 | 说明 | 示例 |
|------|------|------|
| Name | 连接线的显示名称 | `批准`, `拒绝` |
| Condition | 条件表达式（用于网关出口） | `${approved == true}` |

### 条件表达式语法

条件表达式使用 Unified Expression Language (UEL)：

```java
// 简单条件
${approved}

// 比较条件
${amount > 1000}

// 复合条件
${approved && amount < 5000}

// 调用方法
${document.isApproved()}

// 三元表达式
${urgent ? "high" : "normal"}
```

### 设置默认流

对于从排他网关引出的序列流，可以将其设为默认流：

1. 选中从网关引出的序列流
2. 在属性面板中点击"设为默认流"按钮
3. 或者在网关属性的"Default Flow"下拉框中选择

## 事件属性

事件代表流程中发生的事情。

### 基本属性

| 字段 | 说明 |
|------|------|
| Name | 事件的显示名称 |
| Documentation | 事件的说明文档 |

### 定时器事件属性

定时器事件用于在特定时间触发流程或任务。

| 字段 | 说明 | 示例 |
|------|------|------|
| Timer Type | 定时器类型 | `duration`, `date`, `cycle` |
| Timer Expression | 定时器表达式 | 见下方说明 |
| Infinite Loop | 是否无限循环（仅周期定时器） | - |

#### 定时器类型

1. **Duration（持续时间）**
   - ISO 8601 持续时间格式
   - 示例：
     - `PT5M` - 5 分钟
     - `PT1H` - 1 小时
     - `PT2H30M` - 2 小时 30 分钟
     - `P1D` - 1 天

2. **Date（特定日期）**
   - ISO 8601 日期时间格式
   - 示例：
     - `2024-12-31T23:59:59`
     - `2024-12-31`

3. **Cycle（周期）**
   - 重复执行的间隔
   - 示例：
     - `R3/PT10M` - 每 10 分钟执行，共 3 次
     - `R/PT1H` - 每小时执行一次（无限）
     - `R5/P1D` - 每天执行，共 5 次

   格式说明：`R[n]/间隔`
   - `R[n]` - 重复次数，`R` 表示无限
   - `/间隔` - ISO 8601 持续时间或周期

### 其他事件类型

| 事件类型 | 说明 | 配置字段 |
|---------|------|---------|
| Message Event | 消息事件 | Message Reference |
| Signal Event | 信号事件 | Signal Reference |
| Error Event | 错误事件 | Error Code |

## 高级配置

### 多实例配置

多实例允许并行或顺序执行多个任务实例。

| 字段 | 说明 | 示例 |
|------|------|------|
| Sequential | 是否顺序执行（否则并行） | 选中表示顺序 |
| Collection | 集合变量 | `${assigneeList}` |
| Element Variable | 元素变量名 | `assignee` |
| Completion Condition | 完成条件 | `${nrOfCompletedInstances >= nrOfInstances / 2}` |

**示例**：

```
集合：${approvingUsers}
元素变量：approver
完成条件：${nrOfCompletedInstances == nrOfInstances}
```

这会为 `${approvingUsers}` 列表中的每个用户创建一个任务实例。

### 监听器配置

监听器在流程的特定事件发生时执行自定义逻辑。

#### 执行监听器

执行监听器可以附加到流程、任务或序列流。

**事件类型**：
- `start` - 元素开始执行时
- `end` - 元素执行结束时
- `take` - 序列流被经过时

#### 任务监听器

任务监听器只能附加到用户任务。

**事件类型**：
- `create` - 任务创建时
- `assignment` - 任务分配时
- `complete` - 任务完成时
- `delete` - 任务删除时

#### 监听器实现类型

| 类型 | 说明 | 示例 |
|------|------|------|
| class | Java 类 | `com.example.MyListener` |
| expression | 表达式 | `${myListener.notify()}` |
| delegateExpression | 委托表达式 | `${myListenerBean}` |

#### 字段注入

可以为监听器注入字段值：

| 字段类型 | 说明 | 示例 |
|---------|------|------|
| String Value | 字符串值 | `notification@example.com` |
| Expression | 表达式值 | `${emailAddress}` |

## 表单属性配置

表单属性定义了用户任务表单的字段。

### 基本属性

| 字段 | 说明 | 示例 |
|------|------|------|
| ID | 表单字段唯一标识 | `requestReason` |
| Name | 字段显示名称 | `Request Reason` |
| Type | 字段数据类型 | `string`, `long`, `double`, `boolean`, `date`, `enum` |
| Required | 是否必填 | 选中表示必填 |
| Readable | 是否可读 | 选中表示用户可读取 |
| Writable | 是否可写 | 选中表示用户可编辑 |
| Default Value | 默认值 | `${defaultValue}` |

### 枚举类型

当 Type 设置为 `enum` 时，需要配置枚举值：

| 字段 | 说明 | 示例 |
|------|------|------|
| ID | 枚举值标识 | `approve` |
| Name | 枚举值显示名称 | `Approve` |

示例：
```
ID: approve, Name: 批准
ID: reject, Name: 拒绝
```

## 输入输出参数配置

输入输出参数用于服务任务与流程变量之间的数据传递。

### 输入参数

在服务任务执行前，将流程变量的值传递给任务。

| 字段 | 说明 | 示例 |
|------|------|------|
| Name | 参数名称 | `inputData` |
| Value | 参数值或表达式 | `${processVariable}` |

### 输出参数

在服务任务执行后，将任务的执行结果存储到流程变量。

| 字段 | 说明 | 示例 |
|------|------|------|
| Name | 参数名称 | `outputData` |
| Value | 参数值或表达式 | `${resultVariable}` |

## 常见问题

### Q: 如何设置动态的用户分配？

A: 使用表达式语法从流程变量获取：
```
${taskAssignee}
${users[0]}
${userService.findManager(department)}
```

### Q: 如何实现条件分支？

A:
1. 使用排他网关
2. 在出口序列流上设置条件表达式
3. 确保至少有一个默认流

### Q: 多实例任务如何收集结果？

A: 使用 `${executionListener}` 或在完成条件中聚合结果：
```
完成条件：${nrOfCompletedInstances == nrOfInstances && allApproved}
```

### Q: 定时器表达式中可以使用变量吗？

A: 可以，在定时器表达式中使用流程变量：
```
${dueDate}
R${repeatCount}/PT10M
```

## 参考资源

- [Flowable 用户手册](https://www.flowable.com/open-source/docs/bpmn2/ch07-BPMN-Constructs)
- [BPMN 2.0 规范](https://www.omg.org/spec/BPMN/2.0/)
- [UEL 表达式语法](https://docs.jboss.org/jbossas/docs/6.0/htdocs/Admin_Guide/Unified_Expression_Language.html)
