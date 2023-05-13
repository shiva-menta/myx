// Imports
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
        <option key={option} value={name !== 'Time' ? option : option.slice(0, 4)}>{option}</option>
      ))}
    </Form.Select>
  );
};

export default Dropdown;