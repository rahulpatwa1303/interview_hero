"use client";
import ChipComponent from "@/components/custom/Chip/Component";
import Autocomplete from "@/components/custom/Select/Component";
import MultiSelect from "@/components/custom/Select/MutliSelect";
import { ActionType, Actions, Dispatch } from "@/lib/Types";

interface input {
  label: string;
  updateAction: Dispatch<Actions>;
  createdDispatchType: any;
  name:string
}

interface multiSelectinput {
  label: string;
  hint: string;
  updateAction: Dispatch<Actions>;
  elementData: string[];
  model: string;
  createdDispatchType: any;
  deleteDispatchType: any;
  name:string
}

function ClientSelection({ label,updateAction,createdDispatchType,name }: input) {
  const onChange = (event: {}) => {
    updateAction({ type: createdDispatchType, payload: event });
  };

  return (
    <div className="flex flex-col w-full max-w-sm gap-2 items-start">
      <label htmlFor="email" className="mx-2">
        {label}
      </label>
      <Autocomplete
        initialValue=""
        onChange={(e) => onChange(e)}
        options={[]}
        name={name}
        />
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
  name
}: multiSelectinput) {
  const onChange = (event: string) => {
    updateAction({ type: createdDispatchType, payload: event });
  };
  
  const removeItem = (value: string) => {
    updateAction({ type: deleteDispatchType, payload: value });
  };

  return (
    <div className="flex flex-col w-full  gap-2 items-start">
      <label htmlFor="email" className="mx-2">
        {label}
      </label>
      <MultiSelect
        initialValues={Object.values(elementData)}
        onChange={onChange}
        options={[]}
        model={model}
        placeholder="Type to search..."
        name={name}
        />
      <p className="text-light-onSurface/50 dark:text-dark-onSurface/50 ">
        {hint}
      </p>
      <section className={`chips grid grid-cols-2 gap-2 ${elementData.length === 0 && 'hidden'}`}>
        {elementData.map((item, index) => (
          <ChipComponent
            lable={item}
            key={`${item}-${index}`}
            onDelete={() => removeItem(item)}
          />
        ))}
      </section>
    </div>
  );
}

export { ClientMultiSelection, ClientSelection };
