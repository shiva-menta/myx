import React from 'react';
import Downshift from 'downshift';
import { PlaylistTrackData } from '../utils/types';

// Type Declarations
type TypeInDropdownProps = {
  onChangeFunc: (arg0: any) => void;
  results: PlaylistTrackData[];
  defaultText: string;
};

// Main Component
function TypeInDropdown({ onChangeFunc, results, defaultText }: TypeInDropdownProps) {
  return (
    <div className="typeindropdown">
      <Downshift
        itemToString={(item) => (item ? item.result.name : '')}
        onChange={(item) => {
          if (item) {
            onChangeFunc(item.originalIndex);
          }
        }}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          isOpen,
          inputValue,
          highlightedIndex,
        }) => {
          const filteredResults = results
            .map((result, index) => ({ result, originalIndex: index }))
            .filter(({ result }) => result.name.toLowerCase().startsWith(inputValue ? inputValue.toLowerCase() : ''))
            .slice(0, 10);

          return (
            <div className="dropdown-container">
              <input
                {...getInputProps({
                  placeholder: defaultText || 'Enter a song...',
                  className: 'dropdown-text-container',
                })}
              />
              <div className="dropdown-line" />
              <ul
                {...getMenuProps({
                  className: `${
                    isOpen ? 'block' : 'hidden'
                  } dropdown-text-box`,
                  style: {
                    listStyleType: 'none',
                  },
                })}
              >
                {isOpen
                  && filteredResults.map((item: any, index: number) => (
                    <li
                      {...getItemProps({
                        key: index,
                        index,
                        item,
                        style: {
                          backgroundColor:
                            highlightedIndex === index
                              ? 'lightgray'
                              : 'white',
                          fontWeight:
                            highlightedIndex === index
                              ? 'bold'
                              : 'normal',
                          padding: '2',
                          cursor: 'pointer',
                        },
                      })}
                    >
                      {item.result.name}
                    </li>
                  ))}
              </ul>
            </div>
          );
        }}
      </Downshift>
    </div>
  );
}

export default TypeInDropdown;
