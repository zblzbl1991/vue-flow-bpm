# Change: Enhance BPMN Editor with Complete Element Management and Flowable Properties

## Why

当前的 BPMN 编辑器功能不完整，存在以下问题：

1. **元素删除功能缺失**：虽然 PropertyPanel 有删除按钮，但实际删除功能不工作（需要通过键盘 Delete 键或其他方式）
2. **属性配置不完整**：缺少 BPMN 2.0 规范和 Flowable 引擎所需的关键属性
3. **无法设置流程级别的属性**：缺少流程定义的元数据设置（如名称、版本、描述等）
4. **网关条件配置不直观**：排他网关的条件表达式没有默认流设置
5. **缺少多实例任务配置**：用户任务和服务任务不支持多实例配置
6. **缺少执行监听器和任务监听器**：Flowable 扩展功能未实现
7. **缺少表单属性配置**：用户任务的表单字段未支持
8. **缺少流程变量初始化**：无法设置流程实例的初始变量

## What Changes

本变更将添加以下功能：

### 1. 完整的元素删除功能
- 支持 Delete/Backspace 键删除选中元素
- 属性面板删除按钮功能修复
- 右键菜单删除选项
- 批量删除支持

### 2. 扩展的 BPMN 元素属性
根据 BPMN 2.0 规范和 Flowable 扩展，添加：

**通用属性**（所有元素）：
- ID（可编辑）
- Name/Label
- Documentation（文档说明）

**流程级别属性**：
- Process ID
- Process Name
- Process Version
- Candidate Groups（候选组）
- Documentation
- Executable（可执行标志）

**用户任务属性**：
- Assignee（处理人）
- Candidate Users（候选用户）
- Candidate Groups（候选组）
- Priority（优先级）
- Due Date（到期日期）
- Form Key（表单键）
- Skip Expression（跳过表达式）
- Async Before/After（异步前后）
- Multi-instance（多实例）配置
  - Sequential（顺序/并行）
  - Collection（集合变量）
  - Element Variable（元素变量）
  - Completion Condition（完成条件）

**服务任务属性**：
- Expression（表达式）
- Delegate Expression（委托表达式）
- Class（Java 类）
- Async（异步执行）
- Async Before/After
- Triggerable（可触发）
- Multi-instance 配置

**网关属性**：
- Default Flow（默认流）
- Direction（数据流向）

**序列流属性**：
- Condition（条件表达式）
- Name（名称）
- Documentation

### 3. 监听器配置
- Execution Listener（执行监听器）
  - Event 类型：start, end, take
  - Java Class / Expression / Delegate Expression
  - Fields 配置

- Task Listener（任务监听器）
  - Event 类型：create, assignment, complete, delete
  - Java Class / Expression / Delegate Expression
  - Fields 配置

### 4. 表单属性配置
- Form Properties（表单属性）
  - ID, Name, Type
  - Required, Read-only
  - Default Value
  - Values（枚举值）

### 5. 流程变量配置
- Initial Variables（初始变量）
  - Variable Name
  - Type（String, Number, Boolean, Date）
  - Default Value

### 6. 输入输出参数配置
- Input Parameters（输入参数）
- Output Parameters（输出参数）
- Connector 配置

## Impact

- Affected specs:
  - `bpmn-editor` (modified) - 添加完整的元素管理功能
  - `bpmn-properties` (new) - BPMN 元素属性管理
  - `bpmn-listeners` (new) - 监听器配置
  - `bpmn-forms` (new) - 表单属性配置
  - `bpmn-conversion` (modified) - 扩展 XML 转换支持新属性

- Affected code:
  - `src/types/bpmn.ts` - 扩展类型定义
  - `src/components/BpmnEditor/PropertyPanel.vue` - 重构属性面板
  - `src/components/BpmnEditor/BpmnEditor.vue` - 添加删除和快捷键支持
  - `src/components/BpmnEditor/ContextMenu.vue` (new) - 右键菜单
  - `src/components/BpmnEditor/properties/` (new) - 分类属性编辑组件
  - `src/composables/useBpmnEditor.ts` - 扩展状态管理
  - `src/utils/bpmn-converter.ts` - 扩展转换逻辑
