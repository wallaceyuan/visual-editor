import {useCallback, useEffect, useRef, useState} from "react";

export function useModel<T>(propsValue: T, propsEmitter?: (val: T) => void, config?: { autoWatch?: boolean | undefined, autoEmit?: boolean | undefined }) {

  const current = useRef(propsValue)

  const [, setValue] = useState(() => propsValue)

  useEffect(()=>{
    if(config?.autoWatch !== false){
      setValue(propsValue)
      current.current = propsValue;
    }
  },[propsValue])

  const [ model ] = useState(()=>({
    get value(): T {
      return current.current
    },
    set value(val: T) {
      current.current = val;
      setValue(val)
      if (config?.autoEmit !== false) {
        !!propsEmitter && propsEmitter(val)
      }
    },
    onChange: (val: T | React.ChangeEvent<any>) => {
      if('target' in val){
        model.value = val.target.value
      }else {
        model.value = val
      }
    }
  }))
  return model;
}


const TestUseModelComponent: React.FC<{
  value?: string;
  onChange?: (val?: string) => void;
  inputProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
}> = (props) => {

  const model = useModel( props.value, props.onChange );

  return(
    <input type='text'  {...{
      value: model.value,
      onChange: model.onChange
    }} />
  )
}


export const TestUseModelPage = () => {
  const [text, setText] = useState('hello world' as string | undefined)
  return (
    <div>
      <h4>测试 useModel </h4>
      <TestUseModelComponent value={text} onChange={setText} />
      text:{text}
    </div>
  )
}

