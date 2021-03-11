import { FC, useEffect, useMemo, useRef } from 'react';
import deepcopy from  'deepcopy';
import classnames from  'classnames';
import { VisualEditorBlock, VisualEditorConfig } from './visual-editor.utils';
import { useUpdate } from './hook/useUpdate';

const ReactVisualEditorBlock: FC<{
  block: VisualEditorBlock;
  config: VisualEditorConfig;
  //onMousedownBlock: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, block: VisualEditorBlockData) => void;
}> = ({
  block,
  config,
  //onMousedownBlock,
}) => {

  const elRef = useRef<HTMLDivElement>(null);

  const component = config.componentMap[block.componentKey];

  const Render = component.render();

  const styles = useMemo(() => {
    return {
      top: block.top,
      left: block.left,
      zIndex: 100,
      opacity: block.adjustPostion ? '0' : ''
    }
  }, [ block.adjustPostion ])

  const classname = classnames(
    'visual-editor-block',
    {
      'visual-editor-block-focus': block.focus,
    }
  )

  const update = useUpdate()


  useEffect(() => {
    const data = deepcopy(block);
    if(elRef.current && block.adjustPostion === true){
      const { top, left } = block;
      const { height, width } = elRef.current?.getBoundingClientRect();
      block.adjustPostion = false;
      block.left = left - width / 2
      block.top = top - height / 2
      update();
    }
  },[])

  return(
    <div
      ref={elRef}
      className={classname}
      style={styles}
      // onMouseDown={(e) => onMousedownBlock(e, block)}
    >
      { Render }
    </div>
  );
}

export default ReactVisualEditorBlock;



