export interface VisualEditorBlock {
  componentKey: string;
  top: number;
  left: number;
  adjustPostion: boolean;
  focus: boolean;
}

export interface VisualEditorModelValue {
  container: {
    width: number;
    height: number;
  }
  blocks: VisualEditorBlock[];
}


export interface VisualEditorComponent {
  key: string;
  label: string;
  preview: () => JSX.Element | string;
  render: () => JSX.Element | string;
}

export function createNewBlock({
  component,
  top,
  left,
}:{
  component: VisualEditorComponent | null ,
  top: number;
  left: number;
}) {
  return {
    top,
    left,
    componentKey: component?.key || '',
    adjustPostion: true,
    focus: false
  }
}

export function createEditorConfig() {
  const componentList: VisualEditorComponent[] = [];
  const componentMap: Record<string, VisualEditorComponent> = {};

  return {
    componentList,
    componentMap,
    registry: (key: string, component: Omit<VisualEditorComponent, 'key'>) => {
      if(componentMap[key]){
        const index = componentList.indexOf(componentMap[key])
        componentList.splice(index, 1)
      }
      const newComponent = { ...component, key }
      componentList.push(newComponent);
      componentMap[key] = newComponent;
    }
  }
}

export type VisualEditorConfig = ReturnType<typeof createEditorConfig>