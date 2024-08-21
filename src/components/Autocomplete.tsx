"use client";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Chips from "./Chips";

interface FormData {
  yoe: string;
  progLang: string[];
  currentRole: "";
  desiredRole: "";
  interestedTechnology: string[];
}

// Interface for Option with display and value
interface Option {
  display: string;
  value: string;
}

// Interface for Autocomplete Props
interface AutocompleteProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "defaultValue" | "onChange"
  > {
  label: string;
  options: Option[];
  defaultValue?: string[] | string; // Default values for multi-select
  onChange: (selectedValues: string, name: string) => void; // Callback for multi-select
  mode?: "single" | "multi"; // Mode for single or multi-select
  name: keyof FormData;
  selectedValue?: string[] | string;
  handleRemove: (value: string, name: keyof FormData) => void;
  error?: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  options,
  defaultValue,
  onChange,
  mode = "single", // Default to multi-select
  name,
  selectedValue,
  handleRemove,
  error,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedValues, setSelectedValues] = useState(defaultValue);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setFilteredOptions(
      options.filter((option) =>
        option.display.toLowerCase().includes(value.toLowerCase())
      )
    );
    setIsDropdownVisible(true);
  };

  const handleSelect = (value: string) => {
    if (mode === "multi") {
      if (!selectedValues?.includes(value)) {
        const newSelectedValues = [
          ...(Array.isArray(selectedValues) ? selectedValues : []),
          value,
        ];
        setSelectedValues(newSelectedValues);
        onChange(value, name);
      }
    } else {
      if (!selectedValues?.includes(value)) {
        const newSelectedValues = [value];
        setSelectedValues(newSelectedValues);
        onChange(value, name);
        setIsDropdownVisible(false); // Close dropdown on single select
      }
    }
    setInputValue("");
  };

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputRef]);

  return (
    <div className="flex flex-col max-w-full">
      <div className="relative h-full flex flex-col gap-1.5 w-full">
        <label
          className={`capitalize ${
            error !== undefined
              ? "text-rose-600 dark:text-rose-500"
              : "text-light-main dark:text-dark-main"
          } text-xl`}
        >
          {label}
        </label>
        <div
          className={`relative flex flex-wrap items-center gap-2 border rounded-md ${
            error !== undefined
              ? "border-rose-600 dark:border-rose-500"
              : "border-dark-borderPrimaryDark dark:border-light-borderPrimaryDark"
          } bg-transparent w-full`}
        >
          <input
            ref={inputRef}
            className="flex-grow h-10 text-lg bg-transparent text-light-main dark:text-dark-main p-2 focus-visible:ring-0 w-full"
            value={inputValue}
            onChange={handleChange}
            onFocus={() => setIsDropdownVisible(true)}
            {...rest}
            onBlur={() => setIsDropdownVisible(false)}
          />
        </div>
        <p
          className={`${
            error ? "block" : "hidden"
          }  text-rose-600 dark:text-rose-500`}
        >
          {error}
        </p>
        {isDropdownVisible && (
          <ul className="absolute border border-dark-borderPrimaryDark dark:border-light-borderPrimaryDark rounded-md mt-1 bg-dark-main max-h-60 overflow-y-auto w-full top-20 z-20">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedValue?.includes(option.value);
                return (
                  <li
                    key={option.value}
                    className={cn(
                      `p-2 hover:bg-gray-100 dark:hover:bg-gray-100 cursor-pointer ${
                        isSelected && "bg-gray-100"
                      }`
                    )}
                    onMouseDown={() => handleSelect(option.value)}
                  >
                    {option.display}
                  </li>
                );
              })
            ) : (
              <div className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                No matching value
              </div>
            )}
          </ul>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {typeof selectedValue !== "string"
          ? selectedValue?.map((pl, idx) => {
              const displayName =
                options.find((lang) => lang.value === pl)?.display || pl;
              return (
                <Chips
                  displayName={displayName}
                  handleRemove={() => handleRemove(pl, name)}
                  key={`${idx}-${pl}`}
                />
              );
            })
          : selectedValue !== "" && (
              <Chips
                displayName={
                  options.find((lang) => lang.value === selectedValue)
                    ?.display || selectedValue
                }
                handleRemove={() => handleRemove(selectedValue, name)}
                key={`0-${selectedValue}`}
              />
            )}
      </div>
    </div>
  );
};

export default Autocomplete;
