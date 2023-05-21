import React from 'react';
import { MixInstructionData } from '../utils/types';

// Type Declarations
type ColumnDefault = {
  name: string;
  value: string;
}

type MixPathTableProps = {
  tableDefaults: ColumnDefault[];
  instructionList: MixInstructionData[];
};

// Main Component
function MixPathTable({ tableDefaults, instructionList }: MixPathTableProps) {
  return (
    <table>
      <thead>
        <tr>
          {tableDefaults.map((item, idx) => (
            <th key={idx}>
              {item.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {instructionList.map((instruction, index) => (
          <tr key={index}>
            {tableDefaults.map((item, idx) => (
              <td key={idx}>
                {item.value === 'artists'
                  ? instruction[item.value as keyof MixInstructionData]
                  : (instruction[item.value as keyof MixInstructionData] as string[]).join(', ')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MixPathTable;