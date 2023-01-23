import React from 'react';
import Stack from 'react-bootstrap/Stack'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import DropdownList from '../jsons/dropdowns.json'

function FeatureDropdowns() {
    // Variables
    const dropdowns = [];
    var counter;

    // Executed Code
    for (var category in DropdownList) {
        counter = 0;
        const items = DropdownList[category].options.map((item) => 
            <Dropdown.Item href={`#/action-${counter}`} key={item}>{item}</Dropdown.Item>
        );
        dropdowns.push(<DropdownButton className="feature-dropdown" title={category} key={category}>
            {items}
        </DropdownButton>);
    }

    // Render Function
    return (
        <div className="feature-dropdowns">
            <div className="section-title">acapella parameters</div>
            <Stack direction="horizontal">{dropdowns}</Stack>
        </div>
    );
}

export default FeatureDropdowns;