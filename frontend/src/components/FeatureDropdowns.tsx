// Imports
import React, { useState, useEffect } from 'react';
import Stack from 'react-bootstrap/Stack';
import Dropdown from './Dropdown';

type DropdownListType = {
  [key: string]: {
    options: string[];
  };
};
const DropdownList: DropdownListType = require('../jsons/dropdowns.json');

// Props Type
type FeatureDropdownsProps = {
  callback: (value: string[]) => void;
};

// Main Component
function FeatureDropdowns({ callback }: FeatureDropdownsProps) {
  // State Hooks
  const [genreValue, setGenreValue] = useState<string>("");
  const [timeValue, setTimeValue] = useState<string>("");
  const [keyValue, setKeyValue] = useState<string>("");
  const [bpmValue, setBPMValue] = useState<string>("");

  // Dropdowns
  const dropdowns = [
    { name: "Genre", value: genreValue, handler: setGenreValue },
    { name: "Time", value: timeValue, handler: setTimeValue },
    { name: "Key", value: keyValue, handler: setKeyValue },
    { name: "BPM", value: bpmValue, handler: setBPMValue },
  ];

  // Effect Hooks
  useEffect(() => {
    callback([genreValue, timeValue, keyValue, bpmValue]);
  }, [genreValue, timeValue, keyValue, bpmValue]);

  // Render Function
  return (
    <div className="feature-dropdowns">
      <div className="section-title">2. pick acapella parameters...</div>
      <Stack direction="horizontal">
        {dropdowns.map((dropdown) => (
          <Dropdown
            key={dropdown.name}
            name={dropdown.name}
            options={DropdownList[dropdown.name].options}
            handleDropdownChange={(event) => dropdown.handler(event.target.value)}
          />
        ))}
      </Stack>
    </div>
  );
}

export default FeatureDropdowns;