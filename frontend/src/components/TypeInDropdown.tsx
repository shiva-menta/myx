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
    <div className="z-10">
      <Downshift
        itemToString={(item) => (item ? item.name : '')}
        onChange={onChangeFunc}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          isOpen,
          inputValue,
          highlightedIndex,
        }) => {
          const filteredResults = results.filter((result) => (result.name).toLowerCase().startsWith(inputValue ? inputValue.toLowerCase() : '')).slice(0, 10);

          return (
            <div className="relative">
              <input
                {...getInputProps({
                  placeholder: defaultText || 'Enter a song...',
                  className: 'block w-full p-2 text-lg text-white appearance-none focus:outline-none bg-transparent',
                })}
              />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 animate-pulse" />
              <ul
                {...getMenuProps({
                  className: `${
                    isOpen ? 'block' : 'hidden'
                  } absolute bg-white border border-gray-300 w-full mt-2 text-left z-10`,
                })}
              >
                {isOpen
                  && filteredResults.map((result: any, index: number) => (
                    <li
                      {...getItemProps({
                        key: index,
                        index,
                        item: result,
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
                      {result.name}
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
