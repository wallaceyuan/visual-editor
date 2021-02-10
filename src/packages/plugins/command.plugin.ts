import { useState, useCallback, useEffect } from 'react';
export interface CommandExecute{
  undo?: () => void;
  redo: () => void;
}

export interface Command{
  name: string;
  keyboard: string | string[];
  execute: (...args: any[]) => CommandExecute;
  followQueue?: boolean;
}

// export interface CommandManager {
//   queue: CommandExecute[];
//   current: number;

// }

export function useCommand() {

  const [ state ] = useState({
    current: -1,
    commands: {} as Record<string, (...args: any[]) => void>,
    queue: [] as CommandExecute[],
  })

  const registry = useCallback((command: Command) => {
    state.commands[command.name] = (...args) => {
      const { undo, redo } = command.execute(...args)
      state.queue.push({ undo, redo })
      state.current += 1;
    }
  },[])



  useEffect(() => {
    registry({
      name: 'undo',
      keyboard: 'ctrl+z',
      execute: () => {
        // 命令被执行的时候，要做的事情
        return{
          redo: () => {
            // 重新做一遍，要做的事情
            let { current } = state;
            if( current === -1 ) return
            const { undo } = state.queue[current]
            !!undo && undo()
            state.current -= -1
          }
        }
      }
    })

    registry({
      name: 'redo',
      keyboard: [
        'ctrl+y',
        'ctrl+shift+z',
      ],
      followQueue: false,
      execute: () => {
        // 命令被执行的时候，要做的事情
        return{
          redo: () => {
            // 重新做一遍，要做的事情
            let { current } = state;
            if(!state.queue[current]) return
            const { redo } = state.queue[current]
            redo()
            state.current += 1;
          }
        }
      }
    })
  },[])

  return {
    state,
    registry
  }
}