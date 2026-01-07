# bpmn20-comprehensive-testing Specification

## Purpose
TBD - created by archiving change test-bpmn20-files-comprehensive. Update Purpose after archive.
## Requirements
### Requirement: BPMN 2.0 测试文件集合

系统 SHALL 为 `process/convert/` 目录下的所有 `.bpmn20.xml` 文件提供对应的测试用例。

#### Scenario: 识别所有测试文件
- **GIVEN** `process/convert/` 目录
- **WHEN** 扫描目录中的 `.bpmn20.xml` 文件
- **THEN** 系统识别出以下 7 个测试文件：
  - `collapsed-subprocess.bpmn20.xml` - 折叠子流程场景
  - `extensions.bpmn20.xml` - Flowable 和自定义扩展
  - `eventlistenerscript.bpmn20.xml` - 脚本任务监听器
  - `eventlistenersmodel.bpmn20.xml` - 事件监听器模型
  - `extensionsXmlLocation.bpmn20.xml` - 扩展 XML 位置
  - `ProcessWithCompensationAssociation.bpmn20.xml` - 补偿关联
  - `servicetaskfailedjobretrytimecyclemodel.bpmn20.xml` - 服务任务重试配置
- **AND** 每个文件都有对应的测试用例

#### Scenario: 测试文件组织结构
- **GIVEN** 测试目录结构
- **THEN** `tests/fixtures/bpmn20/` 包含所有测试文件
- **AND** 每个文件有独立的子目录
- **AND** 每个子目录包含原始 `.bpmn20.xml` 文件
- **AND** 每个子目录包含期望的 `.json` 输出文件

---

### Requirement: 基础导入测试

系统 SHALL 为每个 `.bpmn20.xml` 文件提供导入测试，验证 XML 能被正确解析为 vue-flow JSON。

#### Scenario: 导入折叠子流程文件
- **GIVEN** `collapsed-subprocess.bpmn20.xml` 文件
- **WHEN** 执行导入操作
- **THEN** XML 被成功解析
- **AND** 生成正确数量的节点和边
- **AND** 子流程节点被正确识别
- **AND** 文本注释和关联被正确处理

#### Scenario: 导入扩展元素文件
- **GIVEN** `extensions.bpmn20.xml` 文件
- **WHEN** 执行导入操作
- **THEN** XML 被成功解析
- **AND** Flowable 扩展命名空间被识别
- **AND** 自定义扩展命名空间被识别
- **AND** 扩展元素被正确映射到节点数据

#### Scenario: 导入脚本监听器文件
- **GIVEN** `eventlistenerscript.bpmn20.xml` 文件
- **WHEN** 执行导入操作
- **THEN** XML 被成功解析
- **AND** taskListener 元素被正确解析
- **AND** script 内容和语言被正确提取
- **AND** field 元素被正确映射

#### Scenario: 导入验证检查点
- **GIVEN** 任意 `.bpmn20.xml` 测试文件
- **WHEN** 执行导入操作
- **THEN** 验证以下检查点：
  - process id、name、executable 属性正确
  - 所有节点类型正确识别
  - 序列流连接关系正确
  - 边界事件（如有）正确关联
  - DI 信息（位置、大小）正确解析

---

### Requirement: 基础导出测试

系统 SHALL 为每个测试文件提供导出测试，验证 vue-flow JSON 能被正确转换为 BPMN 2.0 XML。

#### Scenario: 导出折叠子流程
- **GIVEN** 从 `collapsed-subprocess.bpmn20.xml` 导入的 JSON
- **WHEN** 执行导出操作
- **THEN** 生成符合 BPMN 2.0 规范的 XML
- **AND** 子流程结构保持完整
- **AND** 文本注释和关联正确导出

#### Scenario: 导出扩展元素
- **GIVEN** 从 `extensions.bpmn20.xml` 导入的 JSON
- **WHEN** 执行导出操作
- **THEN** 生成符合 BPMN 2.0 规范的 XML
- **AND** Flowable 扩展命名空间正确声明
- **AND** 自定义扩展命名空间正确声明
- **AND** 扩展元素结构和内容保持一致

