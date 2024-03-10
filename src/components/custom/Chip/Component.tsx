import { Cross1Icon } from "@radix-ui/react-icons";
import React from "react";

type chip = {
  lable: string;
  onDelete?: () => void;
  icon?: string;
};

function ChipComponent({ lable, onDelete, icon }: chip) {
  return (
    <div className="h-[32px] p-1 pl-3 w-full rounded-xl flex flex-row items-center justify-center gap-4 dark:bg-dark-secondaryContainer bg-light-secondaryContainer text-light-onSecondaryContainer dark:text-dark-onSecondaryContainer">
      <p className="capitalize truncate">{lable}</p>
      {onDelete && <Cross1Icon onClick={onDelete} className="cursor-pointer"/>}
    </div>
  );
}

export default ChipComponent;
