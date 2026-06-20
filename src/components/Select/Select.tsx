import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

import { Dot } from '../../svg/dot.jsx';

import './Select.css';

export type SelectHandle = {
  open: () => void; 
}

export type SelectProps = {
  options : any; 
  onChange? : (arg: string) => void;
  onHighlight? : (arg: number) => void;
  value? : string | null;
}

export const Select = forwardRef<SelectHandle, SelectProps>(function Select({
  options, 
  onChange, 
  onHighlight, 
  value = null
} : SelectProps, ref) {
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string|null>(value);
  const [highlightedOption, setHighlightedOption] = useState<number>(0);

  const selectOptionsCount = Object.keys(options).length;

  const updateType = (type : string) => {
    setSelectedOption(type);
    setSelectOpen(false);
    onChange?.(type);
  }

  const updateHighlightedOption = (index : number) => {
    setHighlightedOption(index);
    onHighlight?.(index);
  }

  useEffect(() => {
    const keydownCheck = (e : KeyboardEvent) => {
      if (selectOpen) {
        e.preventDefault();
        e.stopPropagation();
        if (e.code == 'ArrowDown') {
          setHighlightedOption(prev => (prev + 1) % selectOptionsCount);
        } else if (e.code === 'ArrowUp') {
          setHighlightedOption(prev => prev - 1 < 0 ? selectOptionsCount - 1 : prev - 1);
        } else if (e.code === 'Enter') {
          if (!!options) {
            updateType(Object.keys(options)[highlightedOption]);
            onChange?.(Object.keys(options)[highlightedOption]);
          }
        } else if (e.code === 'Escape') {
          setSelectOpen(false);
        }
      }
    }

    window.addEventListener('keydown', keydownCheck);

    return () => {
      window.removeEventListener('keydown', keydownCheck);
    };
  }, [selectOpen, highlightedOption]);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  useImperativeHandle(ref, () => ({
    open: () => {
      setSelectOpen(true);
    }
  }),[setSelectOpen]);
  
  return (
    <div className="selectbox">
      <div className="active-option" onClick={(e) => {
        e.stopPropagation();
        setSelectOpen(!selectOpen);
      }}>
        {selectedOption && options[selectedOption]
          ? options[selectedOption] 
          : <Dot />
        }
      </div>
      <div className="select-options" data-open={selectOpen}>
        {Object.keys(options).map((selectOption, index) => (
          <div className="select-option" 
            key={`select-${selectOption}`}
            data-selected={highlightedOption === index}
            onClick={() => updateType(selectOption)}
            onMouseEnter={() => updateHighlightedOption(index)}>
            {options[selectOption]}
          </div>
        ))}
      </div>
    </div>
  )
});