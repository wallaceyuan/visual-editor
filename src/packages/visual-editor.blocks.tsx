import React, { FC, useEffect, useRef } from 'react';
import deepcopy from  'deepcopy';
import classnames from  'classnames';
import { VisualEditorBlockData, VisualEditorConfig } from './visual-editor.utils';

const VisualEditorBlock: FC<{
  block: VisualEditorBlockData;
  config: VisualEditorConfig;
  onMousedownBlock: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, block: VisualEditorBlockData) => void;
  onAdjustBlock: (newBlock: VisualEditorBlockData, oldBlock: VisualEditorBlockData) => void;
}> = ({
  block,
  config,
  onMousedownBlock,
  onAdjustBlock
}) => {

  const el = useRef<HTMLDivElement>(null);

  const component = config.componentMap[block.componentKey];

  const Render = component.render();

  const classname = classnames(
    'visual-editor-block',
    {
      'visual-editor-block-focus': block.focus,
    }
  )

  useEffect(() => {
    const data = deepcopy(block);
    if(el.current && block.adjustPostion === true){
      data.top = data.top - el.current?.offsetHeight / 2;
      data.left = data.left - el.current?.offsetWidth / 2;
      data.adjustPostion = false
      block = {...data};
      onAdjustBlock(data, block)
    }
  },[])

  return(
    <div
      ref={el}
      className={classname}
      style={{ top: block.top, left: block.left, zIndex: 100 }}
      onMouseDown={(e) => onMousedownBlock(e, block)}
    >
      { Render }
    </div>
  );
}

export default VisualEditorBlock;



