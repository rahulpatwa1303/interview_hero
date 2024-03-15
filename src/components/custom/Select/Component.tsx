"use client";
import React, { useEffect, useState } from "react";
import { LuLoader2 } from "react-icons/lu";

interface Option {
  role: string; // Type for suggestion object
}

const Autocomplete: React.FC<Props> = ({ initialValue, options, onChange,name,error }) => {
  const [focus, setFocus] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState(initialValue || "");
  const [suggestions, setSuggestions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length >= 2 || focus) {
        setIsLoading(true); // Set loading state to true
        const response = await fetch(`/api/suggestions?q=${searchTerm}`, {
          cache: "force-cache",
        });
        // Error handling can be added here (optional)
        const data = await response.json();
        setSuggestions(data);
        setIsLoading(false); // Set loading state to false
      } else {
        setSuggestions([]);
      }
    };

    // Debounce the API call
    const timeout = setTimeout(fetchSuggestions, 200);

    return () => clearTimeout(timeout);
  }, [searchTerm, focus]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSuggestionClick = (suggestion: Option) => {
    setSearchTerm(suggestion.role);
    setSuggestions([]);
    onChange(suggestion);
  };

  // Render the suggestions list with conditional loading indicator
  const renderSuggestions = () =>
    suggestions.length > 0 ? (
      <ul className="list-group bg-white shadow-md rounded-md mt-1 overflow-y-auto max-h-60 absolute w-full bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest z-10">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion?.role}
            onClick={() => handleSuggestionClick(suggestion)}
            className="list-group-item hover:bg-gray-100 p-2 cursor-pointer text-light-onSurface dark:text-dark-onSurface z"
          >
            {suggestion?.role}
          </li>
        ))}
      </ul>
    ) : (
      <div className=" text-sm font-medium px-2 py-1">
        {isLoading ? "Loading..." : "No suggestions found"}
      </div>
    );

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder="Type to search..."
        className={`bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest
        outline-light-outline  dark:outline-dark-outline outline
        focus:outline-light-primary  dark:focus:outline-dark-primary outline-none py-2 px-4 rounded-lg ${
          error && "!outline-light-error dark:!outline-dark-primary"
        }`}
        name={name}
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
  initialValue?: string;
  options: Option[];
  onChange: (suggestion: Option) => void;
  name:string
  error?:string
};

export default Autocomplete;
