import { X } from "lucide-react";
import React from "react";

interface ChipsProps {
  displayName: string;
  handleRemove?: (value: string) => void;
}

const Chips: React.FC<ChipsProps> = ({ displayName, handleRemove }) => {
  return (
    <div className="flex flex-row justify-between items-center gap-4 border rounded-full px-4 py-1 text-sm dark:text-light-background text-dark-background">
      {displayName}
      <button
        className="flex hover:brightness-125"
        onMouseDown={() => handleRemove?.(displayName)}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Chips;
