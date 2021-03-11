import { useEffect } from 'react';
import { VisualEditorBlockData, VisualEditorModelValue } from '../visual-editor.utils';

import { useCommand } from '../plugins/command.plugin'

export function useVisualCommand({
  methods,
  focusData,
  dataModel
}:{
  methods:{
    updateBlocks: (blocks: VisualEditorBlockData[]) => void
  },
  dataModel: {
    value: VisualEditorModelValue;
    onChange: (val: VisualEditorModelValue | React.ChangeEvent<any>) => void;
  },
  focusData: { focus: VisualEditorBlockData[], unfocus: VisualEditorBlockData[]  }
}) {
  const comander = useCommand();

  useEffect(()=>{
    comander.registry({
      name: 'delete',
      keyboard: [
        'backspace',
        'delete',
        'ctrl+d'
      ],
      execute: () => {
        let data ={
          before: dataModel.value.blocks,
          after: focusData.unfocus,
        }
        return {
          redo: () => {
            console.log('重做删除命令')
            methods.updateBlocks(data.after);
          },
          undo: () => {
            console.log('撤回删除命令')
            methods.updateBlocks(data.before);
          },
        }

      }
    })
  },[])


  return {
    undo: () => comander.state.commands.undo(),
    redo: () => comander.state.commands.redo(),
    delete: () => comander.state.commands.delete(),
  }
}