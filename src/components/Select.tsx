import React from "react";

// Interface for Option with label and value
interface Option {
  label: string;
  value: string;
}

// Interface for Select Props with optional options and default value
interface SelectProps {
  label: string;
  options: Option[];
  defaultValue?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  defaultValue,
  ...rest
}) => {
  return (
    <div className="input-group h-full flex flex-col gap-1.5">
      <label className="capitalize text-light-main dark:text-dark-main text-xl">
        {label}
      </label>
      <select
        className="h-10 text-lg rounded-md border-dark-borderPrimaryDark dark:border-light-borderPrimaryDark border bg-transparent text-light-main dark:text-dark-main p-2 focus-visible:ring-0"
        defaultValue={defaultValue} // Set default value if provided
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
