import React, { FC, useRef } from 'react';

import './VisualEditor.less'
import { VisualEditorModelValue, VisualEditorConfig, VisualEditorComponent } from './visual-editor.utils';
import VisualEditorBlock from './visual-editor.blocks';

import { useModel } from './utils/useModel';

interface IVisualEditor{
  jsonData: VisualEditorModelValue;
  config: VisualEditorConfig;
}

const VisualEditor: FC<IVisualEditor> = ({ jsonData, config }) => {

  const containerRef =  useRef<HTMLDivElement>(null);

  const dataModel = useModel(jsonData, () => {} );

  console.log('dataModel',dataModel);

  const menuDraggier = (() =>{
    let current = null as null | Omit<VisualEditorComponent, 'key'>

    const blockHander = {
      dragstart: (e: any, component: Omit<VisualEditorComponent, 'key'>) => {
        containerRef.current?.addEventListener('dragenter', containerHander.dragenter)
        containerRef.current?.addEventListener('dragover', containerHander.drag)
        containerRef.current?.addEventListener('dragleave', containerHander.dragleave)
        containerRef.current?.addEventListener('drop', containerHander.drop)
        current = component;
      },
      dragend: (ev: any) => {
        containerRef.current?.removeEventListener('dragenter', containerHander.dragenter)
        containerRef.current?.removeEventListener('dragover', containerHander.dragover)
        containerRef.current?.removeEventListener('dragleave', containerHander.dragleave)
        containerRef.current?.removeEventListener('drop', containerHander.drop)
        current = null;
      },
    }

    const containerHander = {
      current: {
        component: null as null | Omit<VisualEditorComponent, "key">,
      },
      drag: (ev: any) => {
        ev.preventDefault();
      },
      dragenter: (ev: any) => {
        if(ev?.dataTransfer?.dropEffect){
          ev.dataTransfer.dropEffect = 'move'
        }
      },
      dragover: (ev: any) => {
        ev.preventDefault();
      },
      dragleave: (ev: any) => {
        if(ev?.dataTransfer?.dropEffect){
          ev.dataTransfer.dropEffect = 'none'
        }
      },
      dragend: (ev: any) => {
        containerRef.current?.removeEventListener('dragenter', containerHander.dragenter)
        containerRef.current?.removeEventListener('dragover', containerHander.dragover)
        containerRef.current?.removeEventListener('dragleave', containerHander.dragleave)
        containerRef.current?.removeEventListener('drop', containerHander.drop)
      },
      drop: (ev: any) => {
        console.log('drop', current)
        const blocks = [...dataModel.value.blocks ] || [];
        blocks.push({
          top: ev.offsetX,
          left: ev.offsetY
        })
        dataModel.value = {
          ...dataModel.value,
          blocks: blocks
        };
      }
    }
    return blockHander;
  });

  return(
    <div className='visual-editor'>
      <div className='visual-editor-menu'>
        { config?.componentList.map(component => (
          <div className='visual-editor-menu-item'
            draggable={true}
            onDrop={menuDraggier().dragend}
            onDragEnd={(e) => {
              const event = e as React.DragEvent<HTMLDivElement>;
              menuDraggier().dragstart(event, component)
            }  }
            onDragStart={(e) => menuDraggier().dragstart(e, component)  }
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
            ref={containerRef}
            className='visual-editor-container'
            style={{
              width: jsonData?.container.height,
              height: jsonData?.container.width
            }}
          >
            { (dataModel?.value?.blocks ?? []).map((block, index) => (
              <VisualEditorBlock block={block} key={index} />
            ))  }
          </div>
        </div>
      </div>
    </div>
  )
};

export default VisualEditor;