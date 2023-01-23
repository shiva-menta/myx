import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

function FeatureDropdowns() {

    return (
        <div className="feature-dropdowns">
            <DropdownButton className="dropdown" title="Genre">
                <Dropdown.Item href="#/action-1">Pop</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Hip-Hop / Rap</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Rock</Dropdown.Item>
                <Dropdown.Item href="#/action-4">Country</Dropdown.Item>
                <Dropdown.Item href="#/action-5">EDM</Dropdown.Item>
                <Dropdown.Item href="#/action-6">R&B</Dropdown.Item>
                <Dropdown.Item href="#/action-7">Latin</Dropdown.Item>
                <Dropdown.Item href="#/action-8">Metal</Dropdown.Item>
                <Dropdown.Item href="#/action-9">Alternative</Dropdown.Item>
                <Dropdown.Item href="#/action-10">Blues</Dropdown.Item>
            </DropdownButton>
            <DropdownButton className="dropdown" title="Time">
                <Dropdown.Item href="#/action-1">1980s</Dropdown.Item>
                <Dropdown.Item href="#/action-2">1990s</Dropdown.Item>
                <Dropdown.Item href="#/action-3">2000s</Dropdown.Item>
                <Dropdown.Item href="#/action-4">2010s</Dropdown.Item>
                <Dropdown.Item href="#/action-5">2020s</Dropdown.Item>
            </DropdownButton>
            <DropdownButton className="dropdown" title="Key">
                <Dropdown.Item href="#/action-1">Exact</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Tight</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Flexible</Dropdown.Item>
            </DropdownButton>
            <DropdownButton className="dropdown" title="BPM">
                <Dropdown.Item href="#/action-1">Exact</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Tight</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Flexible</Dropdown.Item>
            </DropdownButton>
        </div>
    );
}

export default FeatureDropdowns;