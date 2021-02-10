import { useEffect } from 'react';
import { useCommand } from '../plugins/command.plugin'

export function useVisualCommand() {
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
        return {
          undo: () => {

          },
          redo: () => {

          }
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