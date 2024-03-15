import { Actions, Dispatch } from "@/lib/Types";
import React from "react";

interface input {
  label: string;
  inputValue: any | null;
  inputType?: any;
  placeholder: string;
  id: string;
  readOnly: boolean;
  name: string;
  onChange?: Dispatch<Actions>;
  createdDispatchType?: any;
  error?: string
}

function InputWithLabel({
  label,
  inputValue,
  inputType,
  placeholder,
  id,
  readOnly = false,
  name,
  onChange,
  createdDispatchType,
  error
}: input) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    onChange({ type: createdDispatchType, payload: input });
  };

  return (
    <div className="flex flex-col w-full max-w-sm gap-2 items-start">
      <label htmlFor="email" className={`mx-2 ${error && 'text-light-error dark:text-dark-primary'}`}>
        {label}
      </label>
      <input
        type={inputType}
        id={id}
        placeholder={placeholder}
        value={inputValue}
        readOnly={readOnly}
        name={name}
        onChange={handleChange}
        className={`bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest
      outline-light-outline  dark:outline-dark-outline outline
      focus:outline-light-primary dark:focus:outline-dark-primary outline-none py-2 px-4 rounded-lg ${error && '!outline-light-error dark:!outline-dark-primary'}`}
      />
      {error && <p className={`text-xs ${error && 'text-light-error dark:text-dark-onSurfaceVariant'}`}>{error}</p>}
    </div>
  );
}

export default InputWithLabel;
