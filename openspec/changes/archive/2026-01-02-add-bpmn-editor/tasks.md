## 1. 项目基础设置

- [x] 1.1 初始化 Vue 3 项目（使用 Vite）
- [x] 1.2 安装核心依赖：`vue-flow`, `@vue-flow/core`, `@vue-flow/background`, `@vue-flow/controls`
- [x] 1.3 安装转换依赖：`xmlbuilder2`
- [x] 1.4 安装验证依赖：`bpmn-js`
- [x] 1.5 配置 TypeScript 和路径别名

## 2. 类型定义

- [x] 2.1 创建 `src/types/bpmn.ts` 定义 BPMN 节点类型（BpmnNode, BpmnEdge）
- [x] 2.2 定义 BPMN 元素类型枚举（StartEvent, EndEvent, UserTask 等）
- [x] 2.3 定义 BPMN 属性接口（assignee, condition, async 等）

## 3. BPMN 编辑器核心组件

- [x] 3.1 创建 `src/components/BpmnEditor/BpmnEditor.vue` 主编辑器组件
- [x] 3.2 创建 `src/components/BpmnEditor/ControlPanel.vue` 元素工具面板
- [x] 3.3 实现从工具面板拖拽元素到画布的功能
- [x] 3.4 实现节点选择、删除功能
- [x] 3.5 实现画布缩放、平移功能

## 4. 自定义 BPMN 节点组件

- [x] 4.1 创建 `src/components/nodes/StartEvent.vue` - 圆形，绿色
- [x] 4.2 创建 `src/components/nodes/EndEvent.vue` - 圆形，红色，粗边框
- [x] 4.3 创建 `src/components/nodes/UserTask.vue` - 圆角矩形，带用户图标
- [x] 4.4 创建 `src/components/nodes/ServiceTask.vue` - 圆角矩形，带齿轮图标
- [x] 4.5 创建 `src/components/nodes/ExclusiveGateway.vue` - 菱形，带「X」
- [x] 4.6 创建 `src/components/nodes/ParallelGateway.vue` - 菱形，带「+」
- [x] 4.7 注册所有自定义节点类型到 vue-flow

## 5. 节点连接和编辑

- [x] 5.1 实现节点间序列流连接的创建
- [x] 5.2 实现连接线的删除功能
- [x] 5.3 创建 `src/components/BpmnEditor/PropertyPanel.vue` 属性编辑面板
- [x] 5.4 实现节点标签编辑
- [x] 5.5 实现用户任务的「处理人」属性编辑
- [x] 5.6 实现序列流的「条件表达式」编辑

## 6. BPMN 转换器实现

- [x] 6.1 创建 `src/utils/bpmn-converter.ts` 转换核心逻辑
- [x] 6.2 实现 `convertNodesToBpmnElements` 函数
- [x] 6.3 实现 `convertEdgesToSequenceFlows` 函数
- [x] 6.4 实现 `generateBpmnXml` 函数生成完整 XML
- [x] 6.5 添加 BPMN 命名空间处理
- [x] 6.6 添加 Flowable 扩展属性支持（camunda 命名空间）
- [x] 6.7 实现 ID 转换和唯一性保证

## 7. BPMN 验证预览

- [x] 7.1 创建 `src/components/BpmnEditor/PreviewModal.vue` 预览模态框
- [x] 7.2 集成 bpmn-js Viewer
- [x] 7.3 实现 BPMN XML 加载和渲染
- [x] 7.4 实现验证错误捕获和显示
- [x] 7.5 实现错误元素高亮和定位
- [x] 7.6 添加预览图缩放、平移交互

## 8. 编辑器 Composables

- [x] 8.1 创建 `src/composables/useBpmnEditor.ts` - 编辑器状态管理
- [x] 8.2 实现节点增删改查方法
- [x] 8.3 实现连接管理方法
- [x] 8.4 实现选择状态管理
- [x] 8.5 创建 `src/composables/useBpmnConverter.ts` - 转换功能封装
- [x] 8.6 创建 `src/composables/useBpmnValidator.ts` - 验证功能封装

## 9. 验证和转换集成

- [x] 9.1 在编辑器中添加「验证」按钮
- [x] 9.2 在编辑器中添加「导出 XML」按钮
- [x] 9.3 实现验证结果缓存机制
- [x] 9.4 实现导出前的结构验证（孤立节点检测等）
- [x] 9.5 实现下载 `.bpmn` 文件功能

## 10. 工作流保存和加载

- [x] 10.1 实现 JSON 导出功能
- [x] 10.2 实现 JSON 导入加载功能
- [x] 10.3 添加文件上传组件
- [x] 10.4 处理无效 JSON 文件的错误提示

## 11. 样式和用户体验

- [x] 11.1 设计 BPMN 元素工具面板样式
- [x] 11.2 设计属性编辑面板样式
- [x] 11.3 设计预览模态框样式
- [x] 11.4 添加加载状态提示
- [x] 11.5 添加操作反馈（成功/错误消息）

## 12. 测试和验证

- [x] 12.1 编写转换器单元测试
- [x] 12.2 测试各种 BPMN 元素的转换结果
- [x] 12.3 使用 Flowable 验证生成的 XML 可导入性
- [x] 12.4 测试复杂流程的转换（多个网关、嵌套分支）
- [x] 12.5 测试边界情况（单个节点、无连接等）

## 13. 文档

- [x] 13.1 编写项目 README
- [x] 13.2 编写使用说明（如何创建节点、如何导出）
- [x] 13.3 编写 BPMN 元素映射说明
- [x] 13.4 编写开发文档（目录结构、扩展指南）
