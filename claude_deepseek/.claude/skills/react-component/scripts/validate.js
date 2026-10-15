// scripts/validate.js —— 验证组件目录结构是否完整
// AI 在执行 Skill 后可以运行此脚本进行自检

const fs = require('fs');
const path = require('path');

function validateComponent(componentName) {
  const dir = path.join('src/components', componentName);
  const requiredFiles = ['index.tsx', 'types.ts'];
  const missing = [];

  requiredFiles.forEach(file => {
   if (!fs.existsSync(path.join(dir, file))) {
     missing.push(file);
   }
  });

  if (missing.length > 0) {
   console.error(` 组件 ${componentName} 缺少文件: ${missing.join(', ')}`);
   return false;
  }
  console.log(` 组件 ${componentName} 结构验证通过`);
  return true;
}

// 从命令行参数获取组件名
const componentName = process.argv[2];
if (!componentName) {
  console.error('用法: node validate.js <ComponentName>');
  process.exit(1);
}
validateComponent(componentName);