#### Scenario: 导出脚本监听器
- **GIVEN** 从 `eventlistenerscript.bpmn20.xml` 导入的 JSON
- **WHEN** 执行导出操作
- **THEN** 生成符合 BPMN 2.0 规范的 XML
- **AND** taskListener 结构完整
- **AND** script 内容正确导出（包括 CDATA）
- **AND** field 元素正确导出

#### Scenario: 导出验证检查点
- **GIVEN** 任意测试文件导入后的 JSON
- **WHEN** 执行导出操作
- **THEN** 验证以下检查点：
  - XML 可被 bpmn-js 成功导入
  - process 属性完整
  - 节点类型和 ID 正确
  - 序列流引用正确
  - 扩展属性完整

---

### Requirement: 往返转换测试

系统 SHALL 为每个测试文件提供往返转换测试，验证 XML → JSON → XML 转换的数据完整性。

#### Scenario: 折叠子流程往返转换
- **GIVEN** `collapsed-subprocess.bpmn20.xml` 文件
- **WHEN** 执行 XML → JSON → XML 转换
- **THEN** 最终 XML 与原始 XML 在结构上等价
- **AND** 子流程嵌套结构保持一致
- **AND** 节点类型和连接关系保持不变
- **AND** 允许以下差异：
  - 自动生成的 DI 坐标可能略有不同
  - 文本格式化和空白字符可能不同

#### Scenario: 扩展元素往返转换
- **GIVEN** `extensions.bpmn20.xml` 文件
- **WHEN** 执行往返转换
- **THEN** 扩展元素结构和内容保持完整
- **AND** 命名空间声明正确
- **AND** 条件表达式内容不变
- **AND** 自定义扩展元素完整保留

#### Scenario: 脚本监听器往返转换
- **GIVEN** `eventlistenerscript.bpmn20.xml` 文件
- **WHEN** 执行往返转换
- **THEN** script 内容和语言保持不变
- **AND** field name 和 value 映射正确
- **AND** 监听器事件类型（create、complete 等）正确

#### Scenario: 往返转换验证规则
- **GIVEN** 任意测试文件
- **WHEN** 执行往返转换
- **THEN** 应用以下验证规则：
  - 节点数量必须相同
  - 边的数量必须相同
  - 流程结构（拓扑）必须一致
  - 关键属性（label、assignee、条件）必须相同
  - 扩展属性必须完整（如果支持）
  - DI 信息允许合理的误差范围

---

### Requirement: 视觉渲染对比测试

系统 SHALL 提供视觉对比测试，验证 vue-flow 和 bpmn-js 的渲染效果在功能上等价。

#### Scenario: 生成基准截图
- **GIVEN** 每个 `.bpmn20.xml` 测试文件
- **WHEN** 使用 bpmn-js 和 vue-flow 分别渲染
- **THEN** 生成 bpmn-js 的基准截图
- **AND** 生成 vue-flow 的基准截图
- **AND** 截图保存到 `tests/screenshots/baseline/`
- **AND** 截图文件命名清晰（如 `collapsed-subprocess-bpmnjs.png`）

#### Scenario: 自动截图对比
- **GIVEN** 基准截图存在
- **WHEN** 运行视觉回归测试
- **THEN** 生成当前实现的截图
- **AND** 与基准截图进行像素级对比
- **AND** 计算差异百分比
- **AND** 差异超过阈值时测试失败
- **AND** 生成差异高亮图像

#### Scenario: 视觉对比容差配置
- **GIVEN** 视觉对比测试
- **THEN** 支持配置以下容差参数：
  - 像素差异阈值（如 5% 的像素可以不同）
  - 颜色差异阈值（允许轻微的颜色偏差）
  - 位置差异阈值（允许轻微的位置偏移）
- **AND** 不同测试文件可以有不同的容差配置
- **AND** 容差配置保存在测试文件中

#### Scenario: 视觉差异报告
- **GIVEN** 视觉对比测试失败
- **WHEN** 生成测试报告
- **THEN** 报告包含：
  - 差异百分比
  - 差异区域的截图高亮
  - 原始、当前、差异三并排图像
  - 可能的原因分析

---

### Requirement: 特定场景测试

系统 SHALL 为每个 `.bpmn20.xml` 文件的特定场景提供专门的测试用例。

