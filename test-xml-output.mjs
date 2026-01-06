import { generateBpmnXml } from './src/utils/bpmn-converter.ts';

const workflow = {
  process: { id: 'test', name: 'Test', version: 1, executable: true },
  nodes: [{ 
    id: 'task-1', 
    type: 'userTask', 
    position: { x: 100, y: 100 }, 
    data: { label: 'Task', width: 120, height: 80, assignee: 'user1', priority: '1', dueDate: '2024-01-01' } 
  }],
  edges: []
};

const xml = generateBpmnXml(workflow);
console.log(xml);
