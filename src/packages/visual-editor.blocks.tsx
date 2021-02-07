import React, { FC } from 'react';

import { VisualEditorBlockData } from './visual-editor.utils';

const VisualEditorBlock: FC<{ block: VisualEditorBlockData }> = ({ block }) => {


  return(
    <div className='visual-editor-block' style={{ top: block.top, left: block.left }}>
      这是一条blocK
    </div>
  );
}

export default VisualEditorBlock;