#### Scenario: 测试折叠子流程场景
- **GIVEN** `collapsed-subprocess.bpmn20.xml`
- **THEN** 验证以下特定场景：
  - 折叠的子流程（isExpanded="false"）正确显示
  - 子流程内部的节点在展开后可见
  - 多层 BPMNDiagram 的处理
  - 文本注释（textAnnotation）的导入导出
  - 关联（association）的方向和引用正确

#### Scenario: 测试扩展元素场景
- **GIVEN** `extensions.bpmn20.xml`
- **THEN** 验证以下特定场景：
  - Flowable 命名空间（`flowable:`）的处理
  - 自定义命名空间（`custom:`）的处理
  - extensionElements 在不同元素上的使用
  - 嵌套的扩展元素结构
  - conditionExpression 的 CDATA 内容

#### Scenario: 测试脚本监听器场景
- **GIVEN** `eventlistenerscript.bpmn20.xml`
- **THEN** 验证以下特定场景：
  - taskListener 的 event 属性（create、complete 等）
  - script 的 language 属性（groovy、javascript 等）
  - script 的 CDATA 内容正确处理
  - field 元素的 name 和 string/stringValue 映射
  - executionListener 与 taskListener 的区别

#### Scenario: 测试补偿关联场景
- **GIVEN** `ProcessWithCompensationAssociation.bpmn20.xml`
- **THEN** 验证以下特定场景：
  - 补偿事件（compensationEvent）的识别
  - 关联的 associationDirection 属性
  - 补偿关系的连接正确性
  - 补偿活动的作用域

#### Scenario: 测试服务任务重试场景
- **GIVEN** `servicetaskfailedjobretrytimecyclemodel.bpmn20.xml`
- **THEN** 验证以下特定场景：
  - 失败重试配置的扩展属性
  - 时间周期表达式（timeCycle）的正确性
  - 重试策略参数的完整性

---

### Requirement: 测试辅助工具

系统 SHALL 提供专门的测试辅助工具，简化 BPMN 2.0 测试文件的测试编写。

#### Scenario: 加载 BPMN 2.0 测试文件
- **WHEN** 测试需要加载指定的测试文件
- **THEN** `loadBpmn20File(filename)` 函数可用
- **AND** 函数自动处理文件路径
- **AND** 函数返回 XML 字符串
- **AND** 文件不存在时抛出清晰错误

#### Scenario: 执行导入转换
- **WHEN** 测试需要执行 BPMN 导入
- **THEN** `importBpmn20(xml)` 函数可用
- **AND** 函数返回转换后的 vue-flow JSON
- **AND** 函数包含验证步骤
- **AND** 错误时提供详细的错误信息

#### Scenario: 执行往返转换测试
- **WHEN** 测试需要验证往返转换
- **THEN** `testBpmn20Roundtrip(filename, options)` 函数可用
- **AND** 函数执行完整的 XML → JSON → XML 转换
- **AND** 函数验证关键属性的一致性
- **AND** 函数返回详细的比较结果
- **AND** options 参数允许自定义验证规则

#### Scenario: 截图和视觉对比辅助
- **WHEN** 测试需要捕获截图
- **THEN** `captureBpmnViewer(viewer, filename)` 函数可用
- **AND** 函数处理异步的渲染过程
- **AND** 函数确保截图在渲染完成后进行
- **WHEN** 测试需要对比截图
- **THEN** `compareScreenshots(before, after, tolerance)` 函数可用
- **AND** 函数返回差异信息和相似度百分比

---

### Requirement: 测试覆盖率要求

系统 SHALL 确保测试用例覆盖所有关键功能和场景。

#### Scenario: 代码覆盖率目标
- **GIVEN** 测试套件执行完成
- **WHEN** 生成覆盖率报告
- **THEN** BPMN 转换逻辑的覆盖率 ≥ 80%
- **AND** 导入逻辑的覆盖率 ≥ 80%
- **AND** 导出逻辑的覆盖率 ≥ 80%
- **AND** 关键路径的覆盖率 = 100%

#### Scenario: 测试文件覆盖率
- **GIVEN** 7 个 `.bpmn20.xml` 测试文件
- **WHEN** 检查测试覆盖率
- **THEN** 每个文件都有对应的测试用例
- **AND** 每个文件至少包含：
  - 1 个导入测试
  - 1 个导出测试
  - 1 个往返转换测试
  - 1 个视觉对比测试（可选）

