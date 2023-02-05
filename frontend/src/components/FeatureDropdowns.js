import React, { useState } from 'react';
import Stack from 'react-bootstrap/Stack'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import DropdownList from '../jsons/dropdowns.json'
import Form from 'react-bootstrap/Form';

function FeatureDropdowns() {
    // Variables
    const dropdowns = [];
    var items = [];

    // State Hooks
    const [genreValue, setGenreValue] = useState("");
    const [timeValue, setTimeValue] = useState("");
    const [keyValue, setKeyValue] = useState("");
    const [bpmValue, setBpmValue] = useState("");

    // Executed Code
    items = DropdownList["Genre"].options.map((item) => 
        <option key={item} value={item}>{item}</option>
    );
    dropdowns.push(<Form.Select className="feature-dropdown arrow-color">
        <option>Genre</option>
        {items}
    </Form.Select>);

    items = [];
    items = DropdownList["Time"].options.map((item) => 
        <option key={item} value={item}>{item}</option>
    );
    dropdowns.push(<Form.Select className="feature-dropdown">
        <option>Time</option>
        {items}
    </Form.Select>);

    items = [];
    items = DropdownList["Key"].options.map((item) => 
        <option key={item} value={item}>{item}</option>
    );
    dropdowns.push(<Form.Select className="feature-dropdown">
        <option>Key</option>
        {items}
    </Form.Select>);

    items = [];
    items = DropdownList["BPM"].options.map((item) => 
        <option key={item} value={item}>{item}</option>
    );
    dropdowns.push(<Form.Select className="feature-dropdown">
        <option>BPM</option>
        {items}
    </Form.Select>);

    

    // Render Function
    return (
        <div className="feature-dropdowns">
            <div className="section-title">acapella parameters</div>
            <Stack direction="horizontal">{dropdowns}</Stack>
        </div>
    );
}

export default FeatureDropdowns;