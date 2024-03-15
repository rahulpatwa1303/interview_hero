import React, { useEffect, useState } from "react";
import { LuCheck, LuLoader2 } from "react-icons/lu";
import Image from "next/image";

interface Option {
  name: string; // Type for suggestion object
  favicon_image: string;
}

const MultiSelect: React.FC<Props> = ({
  initialValues = [],
  options,
  model,
  onChange,
  placeholder,
  width = "w-40",
  name,
  error,
}) => {
  const [focus, setFocus] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length >= 2 || focus) {
        setIsLoading(true);
        const response = await fetch(
          `/api/suggestions/${model}?q=${searchTerm}`,
          { cache: "force-cache" }
        );
        const data = await response.json();
        setSuggestions(data);
        setIsLoading(false);
      } else {
        setSuggestions([]);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 200);

    return () => clearTimeout(timeout);
  }, [searchTerm, focus]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSuggestionClick = (suggestion: Option) => {
    setSearchTerm("");
    setSuggestions([]);
    const selected: string = suggestion.name;
    onChange(selected);
  };

  const renderSuggestions = () =>
    suggestions.length > 0 ? (
      <ul
        className={`list-group bg-white shadow-md rounded-md mt-2 ${width} overflow-y-auto max-h-60 absolute bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest z-10`}
      >
        {suggestions.map((suggestion) => {
          const isSelected = initialValues.includes(suggestion?.name);
          return (
            <li
              key={suggestion?.name}
              className={`list-group-item p-2 text-light-onSurface dark:text-dark-onSurface capitalize flex flex-row items-center  ${
                isSelected && "bg-light-onSurface/20 dark:bg-dark-onSurface/20"
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {/* {suggestion?.favicon_image && <Image src={suggestion?.favicon_image} alt={`${suggestion?.name}-logo`} width={20} height={20}/>} */}
              {suggestion?.name} {isSelected && <LuCheck className="ml-4" />}
            </li>
          );
        })}
      </ul>
    ) : (
      <div className="...">
        {isLoading ? "Loading..." : "No suggestions found"}
      </div>
    );

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        name={name}
        className={`bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest
        outline-light-outline  dark:outline-dark-outline outline
        focus:outline-light-primary  dark:focus:outline-dark-primary outline-none py-2 px-4 rounded-lg w-full ${
          error && "!outline-light-error dark:!outline-dark-primary"
        }`}
      />
      {isLoading && (
        <span className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <LuLoader2 className="animate-spin" />
        </span>
      )}
      {suggestions.length > 0 && renderSuggestions()}
    </div>
  );
};

type Props = {
  initialValues?: string[];
  options?: Option[];
  onChange: (values: string) => void;
  placeholder: string;
  model: string;
  width?: string;
  name: string;
  error?: string;
};

export default MultiSelect;