#### Scenario: 场景覆盖率
- **GIVEN** 所有测试文件
- **WHEN** 分析测试场景
- **THEN** 覆盖以下主要场景：
  - 基础流程元素（startEvent、endEvent、userTask、serviceTask）
  - 网关（exclusiveGateway、parallelGateway）
  - 子流程（collapsed、expanded）
  - 扩展元素（Flowable、Camunda、自定义）
  - 监听器（taskListener、executionListener）
  - 文本注释和关联
  - 边界事件和补偿

---

### Requirement: 测试报告和文档

系统 SHALL 提供清晰的测试报告和文档，便于问题追踪和维护。

#### Scenario: 测试结果汇总
- **GIVEN** 测试套件执行完成
- **WHEN** 生成测试报告
- **THEN** 报告包含：
  - 总体统计（通过/失败/跳过的测试数）
  - 每个测试文件的状态
  - 失败测试的详细错误信息
  - 转换统计（节点数、边数、转换时间）
  - 覆盖率报告链接

#### Scenario: 已知限制文档
- **GIVEN** 测试过程中发现的已知限制
- **WHEN** 维护 `tests/known-limitations.md`
- **THEN** 文档包含：
  - 每个已知限制的描述
  - 受影响的测试文件
  - 限制的原因（技术难度、优先级等）
  - 预计解决时间（如有）
  - 相关 issue 链接

#### Scenario: 测试失败诊断
- **GIVEN** 测试失败
- **WHEN** 查看测试报告
- **THEN** 报告提供足够的信息进行诊断：
  - 失败的断言和期望值
  - 实际值和差异高亮
  - 相关的文件和行号
  - 建议的调试步骤
  - 失败时的截图（如适用）

---

### Requirement: 性能测试

系统 SHALL 提供性能测试，确保转换和渲染在合理时间内完成。

#### Scenario: 导入性能测试
- **GIVEN** 每个 `.bpmn20.xml` 测试文件
- **WHEN** 执行导入操作
- **THEN** 测量导入时间
- **AND** 小型文件（< 10 个节点）在 500ms 内完成
- **AND** 中型文件（10-50 个节点）在 2s 内完成
- **AND** 大型文件（> 50 个节点）在 5s 内完成

#### Scenario: 导出性能测试
- **GIVEN** 每个 `.bpmn20.xml` 测试文件导入后的 JSON
- **WHEN** 执行导出操作
- **THEN** 测量导出时间
- **AND** 性能基准与导入测试相同

#### Scenario: 渲染性能测试
- **GIVEN** 每个 `.bpmn20.xml` 测试文件
- **WHEN** 使用 vue-flow 和 bpmn-js 渲染
- **THEN** 测量渲染时间
- **AND** vue-flow 渲染时间与 bpmn-js 相当（±50%）
- **AND** 大型文件的渲染不超过 10s

#### Scenario: 性能回归检测
- **GIVEN** 历史性能基准数据
- **WHEN** 运行性能测试
- **THEN** 当前性能与基准对比
- **AND** 性能下降超过 20% 时触发警告
- **AND** 性能提升超过 20% 时记录改进

---

### Requirement: CI/CD 集成

系统 SHALL 支持在 CI/CD 环境中自动运行测试。

#### Scenario: CI 环境配置
- **GIVEN** CI/CD 管道
- **WHEN** 运行测试
- **THEN** 测试可在无头环境中运行
- **AND** 视觉测试使用虚拟显示或 Docker
- **AND** 测试超时设置合理
- **AND** 测试失败时 CI 管道失败

#### Scenario: 测试分阶段执行
- **GIVEN** CI 资源有限
- **WHEN** 配置测试执行策略
- **THEN** 快速测试（单元测试）每次都运行
- **AND** 完整测试（包括视觉）在主分支和 PR 中运行
- **AND** 性能测试（`@slow`）仅在 nightly build 中运行
- **AND** 提供本地运行所有测试的命令

#### Scenario: 基准截图更新流程
- **GIVEN** 视觉测试因合理变更而失败
- **WHEN** 需要更新基准截图
- **THEN** 提供明确的更新命令
- **AND** 更新需要代码审查批准
- **AND** 基准截图变更被版本控制追踪

