export interface VisualEditorBlockData {
  top: number;
  left: number;
}

export interface VisualEditorModelValue {
  container: {
    width: number;
    height: number;
  }
  blocks: VisualEditorBlockData[];
}


export interface VisualEditorComponent {
  key: string;
  label: string;
  preview: () => JSX.Element | string;
  render: () => JSX.Element | string;
}

export function createEditorConfig() {
  const componentList: Omit<VisualEditorComponent, 'key'>[] = [];
  const componentMap: Record<string, VisualEditorComponent> = {};

  return {
    componentList,
    componentMap,
    registry: (key: string, component: Omit<VisualEditorComponent, 'key'>) => {
      const comp = { ...component, key }
      componentList.push(comp);
      componentMap[key] = comp;
    }
  }
}

export type VisualEditorConfig = ReturnType<typeof createEditorConfig>