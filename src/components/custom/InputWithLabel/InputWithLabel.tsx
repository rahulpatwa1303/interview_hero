import React from "react";

interface input {
  label: string;
  inputValue: string;
  inputType: string;
  placeholder: string;
  id: string;
  readOnly: boolean;
  name: string
}

function InputWithLabel({
  label,
  inputValue,
  inputType,
  placeholder,
  id,
  readOnly = false,
  name
}: input) {
  return (
    <div className="flex flex-col w-full max-w-sm gap-2 items-start">
      <label htmlFor="email" className="mx-2">
        {label}
      </label>
      <input
        type={inputType}
        id={id}
        placeholder={placeholder}
        value={inputValue}
        readOnly={readOnly}
        name={name}
        className="bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest
      outline-light-outline  dark:outline-dark-outline outline
      focus:outline-light-primary   dark:focus:outline-dark-primary outline-none py-2 px-4 rounded-lg"
      />
    </div>
  );
}

export default InputWithLabel;
