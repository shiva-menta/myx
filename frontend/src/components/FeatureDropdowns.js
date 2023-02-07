import React, { useState, useEffect } from 'react';
import Stack from 'react-bootstrap/Stack'
import DropdownList from '../jsons/dropdowns.json'
import Form from 'react-bootstrap/Form';

function FeatureDropdowns({callback}) {
    // Variables
    const dropdowns = [];
    var items = [];

    // State Hooks
    const [genreValue, setGenreValue] = useState("");
    const [timeValue, setTimeValue] = useState("");
    const [keyValue, setKeyValue] = useState("");
    const [bpmValue, setBPMValue] = useState("");

    useEffect(() => {
        callback([genreValue, timeValue, keyValue, bpmValue])
    }, [genreValue, timeValue, keyValue, bpmValue])

    // onChanges
    const handleGenreChange = (event) => {
        setGenreValue(event.target.value)
    }
    const handleTimeChange = (event) => {
        setTimeValue(event.target.value)
    }
    const handleKeyChange = (event) => {
        setKeyValue(event.target.value)
    }
    const handleBPMChange = (event) => {
        setBPMValue(event.target.value)
    }

    // Executed Code
    items = DropdownList["Genre"].options.map((item) => 
        <option key={item} value={item}>{item}</option>
    );
    dropdowns.push(<Form.Select className="feature-dropdown arrow-color" onChange={handleGenreChange}>
        <option value="">Genre</option>
        {items}
    </Form.Select>);

    items = [];
    items = DropdownList["Time"].options.map((item) => 
        <option key={item} value={item.slice(0, 4)}>{item}</option>
    );
    dropdowns.push(<Form.Select className="feature-dropdown" onChange={handleTimeChange}>
        <option value="">Time</option>
        {items}
    </Form.Select>);

    items = [];
    items = DropdownList["Key"].options.map((item) => 
        <option key={item} value={item}>{item}</option>
    );
    dropdowns.push(<Form.Select className="feature-dropdown" onChange={handleKeyChange}>
        <option value="">Key</option>
        {items}
    </Form.Select>);

    items = [];
    items = DropdownList["BPM"].options.map((item) => 
        <option key={item} value={item}>{item}</option>
    );
    dropdowns.push(<Form.Select className="feature-dropdown" onChange={handleBPMChange}>
        <option value="">BPM</option>
        {items}
    </Form.Select>);

    

    // Render Function
    return (
        <div className="feature-dropdowns">
            <div className="section-title">2. pick acapella parameters...</div>
            <Stack direction="horizontal">{dropdowns}</Stack>
        </div>
    );
}

export default FeatureDropdowns;