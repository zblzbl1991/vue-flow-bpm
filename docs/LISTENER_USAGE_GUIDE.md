# 监听器使用指南

监听器是 BPMN 流程中扩展流程行为的重要机制。本文档详细介绍如何配置和使用监听器。

## 目录

- [监听器概述](#监听器概述)
- [执行监听器](#执行监听器)
- [任务监听器](#任务监听器)
- [监听器实现类型](#监听器实现类型)
- [字段注入](#字段注入)
- [常见使用场景](#常见使用场景)
- [最佳实践](#最佳实践)

## 监听器概述

监听器允许在流程的特定事件发生时执行自定义代码。通过监听器，你可以：

- 在流程节点执行前后添加自定义逻辑
- 拦截和修改流程变量
- 发送通知和日志
- 与外部系统集成
- 实现复杂的业务规则

### 监听器类型

| 类型 | 附加到 | 用途 |
|------|--------|------|
| 执行监听器 | 流程、任务、序列流 | 在元素生命周期的关键时刻执行 |
| 任务监听器 | 用户任务 | 在任务生命周期的关键时刻执行 |

## 执行监听器

执行监听器附加到流程元素（开始事件、任务、网关等），在特定执行事件发生时触发。

### 支持的事件

| 事件 | 触发时机 | 适用元素 |
|------|----------|----------|
| `start` | 元素开始执行时 | 所有元素 |
| `end` | 元素执行结束时 | 所有元素 |
| `take` | 序列流被经过时 | 仅序列流 |

### 使用示例

#### 1. 在流程开始时初始化变量

```
事件：start
类型：class
值：com.example.ProcessInitListener
```

Java 实现：
```java
public class ProcessInitListener implements ExecutionListener {
    @Override
    public void notify(DelegateExecution execution) {
        execution.setVariable("processStartTime", new Date());
        execution.setVariable("approvalCount", 0);
    }
}
```

#### 2. 在流程结束时发送通知

```
事件：end
类型：expression
值：${notificationService.sendProcessComplete(execution)}
```

#### 3. 在序列流经过时记录日志

```
事件：take
类型：expression
值：${logService.logFlowTake(execution, 'Review to Approve')}
```

## 任务监听器

任务监听器专门用于用户任务，在任务生命周期的关键时刻触发。

### 支持的事件

| 事件 | 触发时机 | 说明 |
|------|----------|------|
| `create` | 任务创建时 | 任务已创建但尚未分配给任何人 |
| `assignment` | 任务分配时 | 任务已分配给用户或组 |
| `complete` | 任务完成时 | 用户已完成任务并提交 |
| `delete` | 任务删除时 | 任务被删除（完成或取消） |

### 使用示例

#### 1. 任务创建时发送邮件通知

```
事件：create
类型：expression
值：${emailService.sendTaskNotification(task)}
```

#### 2. 任务分配时记录日志

```
事件：assignment
类型：class
值：com.example.AssignmentLogger
```

Java 实现：
```java
public class AssignmentLogger implements TaskListener {
    @Override
    public void notify(DelegateTask delegateTask) {
        String assignee = delegateTask.getAssignee();
        Date assignmentTime = new Date();
        delegateTask.setVariable("lastAssignmentTime", assignmentTime);
        delegateTask.setVariable("lastAssignee", assignee);
    }
}
```

#### 3. 任务完成时验证数据

```
事件：complete
类型：expression
值：${validationService.validateTaskCompletion(task, execution)}
```

如果验证失败，可以抛出异常阻止任务完成：
```java
public void validateTaskCompletion(DelegateTask task, DelegateExecution execution) {
    String decision = (String) task.getVariable("decision");
    if (decision == null || decision.isEmpty()) {
        throw new FlowableException("Decision must be provided");
    }
}
```

## 监听器实现类型

监听器支持三种实现类型，按使用灵活性从高到低排序。

### 1. Expression（表达式）

表达式类型使用 Spring 表达式语言（SpEL）或统一表达式语言（UEL）调用 Bean 方法。

**语法**：`${beanName.methodName(parameters)}`

**优点**：
- 灵活，可以传递参数
- 可以直接调用 Spring Bean
- 支持链式调用

**示例**：
```
${auditService.log('process_start', execution)}
${emailService.sendTo(execution.getVariable('assignee'), 'New task assigned')}
${integrationService.callExternalAPI(task.getVariable('taskId'))}
```

### 2. Delegate Expression（委托表达式）

委托表达式引用 Spring 容器中的 Bean，该 Bean 必须实现监听器接口。

**语法**：`${beanName}`

**优点**：
- 类型安全
- 支持 Spring 依赖注入
- 可以在 Bean 中注入其他服务

**示例**：
```
监听器值：${myTaskListener}
```

Spring 配置：
```java
@Component("myTaskListener")
public class MyTaskListener implements TaskListener {
    @Autowired
    private EmailService emailService;

    @Override
    public void notify(DelegateTask delegateTask) {
        emailService.sendNotification(delegateTask.getAssignee());
    }
}
```

### 3. Class（Java 类）

Class 类型使用 Java 类的全限定名，Flowable 会创建该类的实例。

**语法**：`com.example.MyListener`

**优点**：
- 简单直接
- 不需要 Spring 配置

**缺点**：
- 每次调用创建新实例，无法维护状态
- 不支持依赖注入（除非使用字段注入）

**示例**：
```
监听器值：com.example.NotificationListener
```

Java 实现：
```java
public class NotificationListener implements ExecutionListener {
    @Override
    public void notify(DelegateExecution execution) {
        String processName = execution.getProcessDefinitionName();
        System.out.println("Process started: " + processName);
    }
}
```

### 选择建议

| 场景 | 推荐类型 |
|------|----------|
| 简单逻辑，不需要依赖注入 | Class |
| 需要访问 Spring Bean | Delegate Expression |
| 需要传递参数或复杂表达式 | Expression |

## 字段注入

字段注入允许在运行时向监听器传递参数值。这是在不使用 Spring 的情况下实现依赖注入的方法。

### 字段类型

#### 1. String Value（字符串值）

直接使用字符串作为字段值。

**示例配置**：
```
字段名：emailAddress
字符串值：notifications@example.com
```

Java 实现：
```java
public class EmailNotificationListener implements TaskListener {
    private String emailAddress;

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        // 使用注入的 emailAddress 发送邮件
        sendEmail(emailAddress, "Task Assigned");
    }
}
```

#### 2. Expression（表达式值）

使用表达式动态计算字段值。

**示例配置**：
```
字段名：recipient
表达式：${task.assignee}
```

Java 实现：
```java
public class DynamicNotificationListener implements TaskListener {
    private String recipient;

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        // recipient 会是任务的实际处理人
        sendEmail(recipient, "You have a new task");
    }
}
```

### 多个字段示例

配置：
```
字段 1：
  名称：emailServer
  字符串值：smtp.example.com

字段 2：
  名称：emailPort
  字符串值：587

字段 3：
  名称：useSsl
  字符串值：true

字段 4：
  名称：recipient
  表达式：${initiatorEmail}
```

Java 实现：
```java
public class ConfigurableEmailListener implements TaskListener {
    private String emailServer;
    private String emailPort;
    private String useSsl;
    private String recipient;

    // Setters
    public void setEmailServer(String emailServer) { this.emailServer = emailServer; }
    public void setEmailPort(String emailPort) { this.emailPort = emailPort; }
    public void setUseSsl(String useSsl) { this.useSsl = useSsl; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    @Override
    public void notify(DelegateTask delegateTask) {
        EmailConfig config = new EmailConfig(emailServer, Integer.parseInt(emailPort), Boolean.parseBoolean(useSsl));
        sendEmail(config, recipient, "New Task");
    }
}
```

## 常见使用场景

### 1. 审计日志

记录流程中所有重要事件：

**流程开始监听器**：
```
事件：start
类型：expression
值：${auditService.logEvent('PROCESS_START', execution)}
```

**任务完成监听器**：
```
事件：complete
类型：expression
值：${auditService.logEvent('TASK_COMPLETE', task, execution)}
```

### 2. 动态分配

根据业务规则动态分配任务：

**任务创建监听器**：
```
事件：create
类型：expression
值：${assignmentService.assignTaskByRules(task)}
```

服务实现：
```java
public void assignTaskByRules(DelegateTask task) {
    String department = (String) task.getVariable("department");
    String priority = (String) task.getVariable("priority");

    if ("high".equals(priority)) {
        task.setAssignee(getManager(department));
    } else {
        task.addCandidateGroup(department + "-team");
    }
}
```

### 3. 数据验证

在任务完成前验证输入数据：

**任务完成监听器**：
```
事件：complete
类型：expression
值：${validationService.validateApprovalData(task)}
```

服务实现：
```java
public void validateApprovalData(DelegateTask task) {
    String decision = (String) task.getVariable("decision");
    String reason = (String) task.getVariable("reason");

    if ("reject".equals(decision) && (reason == null || reason.isEmpty())) {
        throw new FlowableException("Rejection reason is required");
    }
}
```

### 4. 自动推进

某些情况下，在条件满足时自动完成任务：

**任务创建监听器**：
```
事件：create
类型：expression
值：${autoCompleteService.tryComplete(task)}
```

服务实现：
```java
public void tryComplete(DelegateTask task) {
    String assignee = task.getAssignee();
    Boolean autoApproved = (Boolean) task.getVariable("autoApproved");

    if (Boolean.TRUE.equals(autoApproved)) {
        // 系统用户表示自动处理
        if ("system".equals(assignee)) {
            task.complete();
        }
    }
}
```

### 5. 外部系统集成

在关键节点与外部系统交互：

**流程结束监听器**：
```
事件：end
类型：expression
值：${integrationService.syncProcessData(execution)}
```

### 6. 通知发送

在各种事件发生时发送通知：

**任务分配监听器**：
```
事件：assignment
类型：expression
值：${notificationService.notifyTaskAssignment(task, execution)}
```

## 最佳实践

### 1. 使用表达式优先

表达式类型最灵活，优先使用：

```
✅ 推荐：${myService.doSomething(execution)}
❌ 避免：com.example.MyListener
```

### 2. 保持监听器简单

监听器应该快速执行，避免阻塞流程：

```java
// ✅ 好的做法
public void notify(DelegateExecution execution) {
    // 将实际工作放入消息队列异步处理
    messageQueue.publish(new ProcessEvent(execution));
}

// ❌ 避免的做法
public void notify(DelegateExecution execution) {
    // 阻塞调用外部 API
    externalApi.heavyOperation(); // 可能导致超时
}
```

### 3. 异常处理

在监听器中妥善处理异常：

```java
public void notify(DelegateTask task) {
    try {
        doSomething(task);
    } catch (BusinessException e) {
        // 记录错误但不阻止流程
        log.error("Listener failed", e);
        task.setVariable("listenerError", e.getMessage());
    }
}
```

### 4. 使用事务后监听器

如果需要在流程事务提交后执行操作，使用事务监听器：

```java
public class TransactionListener implements ExecutionListener {
    @Override
    public void notify(DelegateExecution execution) {
        execution.addListener("transaction-commit", new ExecutionListener() {
            @Override
            public void notify(DelegateExecution execution) {
                // 在事务提交后执行
                sendNotifications(execution);
            }
        });
    }
}
```

### 5. 避免循环依赖

不要在监听器中创建会导致无限循环的操作：

```java
// ❌ 错误：在任务完成监听器中再次完成任务
public void notify(DelegateTask task) {
    task.complete(); // 会导致递归调用
}

// ✅ 正确：使用标志防止重复执行
public void notify(DelegateTask task) {
    Boolean alreadyHandled = (Boolean) task.getVariable("taskHandled");
    if (Boolean.FALSE.equals(alreadyHandled)) {
        task.setVariable("taskHandled", true);
        // 执行需要的操作
    }
}
```

### 6. 文档化监听器

在流程文档中记录监听器的用途和行为：

```
监听器：ProcessStartLogger
事件：start
类型：class
值：com.example.ProcessStartLogger
描述：记录流程启动信息，包括启动时间、发起人和业务键
```

### 7. 测试监听器

为监听器编写单元测试：

```java
@Test
public void testTaskCompleteListener() {
    // 部署流程定义
    deployment = repositoryService.createDeployment()
        .addClasspathResource("process/test-process.bpmn20.xml")
        .deploy();

    // 启动流程
    runtimeService.startProcessInstanceByKey("testProcess");

    // 完成任务
    Task task = taskService.createTaskQuery().singleResult();
    taskService.complete(task.getId());

    // 验证监听器执行的效果
    Map<String, Object> variables = runtimeService.getVariables();
    assertTrue(variables.containsKey("taskCompletedAt"));
}
```

## 调试监听器

### 启用监听器日志

在 Flowable 配置中启用监听器日志：

```yaml
flowable:
  process:
    enable-fetch-extensions: true
  async-executor-activate: true
logging:
  level:
    org.flowable: DEBUG
```

### 常见问题排查

**问题 1：监听器未执行**

检查：
- 监听器配置的事件类型是否正确
- 监听器类/表达式是否正确
- 查看日志是否有错误信息

**问题 2：监听器执行失败**

检查：
- 监听器代码是否有异常
- 是否有权限问题
- Spring Bean 是否正确注册

**问题 3：字段注入失败**

检查：
- 字段名称是否正确
- Setter 方法是否正确
- 表达式是否返回有效值

## 参考资源

- [Flowable 监听器文档](https://www.flowable.com/open-source/docs/bpmn2/ch07-BPMN-Constructs#event-listeners)
- [Spring 表达式语言](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#expressions)
- [Java Delegate 示例](https://www.flowable.com/open-source/docs/bpmn2/ch08-Execution-Listeners#java-delegate)
