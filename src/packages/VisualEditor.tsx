import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import './VisualEditor.less'
import { VisualEditorModelValue, VisualEditorConfig, VisualEditorComponent, createNewBlock, VisualEditorBlockData } from './visual-editor.utils';
import VisualEditorBlock from './visual-editor.blocks';

import { useModel } from './utils/useModel';

interface IVisualEditor{
  jsonData: VisualEditorModelValue;
  config: VisualEditorConfig;
}

const VisualEditor: FC<IVisualEditor> = ({ jsonData, config }) => {

  const containerRef =  useRef<HTMLDivElement>(null);

  const dataModel = useModel(jsonData, () => {} );

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
    updateBlocks: (blocks: VisualEditorBlockData[]) => dataModel.value = { container: dataModel.value.container, blocks },
    updateBlock: (newBlock: VisualEditorBlockData, oldBlock: VisualEditorBlockData) => {
      const blocks = [...dataModel.value.blocks];
      const index = blocks.findIndex(obj => {
        let find = true
        Object.keys(obj).forEach(item => {
          if(obj[item] !== oldBlock[item]){
            find = false
          }
        } )
        return find;
      });
      console.log('index',index, oldBlock, blocks)
      blocks.splice(index, 1, newBlock)
      methods.updateBlocks(blocks)
    },
    clearFocus: (block?: VisualEditorBlockData) => {
      let blocks = (dataModel.value.blocks || []);
      if(blocks.length === 0) return;
      if(!!block){
        blocks = blocks.filter(item => item !== block);
      }
      blocks.forEach(block => block.focus = false)
      methods.updateBlocks(dataModel.value.blocks)
    }
  })

  console.log('dataModel', dataModel.value.blocks);

  const useFocus = () => {
    const getter = useCallback(() => {
      let focus: VisualEditorBlockData[] = [];
      let unfocus: VisualEditorBlockData[] = [];
      (dataModel.value.blocks || []).forEach(block => (block.focus ? focus: unfocus).push(block))
      return {
        focus,
        unfocus
      }
    },[])

    let ref = useRef(getter())

    useEffect(()=>{
      ref.current = getter()
    },[dataModel.value.blocks])

    return ref
  }

  const [ focusData ] = useState(useFocus());

  console.log('focusDatafocusData',focusData.current)

  const [ blockDraggier ] = useState(() => ({
    blockDragData: {
      startX: 0,
      startY: 0,
      startPositionList: [] as { top: number, left: number }[]
    },
    onMousedownBlock: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      console.log('focusData.current',focusData.current)
      blockDraggier.blockDragData = {
        startX: e.clientX,
        startY: e.clientY,
        startPositionList: focusData.current.focus.map(({ top, left }) => ({ top, left })),
      }
      document.addEventListener('mousemove', blockDraggier.mousemove, true)
      document.addEventListener('mouseup', blockDraggier.mouseup, true)
    },
    mousemove: (e: any) => {
      let { startPositionList, startX, startY } = blockDraggier.blockDragData;

      const durX = e.clientX - startX;
      const durY = e.clientY - startY;

      focusData.current.focus.map((block, index)=> {
        const startPosition = startPositionList[index]
        block.top = startPosition.top + durY;
        block.left = startPosition.left + durX
      })

      methods.updateBlocks([...dataModel.value.blocks])
    },
    mouseup: (e: any) => {
      document.removeEventListener('mousemove', blockDraggier.mousemove, true)
      document.removeEventListener('mouseup', blockDraggier.mouseup, true)
    }
  }))

  const [ focusHandler ] = useState(() => {
    return{
      onMousedownContainer: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        (dataModel.value.blocks || []).forEach(block => block.focus = false);
        e.stopPropagation();
        e.preventDefault();
        if (e.currentTarget !== e.target) {
          return
        }
        methods.updateBlocks([...dataModel.value.blocks]);
        methods.clearFocus();
      },
      onMousedownBlock: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, block: VisualEditorBlockData) => {
        e.stopPropagation();
        e.preventDefault();
        if(e.shiftKey){
          if(focusData.current.focus.length <= 1){
            block.focus = true;
          }else{
            block.focus = !block.focus;
          }
        }else{
          if(!block.focus){
            block.focus = true;
            methods.clearFocus(block)
          }
        }
        console.log('dataModel.value.blocks',dataModel.value.blocks)
        methods.updateBlocks([...dataModel.value.blocks])
        blockDraggier.onMousedownBlock(e)
      }
    }
  })

  return(
    <div className='visual-editor'>
      <div className='visual-editor-menu'>
        { config?.componentList.map(component => (
          <div className='visual-editor-menu-item'
            key={component.key}
            draggable={true}
            onDragEnd={componentDraggier.onComponentDragend}
            onDragStart={(e) => componentDraggier.onComponentItemDragStart(component)  }
          >
            <span className='visual-editor-menu-item-label'>
              { component?.label }
            </span>
            <div className='visual-editor-menu-item-content'>
              { component.preview() }
            </div>
          </div>
        )) }
      </div>
      <div className='visual-editor-head'>visual-editor-head</div>
      <div className='visual-editor-operator'>visual-editor-operator</div>
      <div className='visual-editor-body'>
        <div className='visual-editor-content'>
          <div
            onMouseDown={focusHandler.onMousedownContainer}
            ref={containerRef}
            className='visual-editor-container'
            style={{
              width: jsonData?.container.height,
              height: jsonData?.container.width
            }}
          >
            { (dataModel?.value?.blocks ?? []).map((block, index) => (
              <VisualEditorBlock
                block={block}
                key={index}
                config={config}
                onMousedownBlock={focusHandler.onMousedownBlock}
                onAdjustBlock={methods.updateBlock}
              />
            ))  }
          </div>
        </div>
      </div>
    </div>
  )
};

export default VisualEditor;