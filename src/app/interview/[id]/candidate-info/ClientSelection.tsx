"use client";
import ChipComponent from "@/components/custom/Chip/Component";
import Autocomplete from "@/components/custom/Select/Component";
import MultiSelect from "@/components/custom/Select/MutliSelect";
import { ActionType, Actions, Dispatch } from "@/lib/Types";

interface input {
  label: string;
  updateAction: Dispatch<Actions>;
  createdDispatchType: any;
  name: string;
  error?: string;
}

interface multiSelectinput {
  label: string;
  hint: string;
  updateAction: Dispatch<Actions>;
  elementData: string[];
  model: string;
  createdDispatchType: any;
  deleteDispatchType: any;
  name: string;
  error?: string;
  maxLength: number,
  grid:string
}

function ClientSelection({
  label,
  updateAction,
  createdDispatchType,
  name,
  error,
}: input) {
  const onChange = (event: {}) => {
    updateAction({ type: createdDispatchType, payload: event });
  };

  return (
    <div className="flex flex-col w-full max-w-sm gap-2 items-start">
      <label
        htmlFor="email"
        className={`mx-2 ${error && "text-light-error dark:text-dark-primary"}`}
      >
        {label}
      </label>
      <Autocomplete
        initialValue=""
        onChange={(e) => onChange(e)}
        options={[]}
        name={name}
        error={error}
      />
      {error && (
        <p
          className={`text-xs ${
            error && "text-light-error dark:text-dark-onSurfaceVariant"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function ClientMultiSelection({
  label,
  hint,
  updateAction,
  model,
  elementData,
  createdDispatchType,
  deleteDispatchType,
  name,
  error,
  maxLength,
  grid
}: multiSelectinput) {
  const onChange = (event: string) => {
    if(elementData.length >= maxLength) return  
    updateAction({ type: createdDispatchType, payload: event });
  };

  const removeItem = (value: string) => {
    updateAction({ type: deleteDispatchType, payload: value });
  };

  return (
    <div className="flex flex-col w-full  gap-2 items-start">
      <label
        htmlFor="email"
        className={`mx-2 ${error && "text-light-error dark:text-dark-primary"}`}
      >
        {label}
      </label>
      <MultiSelect
        initialValues={Object.values(elementData)}
        onChange={onChange}
        options={[]}
        model={model}
        placeholder="Type to search..."
        name={name}
        error={error}
      />
      <p className={`text-light-onSurface/50 dark:text-dark-onSurface/50 ${elementData.length >= maxLength && '!text-light-error dark:!text-dark-primary'}`}>
        {hint}
      </p>
      <section
        className={`chips grid grid-cols-2 gap-2 ${
          elementData.length === 0 && "hidden"
        } ${grid}`}
      >
        {elementData.map((item, index) => (
          <ChipComponent
            lable={item}
            key={`${item}-${index}`}
            onDelete={() => removeItem(item)}
          />
        ))}
      </section>
      {error && (
        <p
          className={`text-xs ${
            error && "text-light-error dark:text-dark-onSurfaceVariant"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export { ClientMultiSelection, ClientSelection };
