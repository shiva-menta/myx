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
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {tableDefaults.map((item, idx) => (
              <th key={item.name}>
                {item.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {instructionList.map((instruction, index) => (
            <tr key={instruction.song_name}>
              {tableDefaults.map((item, idx) => (
                <td key={item.value}>
                  {item.value !== 'artists'
                    ? instruction[item.value as keyof MixInstructionData]
                    : (instruction[item.value as keyof MixInstructionData] as string[]).join(', ')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MixPathTable;
