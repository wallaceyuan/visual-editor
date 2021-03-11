import { useState } from 'react';
import { Button, Input } from 'antd';

// import logo from './logo.svg';
import VisualEditor from './packages/VisualEditor';

import { TestUseModelPage } from './packages/utils/useModel';

import './App.css';

import { VisualEditorConfig, createEditorConfig } from './packages/visual-editor.utils';

const visualConfig = createEditorConfig();

visualConfig.registry('text', {
  label: '文本',
  preview: () => '文本',
  render: () => '渲染文本'
})

visualConfig.registry('button', {
  label: '按钮',
  preview: () => <Button>预览按钮</Button>,
  render: () => <Button>渲染按钮</Button>
})

visualConfig.registry('input', {
  label: '输入框',
  preview: () => <Input placeholder='预览输入框' />,
  render: () => <Input placeholder='渲染输入框' />
})


function App() {

  const [ data, setData ] = useState({
    container: {
      height: 700,
      width: 1000
    },
    blocks: [
      {
        componentKey: 'input',
        top: 100,
        left: 100,
        adjustPostion: false,
        focus: false
      },
      {
        componentKey: 'button',
        top: 200,
        left: 200,
        adjustPostion: false,
        focus: true
      }
    ]
  } as any);

  const [ config, setConfig ] = useState<VisualEditorConfig>(visualConfig);


  return (
    <div className="App">
      这是组件
      <VisualEditor
        value={data}
        config={config}
        onChange={setData}
      />
    </div>
  );
}

export default App;
