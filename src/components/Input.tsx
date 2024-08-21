import React from "react";

// Interface for Input Props with extended HTMLInputElement attributes
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; // Define the label prop as a string
  type?: string; // Define the type prop as an optional string
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, type, error, ...rest }) => {
  console.log("error", error);
  return (
    <div className="input-group h-full flex flex-col gap-1.5 w-full">
      <label className={`capitalize ${error !== undefined ? 'text-rose-600 dark:text-rose-500' : 'text-light-main dark:text-dark-main'} text-xl`}>
        {label}
      </label>
      <input
        className={`h-10 text-lg rounded-md  border bg-transparent text-light-main dark:text-dark-main p-2 focus-visible:ring-0 ${
          error !== undefined
            ? "border-rose-600 dark:text-rose-500"
            : "border-dark-borderPrimaryDark dark:border-light-borderPrimaryDark"
        }`}
        type={type || "text"} // Set default type to 'text' if not provided
        {...rest} // Spread remaining props to the input element
      />
      <p className={`${error ? "block" : "hidden"}  text-rose-600 dark:text-rose-500`}>{error}</p>
    </div>
  );
};

export default Input;
