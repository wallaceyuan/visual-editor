import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from 'antd';

import './VisualEditor.scss'
import { VisualEditorModelValue, VisualEditorConfig, VisualEditorComponent, createNewBlock, VisualEditorBlock } from './visual-editor.utils';
import ReactVisualEditorBlock from './visual-editor.blocks';

import { useModel } from './utils/useModel';
import { useVisualCommand } from './utils/visual.command';

import { useCallbackRef } from './hook/useCallbackRef';
import {createEvent} from "./plugins/event";

interface IVisualEditor{
  value: VisualEditorModelValue;
  config: VisualEditorConfig;
  onChange: (val: VisualEditorModelValue) => void,
}

const VisualEditor: FC<IVisualEditor>
  = (props) => {

  const [dragstart] = useState(() => createEvent())
  const [dragend] = useState(() => createEvent())
  const [preview, setPreview] = useState(false)
  const [selectIndex, setSelectIndex] = useState(-1)

  const containerRef =  useRef<HTMLDivElement>(null);

  const dataModel = useModel(props.value, () => {} );

  const [componentDraggier] = useState(() => ({
    dragComponent: null as null | VisualEditorComponent,
    onComponentItemDragStart: (component: VisualEditorComponent) => {
      componentDraggier.dragComponent = component;
      containerRef.current?.addEventListener('dragenter', componentDraggier.onDragEnterContainer)
      containerRef.current?.addEventListener('dragover', componentDraggier.onDragOverContainer)
      containerRef.current?.addEventListener('dragleave', componentDraggier.onDragLeaveContainer)
      containerRef.current?.addEventListener('drop', componentDraggier.onDropContainer)
    },
    onComponentDragend: () => {
      componentDraggier.dragComponent = null;
      containerRef.current?.removeEventListener('dragenter', componentDraggier.onDragEnterContainer)
      containerRef.current?.removeEventListener('dragover', componentDraggier.onDragOverContainer)
      containerRef.current?.removeEventListener('dragleave', componentDraggier.onDragLeaveContainer)
      containerRef.current?.removeEventListener('drop', componentDraggier.onDropContainer)
    },
    drag: (ev: any) => {
      ev.preventDefault();
    },
    onDragEnterContainer: (ev: any) => {
      if(ev?.dataTransfer?.dropEffect){
        ev.dataTransfer.dropEffect = 'move'
      }
    },
    onDragOverContainer: (ev: any) => {
      ev.preventDefault();
    },
    onDragLeaveContainer: (ev: any) => {
      if(ev?.dataTransfer?.dropEffect){
        ev.dataTransfer.dropEffect = 'none'
      }
    },
    onDropContainer: (ev: any) => {
      const blocks = [...dataModel.value.blocks ] || [];
      blocks.push(createNewBlock({
        component: componentDraggier?.dragComponent,
        top: ev.offsetY,
        left: ev.offsetX,
      }))
      dataModel.value = {
        ...dataModel.value,
        blocks: blocks
      };
    }
  }));

  const [ methods ] = useState({
    updateBlocks: (blocks: VisualEditorBlock[]) => dataModel.value = { container: dataModel.value.container, blocks },
    updateBlock: (newBlock: VisualEditorBlock, oldBlock: VisualEditorBlock) => {
      const blocks = [...dataModel.value.blocks];
      const index = blocks.findIndex(obj => {
        let find = true
        // Object.keys(obj).forEach(item => {
        //   if(obj[item] !== oldBlock[item]){
        //     find = false
        //   }
        // } )
        return find;
      });
      blocks.splice(index, 1, newBlock)
      methods.updateBlocks(blocks)
    },
    clearFocus: (block?: VisualEditorBlock) => {
      let blocks = (dataModel.value.blocks || []);
      if(blocks.length === 0) return;
      if(!!block){
        blocks = blocks.filter(item => item !== block);
      }
      blocks.forEach(block => block.focus = false)
      methods.updateBlocks(dataModel.value.blocks)
    }
  })

  const focusData = useMemo(() => {
    let focus: VisualEditorBlock[] = [];
    let unfocus: VisualEditorBlock[] = [];
    (props.value.blocks || []).forEach(block => (block.focus ? focus: unfocus).push(block))
    return {
      focus,
      unfocus
    }
  },[props.value.blocks])

  const [pos, setPos] = useState({
    left: 0,
    top: 0
  })

  const useMenuDraggier = () => {
    const dragData = useRef({dragComponent: null as null | VisualEditorComponent,})
    const container = {
      dragenter: useCallbackRef((e: DragEvent) => e.dataTransfer!.dropEffect = 'move'),
      dragover: useCallbackRef((e: DragEvent) => e.preventDefault()),
      dragleave: useCallbackRef((e: DragEvent) => e.dataTransfer!.dropEffect = 'none'),
      drop: useCallbackRef((e: DragEvent) => {
        const {offsetX, offsetY} = e
        const blocks = [...props.value.blocks]
        blocks.push(createNewBlock({
          component: dragData.current.dragComponent!,
          top: offsetY,
          left: offsetX,
        }))
        props.onChange({
          ...props.value,
          blocks,
        })
        setTimeout(() => dragend.emit())
      })
    }
    const component = {
      dragstart: useCallbackRef((current: VisualEditorComponent) => {
        dragData.current.dragComponent = current
        containerRef.current!.addEventListener('dragenter', container.dragenter)
        containerRef.current!.addEventListener('dragover', container.dragover)
        containerRef.current!.addEventListener('dragleave', container.dragleave)
        containerRef.current!.addEventListener('drop', container.drop)
        dragstart.emit()
      }),
      dragend: useCallbackRef(() => {
        dragData.current.dragComponent = null
        containerRef.current!.removeEventListener('dragenter', container.dragenter)
        containerRef.current!.removeEventListener('dragover', container.dragover)
        containerRef.current!.removeEventListener('dragleave', container.dragleave)
        containerRef.current!.removeEventListener('drop', container.drop)
      })
    }
    return component
  }

  const menuDraggier = useMenuDraggier();



    const blockDraggier = (() => {
        const dragData = useRef({
            startX: 0,
            startY: 0,
            startLeft: 0,
            startTop: 0,
            startPos: [] as { top: number, left: number }[],
            dragging: false,
            //markLines: {} as VisualEditorMarkLines,
        })
        const mousedown = useCallbackRef((e: MouseEvent, block: VisualEditorBlock) => {
            dragData.current = {
                startX: e.clientX,
                startY: e.clientY,
                startLeft: block.left,
                startTop: block.top,
                startPos: (() => focusData.focus.map(({top, left}) => ({top, left})))(),
                dragging: false,
              //   markLines: (() => {
              //       const {unFocus} = focusData
              //       const {width, height} = selectBlock!
              //       let lines: VisualEditorMarkLines = {x: [], y: []};
              //       [...unFocus, {
              //           top: 0,
              //           left: 0,
              //           width: props.value.container.width,
              //           height: props.value.container.height,
              //       }].forEach(block => {
              //           const {top: t, left: l, width: w, height: h} = block
              //           lines.y.push({top: t, showTop: t})                              // 顶部对其顶部
              //           lines.y.push({top: t + h, showTop: t + h})                      // 顶部对其底部
              //           lines.y.push({top: t + h / 2 - height / 2, showTop: t + h / 2}) // 中间对其中间（垂直）
              //           lines.y.push({top: t - height, showTop: t})                     // 底部对其顶部
              //           lines.y.push({top: t + h - height, showTop: t + h})             // 底部对其底部

              //           lines.x.push({left: l, showLeft: l})                              // 顶部对其顶部
              //           lines.x.push({left: l + w, showLeft: l + w})                      // 顶部对其底部
              //           lines.x.push({left: l + w / 2 - width / 2, showLeft: l + w / 2}) // 中间对其中间（垂直）
              //           lines.x.push({left: l - width, showLeft: l})                     // 底部对其顶部
              //           lines.x.push({left: l + w - width, showLeft: l + w})             // 底部对其底部
              //       })
              //       return lines
              //   }
              // )(),
            }
            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        })

        const [mark, setMark] = useState({
            x: null as null | number,
            y: null as null | number,
        })

        const mousemove = useCallbackRef((e: MouseEvent) => {
            if (!dragData.current.dragging) {
                dragData.current.dragging = true
                dragstart.emit()
            }
            let {clientX: moveX, clientY: moveY} = e
            let {startX, startY} = dragData.current

            if (e.shiftKey) {
                if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) {
                    moveY = startY
                } else {
                    moveX = startX
                }
            }

            const currentLeft = dragData.current.startLeft + moveX - startX
            const currentTop = dragData.current.startTop + moveY - startY
            const currentMark = {
                x: null as null | number,
                y: null as null | number
            }
            // for (let i = 0; i < dragData.current.markLines.y.length; i++) {
            //     const {top, showTop} = dragData.current.markLines.y[i];
            //     if (Math.abs(top - currentTop) < 5) {
            //         moveY = top + startY - dragData.current.startTop
            //         currentMark.y = showTop
            //         break
            //     }
            // }
            // for (let i = 0; i < dragData.current.markLines.x.length; i++) {
            //     const {left, showLeft} = dragData.current.markLines.x[i];
            //     if (Math.abs(left - currentLeft) < 5) {
            //         moveX = left + startX - dragData.current.startLeft
            //         currentMark.x = showLeft
            //         break
            //     }
            // }

            const durX = moveX - startX
            const durY = moveY - startY
            focusData.focus.forEach((block, index) => {
                block.top = dragData.current.startPos[index].top + durY
                block.left = dragData.current.startPos[index].left + durX
            })
            methods.updateBlocks(props.value.blocks)
            setMark({
                x: currentMark.x,
                y: currentMark.y,
            })
        })
        const mouseup = useCallbackRef((e: MouseEvent) => {
            document.removeEventListener('mousemove', mousemove)
            document.removeEventListener('mouseup', mouseup)
            setMark({x: null, y: null})
            if (dragData.current.dragging) {
                dragend.emit()
            }
        })
        return {
            mousedown,
            mark,
        }
    })();

  // const blockDraggier = (() => {
  //   const dragData = useRef({
  //     startX: 0,
  //     startY: 0,
  //     startTop: 0,
  //     startLeft: 0
  //   })

  //   const mousedown = (e: React.MouseEvent<HTMLDivElement>) => {
  //     console.log('focusData.current',focusData.current)
  //     document.addEventListener('mousemove', mousemove, true)
  //     document.addEventListener('mouseup', mouseup, true)
  //     dragData.current = {
  //       startX: e.clientX,
  //       startY: e.clientY,
  //       startTop: pos.top,
  //       startLeft: pos.left
  //     }
  //   }
  //   const mousemove = (e: any) => {
  //     let { startTop, startLeft, startX, startY } = dragData.current;

  //     const durX = e.clientX - startX;
  //     const durY = e.clientY - startY;

  //     // focusData.current.focus.map((block, index)=> {
  //     //   const startPosition = startPositionList[index]
  //     //   block.top = startPosition.top + durY;
  //     //   block.left = startPosition.left + durX
  //     // })
  //     //methods.updateBlocks([...dataModel.value.blocks])
  //     setPos({
  //       top: startTop + durY,
  //       left: startLeft + durX
  //     })
  //   }
  //   const mouseup = useCallbackRef((e: any) => {
  //     document.removeEventListener('mousemove', mousemove, true)
  //     document.removeEventListener('mouseup', mouseup, true)
  //   })
  //   return{
  //     mousedown
  //   }
  // })();

    const focusHandler = (() => {
        const container = {
            mousedown: (e: React.MouseEvent<HTMLDivElement>) => {
                if (preview) return;
                e.preventDefault()
                if (e.currentTarget !== e.target) {
                    return
                }
                if (!e.shiftKey) {
                    /*点击空白处，清空所有选中的block*/
                    methods.clearFocus()
                    setSelectIndex(-1)
                }
            }
        }
        const block = {
            mousedown: (e: React.MouseEvent<HTMLDivElement>, block: VisualEditorBlock, index: number) => {
                if (preview) return;
                if (e.shiftKey) {
                    /*如果摁住了shift键，如果此时没有选中的block，就选中这个block，否则令这个block的选中状态去翻*/
                    if (focusData.focus.length <= 1) {
                        block.focus = true
                    } else {
                        block.focus = !block.focus
                    }
                    methods.updateBlocks(props.value.blocks)
                } else {
                    /*如果点击的这个block没有被选中，才清空这个其他选中的block，否则不做任何事情。放置拖拽多个block，取消其他block的选中状态*/
                    if (!block.focus) {
                        block.focus = true
                        methods.clearFocus(block)
                    }
                }
                setSelectIndex(index)
                // blockDraggier.mousedown(e.nativeEvent, block)
                // 等待 focusData 重新计算之后再出发拖拽移动
                setTimeout(() => blockDraggier.mousedown(e.nativeEvent, block))
            }
        }
        return {
            container,
            block,
        }
    })();

  // const commander = useVisualCommand({
  //   methods,
  //   focusData: focusData.current,
  //   dataModel
  // });

  // const buttons = useRef([
  //     {label: '撤销', icon: 'icon-back', handler: commander.undo, tip: 'ctrl+z'},
  //     {label: '重做', icon: 'icon-forward', handler: commander.redo, tip: 'ctrl+y, ctrl+shift+z'},
  //     // {
  //     //     label: () => previewModel.value ? '编辑' : '预览',
  //     //     icon: () => previewModel.value ? 'icon-edit' : 'icon-browse',
  //     //     handler: () => {
  //     //         if (!previewModel.value) {methods.clearFocus()}
  //     //         previewModel.value = !previewModel.value
  //     //     },
  //     // },
  //     // {
  //     //     label: '导入', icon: 'icon-import', handler: async () => {
  //     //         const text = await $dialog.textarea('', {title: '请输入导入的JSON数据'})
  //     //         if (!text) {return}
  //     //         try {
  //     //             const data = JSON.parse(text)
  //     //             commander.updateModelValue(data)
  //     //         } catch (e) {
  //     //             ElNotification({
  //     //                 title: '导入失败！',
  //     //                 message: '导入的数据格式不正常，请检查！'
  //     //             })
  //     //         }
  //     //     }
  //     // },
  //     // {label: '导出', icon: 'icon-export', handler: () => $dialog.textarea(JSON.stringify(dataModel.value), {title: '导出的JSON数据', editReadonly: true})},
  //     // {label: '置顶', icon: 'icon-place-top', handler: () => commander.placeTop(), tip: 'ctrl+up'},
  //     // {label: '置底', icon: 'icon-place-bottom', handler: () => commander.placeBottom(), tip: 'ctrl+down'},
  //     {label: '删除', icon: 'icon-delete', handler: () => commander.delete(), tip: 'ctrl+d, backspace, delete'},
  //     // {label: '清空', icon: 'icon-reset', handler: () => commander.clear()},
  //     // {
  //     //     label: '关闭', icon: 'icon-close', handler: () => {
  //     //         methods.clearFocus()
  //     //         setEditFlag(false)
  //     //     },
  //     // },
  // ])
  const containerStyles = useMemo(() => ({
      width: `${props.value.container.width}px`,
      height: `${props.value.container.height}px`,
  }), [props.value.container])

  return(
    <div className='visual-editor'>
      <div className='visual-editor-menu'>
        { props.config?.componentList.map(component => (
          <div className='visual-editor-menu-component'
            key={component.key}
            draggable={true}
            onDragEnd={menuDraggier.dragend }
            onDragStart={() => menuDraggier.dragstart(component)}
          >
            <span className='visual-editor-menu-component-name'>
              { component?.label }
            </span>
            <div className='visual-editor-menu-item-content'>
              { component.preview() }
            </div>
          </div>
        )) }
      </div>
      <div className='visual-editor-head'>
        {/* <ul>
            {buttons.current.map((btn, index) => {
                let {icon, label, tip} = btn
                // if (typeof label === "function") {label = label()}
                // if (typeof icon === "function") {icon = icon()}
                const Content = (<li key={index} onClick={() => !!btn.handler && btn.handler()}>
                    <i className={`iconfont ${icon}`}/>
                    <span>{label}</span>
                </li>)
                return !!tip ? <Tooltip title={tip} key={index} placement="bottom">{Content}</Tooltip> : Content
            })}
        </ul> */}
      </div>
      <div className='visual-editor-operator'>visual-editor-operator</div>
      <div className='visual-editor-body'>
        <div className='visual-editor-content'>
          <div className='visual-editor-container'
            ref={containerRef}
            style={containerStyles}
          >
            { (props?.value?.blocks ?? []).map((block, index) => (
              <ReactVisualEditorBlock
                block={block}
                key={index}
                config={props.config}
                // onMousedownBlock={focusHandler.onMousedownBlock}
              />
            ))  }
          </div>
        </div>
      </div>
    </div>
  )
};

export default VisualEditor;