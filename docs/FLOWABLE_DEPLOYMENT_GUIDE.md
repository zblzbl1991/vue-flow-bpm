# Flowable 部署指南

本指南介绍如何将 BPMN 编辑器生成的流程定义部署到 Flowable 引擎。

## 目录

- [环境准备](#环境准备)
- [导出 BPMN 文件](#导出-bpmn-文件)
- [部署方式](#部署方式)
- [验证部署](#验证部署)
- [常见问题](#常见问题)
- [生产环境建议](#生产环境建议)

## 环境准备

### 1. Flowable 引擎安装

#### 使用 Flowable REST API

最简单的方式是使用 Flowable 官方 Docker 镜像：

```bash
docker run -d \
  --name flowable-rest \
  -p 8080:8080 \
  flowable/flowable-rest:latest
```

#### 使用 Flowable Starter (Spring Boot)

在 `pom.xml` 中添加依赖：

```xml
<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-spring-boot-starter-rest</artifactId>
    <version>7.0.0</version>
</dependency>
```

配置文件 `application.yml`：

```yaml
flowable:
  database-schema-update: true
  datasource:
    url: jdbc:mysql://localhost:3306/flowable?useSSL=false
    username: flowable
    password: flowable
    driver-class-name: com.mysql.cj.jdbc.Driver
  async-executor-activate: true
  mail:
    server:
      host: smtp.example.com
      port: 587
      username: your-email@example.com
      password: your-password
```

### 2. 验证安装

访问 Flowable REST API：

```bash
# 检查引擎状态
curl http://localhost:8080/flowable-rest/service/management/engines

# 应该返回类似：
{
  "data": [
    {
      "name": "default",
      "version": "7.0.0.1",
      "resourceUrl": "localhost",
      "exception": null
    }
  ]
}
```

## 导出 BPMN 文件

### 从编辑器导出

1. 在 BPMN 编辑器中点击"验证"按钮
2. 验证通过后，点击"导出 XML"
3. 保存 BPMN 文件（例如：`approval-process.bpmn20.xml`）

### BPMN 文件结构

导出的文件包含：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:flowable="http://flowable.org/bpmn"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="myProcess" name="My Process" isExecutable="true">
    <!-- 流程定义 -->
  </bpmn:process>
  <bpmndi:BPMNDiagram>
    <!-- 图形信息 -->
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
```

### 关键检查点

确保导出的文件满足：

- ✅ `process` 元素有唯一的 `id`
- ✅ `isExecutable` 设置为 `true`
- ✅ 至少有一个开始事件和结束事件
- ✅ 所有节点都正确连接
- ✅ Flowable 命名空间正确：`xmlns:flowable="http://flowable.org/bpmn"`

## 部署方式

### 方式 1: REST API 部署

#### 部署单个文件

```bash
curl -X POST \
  -F "file=@approval-process.bpmn20.xml" \
  http://localhost:8080/flowable-rest/service/repository/deployments
```

#### 部署多个文件

```bash
curl -X POST \
  -F "file=@approval-process.bpmn20.xml" \
  -F "file=@form.form" \
  http://localhost:8080/flowable-rest/service/repository/deployments
```

#### 带部署信息的部署

```bash
curl -X POST \
  -F "deployment-name=Approval Process v1.0" \
  -F "deployment-source=process-designer" \
  -F "tenant-id=your-tenant-id" \
  -F "file=@approval-process.bpmn20.xml" \
  http://localhost:8080/flowable-rest/service/repository/deployments
```

### 方式 2: Java API 部署

#### 使用 RepositoryService

```java
@Autowired
private RepositoryService repositoryService;

public void deployProcess() {
    Deployment deployment = repositoryService.createDeployment()
        .addClasspathResource("processes/approval-process.bpmn20.xml")
        .name("Approval Process")
        .category("approval")
        .tenantId("your-tenant-id")
        .deploy();

    System.out.println("Deployed: " + deployment.getId());
}
```

#### 部署字符串内容

```java
public void deployProcessFromString(String bpmnXml) {
    Deployment deployment = repositoryService.createDeployment()
        .addString("approval-process.bpmn20.xml", bpmnXml)
        .name("Approval Process")
        .deploy();
}
```

#### 部署 Zip 文件

```java
public void deployFromZip(String zipFilePath) {
    Deployment deployment = repositoryService.createDeployment()
        .addZipInputStream(new FileInputStream(zipFilePath))
        .name("Multiple Processes")
        .deploy();
}
```

### 方式 3: Maven 插件部署

配置 `flowable-maven-plugin`：

```xml
<plugin>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-maven-plugin</artifactId>
    <version>7.0.0</version>
    <executions>
        <execution>
            <id>deploy-process</id>
            <phase>compile</phase>
            <goals>
                <goal>deploy</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <serverUrl>http://localhost:8080/flowable-rest/service</serverUrl>
        <deploymentSource>maven-plugin</deploymentSource>
        <processDefinitions>
            <processDefinition>
                <resource>src/main/resources/processes/*.bpmn20.xml</resource>
            </processDefinition>
        </processDefinitions>
    </configuration>
</plugin>
```

运行部署：

```bash
mvn flowable:deploy
```

### 方式 4: Flowable UI 部署

1. 访问 Flowable Modeler
2. 登录（默认：admin/test）
3. 进入"Kickstart App"或"Processes"
4. 点击"Import"
5. 选择 BPMN 文件
6. 点击"Deploy"

## 验证部署

### 1. 检查部署列表

```bash
curl http://localhost:8080/flowable-rest/service/repository/deployments
```

返回示例：
```json
{
  "data": [
    {
      "id": "2501",
      "name": "Approval Process",
      "category": "approval",
      "key": null,
      "deploymentTime": "2024-01-15T10:30:00.000+08:00",
      "tenantId": "your-tenant-id"
    }
  ],
  "total": 1
}
```

### 2. 检查流程定义

```bash
curl http://localhost:8080/flowable-rest/service/repository/process-definitions
```

返回示例：
```json
{
  "data": [
    {
      "id": "approvalProcess:1:2503",
      "key": "approvalProcess",
      "version": 1,
      "name": "My Approval Process",
      "deploymentId": "2501",
      "resourceName": "approval-process.bpmn20.xml",
      "diagramResourceName": "approval-process.approvalProcess.png",
      "suspended": false,
      "description": "Approval workflow"
    }
  ],
  "total": 1
  }
}
```

### 3. 启动流程实例

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"processDefinitionKey":"approvalProcess"}' \
  http://localhost:8080/flowable-rest/service/runtime/process-instances
```

### 4. 查看活动流程

```bash
curl http://localhost:8080/flowable-rest/service/runtime/process-instances
```

## 常见问题

### 1. 部署失败 - 验证错误

**错误信息**：`Process definition validation errors`

**原因**：
- 缺少开始或结束事件
- 孤立的节点（未连接）
- 无效的 ID 格式

**解决方法**：
```java
// 启用验证（默认启用）
ProcessEngineConfiguration configuration = ProcessEngineConfiguration
    .createStandaloneProcessEngineConfiguration()
    .setDisableIdmEngine(true)
    .setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_TRUE);

// 在部署前验证
ProcessDefinition processDefinition = repositoryService
    .createDeployment()
    .addClasspathResource("process.bpmn20.xml")
    .deploy()
    .getProcessDefinitions()
    .get(0);
```

### 2. 监听器类找不到

**错误信息**：`ClassNotFoundException: com.example.MyListener`

**原因**：
- 监听器类不在 classpath 中
- 包名错误

**解决方法**：

选项 1: 将监听器类打包到 JAR 并放到 classpath

```bash
# 打包
mvn package

# 复制到 Flowable lib 目录
cp target/my-listeners.jar $FLOWABLE_HOME/wlp/usr/servers/defaultServer/apps/flowable-rest/WEB-INF/lib/
```

选项 2: 使用 Spring Bean（推荐）

```java
@Component("myListener")
public class MyListener implements ExecutionListener {
    // 实现
}
```

在 BPMN 中使用：
```xml
<flowable:executionListener event="start" delegateExpression="${myListener}" />
```

### 3. 表达式求值失败

**错误信息**：`Cannot resolve identifier 'myBean'`

**原因**：
- Spring Bean 未注册
- 表达式语法错误

**解决方法**：

检查 Bean 是否注册：
```java
@Autowired
private ApplicationContext applicationContext;

public void checkBeans() {
    String[] beans = applicationContext.getBeanDefinitionNames();
    for (String bean : beans) {
        if (bean.contains("my")) {
            System.out.println(bean);
        }
    }
}
```

### 4. 流程版本冲突

**现象**：新部署的流程没有生效

**原因**：Flowable 默认使用最新版本的流程定义

**解决方法**：

```java
// 指定版本启动
ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
    "approvalProcess",
    "businessKey",
    variables
);

// 或者使用流程定义 ID
runtimeService.startProcessInstanceById("approvalProcess:2:1234");
```

### 5. 多租户问题

**现象**：流程定义找不到

**原因**：租户 ID 不匹配

**解决方法**：

```java
// 部署时指定租户
repositoryService.createDeployment()
    .tenantId("tenant-1")
    .addClasspathResource("process.bpmn20.xml")
    .deploy();

// 查询时指定租户
ProcessDefinition definition = repositoryService
    .createProcessDefinitionQuery()
    .processDefinitionKey("myProcess")
    .tenantId("tenant-1")
    .singleResult();
```

## 生产环境建议

### 1. 使用数据库

生产环境应使用外部数据库而非 H2 内存数据库：

```yaml
flowable:
  datasource:
    url: jdbc:mysql://prod-db:3306/flowable?useSSL=true
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
```

### 2. 启用异步执行

提高性能和可扩展性：

```yaml
flowable:
  async-executor-activate: true
  async-executor:
    default-async-job-acquire-wait-time: 1000
    default-async-job-acquire-max-jobs-per-acquisition: 100
    max-async-jobs-due-per-acquisition: 1000
```

### 3. 配置邮件服务器

用于任务通知：

```yaml
flowable:
  mail:
    server:
      host: smtp.company.com
      port: 587
      username: notifications@company.com
      password: ${MAIL_PASSWORD}
      use-ssl: false
      use-tls: true
```

### 4. 启用审计

记录所有流程操作：

```yaml
flowable:
  history-level: AUDIT
```

历史级别：
- `NONE` - 不保存历史
- `ACTIVITY` - 保存活动实例
- `AUDIT` - 保存审计信息（推荐）
- `FULL` - 保存所有细节（影响性能）

### 5. 监控和日志

```yaml
logging:
  level:
    org.flowable: INFO
    org.flowable.job.executor: DEBUG
  file:
    name: logs/flowable.log
    max-size: 100MB
    max-history: 30
```

### 6. 安全配置

```yaml
flowable:
  rest:
    app:
      authentication-mode: verify-privilege
  admin:
    user:
      id: admin
      password: ${ADMIN_PASSWORD}
  idm:
    enabled: true
```

## 持续集成/持续部署

### GitHub Actions 示例

```yaml
name: Deploy BPMN

on:
  push:
    paths:
      - 'processes/**.bpmn20.xml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to Flowable
        run: |
          for file in processes/*.bpmn20.xml; do
            curl -X POST \
              -F "file=@$file" \
              -F "deployment-source=github-actions" \
              -F "tenant-id=production" \
              ${{ secrets.FLOWABLE_URL }}/repository/deployments
          done
```

### Maven 示例

```xml
<profile>
    <id>deploy-flowable</id>
    <build>
        <plugins>
            <plugin>
                <groupId>org.flowable</groupId>
                <artifactId>flowable-maven-plugin</artifactId>
                <configuration>
                    <serverUrl>${flowable.url}</serverUrl>
                    <deploymentSource>maven-deploy</deploymentSource>
                </configuration>
            </plugin>
        </plugins>
    </build>
</profile>
```

部署命令：
```bash
mvn deploy -Pdeploy-flowable -Dflowable.url=http://prod-flowable:8080/flowable-rest/service
```

## 参考资源

- [Flowable 官方文档](https://www.flowable.com/open-source/docs)
- [BPMN 2.0 规范](https://www.omg.org/spec/BPMN/2.0/)
- [Flowable REST API](https://www.flowable.com/open-source/docs/bpmn2/ch14-Rest-APIs)
