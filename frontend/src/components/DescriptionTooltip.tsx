import React from 'react';
import { RiInformationLine } from 'react-icons/ri';
import { Tooltip } from 'react-tooltip';
import { useMediaQuery } from 'react-responsive';
import { MIX_PATH_DESCRIPTION, ACAPELLA_MATCH_DESCRIPTION } from './constants';

// Main Component
function DescriptionTooltip({ page } : { page: string }) {
  // Media Query Hooks
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Constants
  const tooltipContent = () => {
    switch (page) {
      case 'mix-path':
        return MIX_PATH_DESCRIPTION;
      case 'match':
        return ACAPELLA_MATCH_DESCRIPTION;
      default:
        return '';
    }
  };

  return (
    <div>
      <a
        data-tooltip-id="my-tooltip-id"
        data-tooltip-place={isMobile ? 'bottom' : 'right'}
        data-tooltip-content={tooltipContent()}
      >
        <RiInformationLine color="#FFFFFF" size={25} />
      </a>
      <Tooltip id="my-tooltip-id" style={{ width: '200px', zIndex: 100 }} />
    </div>
  );
}

export default DescriptionTooltip;
