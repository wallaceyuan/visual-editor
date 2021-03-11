import { createEditorConfig } from './visual-editor.utils';
import { Button, Input } from 'antd';

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
  render: () => <Input placeholder='预览输入框' />
})


const VisualConfig = () => {
  return(
    <>11</>
  )
}

export default VisualConfig;