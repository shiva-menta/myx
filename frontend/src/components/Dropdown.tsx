// Imports
import React from 'react';
import Form from 'react-bootstrap/Form';

// Props Type
type DropdownProps = {
  name: string;
  options: string[];
  handleDropdownChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

// Main Component
function Dropdown({ name, options, handleDropdownChange }: DropdownProps) {
  // Render Function
  return (
    <Form.Select className="feature-dropdown" onChange={handleDropdownChange}>
      <option value="">{name}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </Form.Select>
  );
}

export default Dropdown;
