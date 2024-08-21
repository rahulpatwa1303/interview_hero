"use client";

import { Button } from "@/components/AnimatedButton";
import Autocomplete from "@/components/Autocomplete";
import Input from "@/components/Input";
import { programingLang, role, technology } from "@/lib/preferred";
import { Loader2Icon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createUser } from "./actions";

interface FormData {
  yoe: string;
  progLang: string[];
  currentRole: string;
  desiredRole: string;
  interestedTechnology: string[];
  [key: string]: string | string[]; // Add an index signature
}

function FormRender() {
  const path = usePathname();
  const interviewId = path?.split("/")[2];
  const [disabledButton, setDisableBUtton] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    yoe: "",
    progLang: [],
    currentRole: "",
    desiredRole: "",
    interestedTechnology: [],
  });

  const [errors, setErrors] = useState<{
    yoe?: string;
    progLang?: string;
    currentRole?: string;
    desiredRole?: string;
    interestedTechnology?: string;
  }>({});

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectionMulti = (
    selectedValues: string,
    name: keyof FormData
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: [...((prev[name] as string[]) || []), selectedValues],
    }));
  };

  const handleSelection = (selectedValues: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedValues,
    }));
  };

  const handleRemove = (value: string, name: keyof FormData) => {
    setFormData((prev) => {
      if (Array.isArray(prev[name])) {
        // Use type assertion to tell TypeScript this is an array
        const newSelectedValues = (prev[name] as string[]).filter(
          (v) => v !== value
        );
        return { ...prev, [name]: newSelectedValues };
      } else {
        // If the field is a string, set it to an empty string
        return { ...prev, [name]: "" };
      }
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Initialize errors object
    const newErrors: {
      yoe?: string;
      progLang?: string;
      currentRole?: string;
      desiredRole?: string;
      interestedTechnology?: string;
    } = {};

    // Validation checks
    if (!formData.yoe) newErrors.yoe = "Year of Experience is required.";
    if (!formData.currentRole)
      newErrors.currentRole = "Current Role is required.";
    if (!formData.desiredRole)
      newErrors.desiredRole = "Desired Role is required.";
    if (!formData.progLang.length)
      newErrors.progLang = "Programming Languages is required.";
    if (formData.progLang.length > 5)
      newErrors.progLang = "Programming Languages should not exceed 5.";
    if (!formData.interestedTechnology.length)
      newErrors.interestedTechnology = "Interested Technologies is required.";
    if (formData.interestedTechnology.length > 10)
      newErrors.interestedTechnology =
        "Interested Technologies should not exceed 10.";

    // If there are errors, update the state and stop form submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      setDisableBUtton(true);
      // await fetch(`/api/interview/candidate_info?id=${interviewId}`, {
      //   method: "POST",
      //   body: JSON.stringify(formData),
      // });
      await createUser({ req: formData, id: interviewId });
    } catch (errors) {
      console.log("errors", errors);
      setDisableBUtton(false);
      return;
    }
  };
  return (
    <div>
      <form>
        <div className="flex gap-4  w-full">
          <Input
            label="Year of experience"
            type="number"
            name="yoe"
            placeholder="Total years of experience"
            min={0}
            value={formData.yoe}
            onChange={handleChange}
            error={errors?.yoe}
          />
          <div className="flex flex-col w-full">
            <Autocomplete
              label="Programming Language"
              options={programingLang}
              onChange={handleSelectionMulti}
              defaultValue={formData.progLang}
              placeholder="Total years of experience"
              mode="multi"
              name="progLang"
              selectedValue={formData.progLang}
              handleRemove={handleRemove}
              error={errors?.progLang}
            />
          </div>
        </div>
        <div className="flex gap-4 w-full">
          <div className="flex flex-col w-full">
            <Autocomplete
              label="Current Role"
              options={role}
              onChange={handleSelection}
              defaultValue={formData.currentRole}
              placeholder="Total years of experience"
              name="currentRole"
              selectedValue={formData.currentRole}
              handleRemove={handleRemove}
              error={errors?.currentRole}
            />
          </div>
          <div className="flex flex-col w-full">
            <Autocomplete
              label="Desired Role"
              options={role}
              onChange={handleSelection}
              defaultValue={formData.desiredRole}
              placeholder="Total years of experience"
              name="desiredRole"
              selectedValue={formData.desiredRole}
              handleRemove={handleRemove}
              error={errors?.desiredRole}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <Autocomplete
            label="Interested Technology"
            options={technology}
            onChange={handleSelectionMulti}
            defaultValue={formData.interestedTechnology}
            placeholder="Total years of experience"
            mode="multi"
            name="interestedTechnology"
            selectedValue={formData.interestedTechnology}
            handleRemove={handleRemove}
            error={errors?.interestedTechnology}
          />
        </div>
      </form>
      <Button
        variant={"animated"}
        onClick={handleSubmit}
        disabled={disabledButton}
        // className="bg-light-primary dark:bg-dark-primary px-8 py-2 text-white text-xl font-semibold rounded-xl mt-2"
      >
        {disabledButton && <Loader2Icon className={"animate-spin"} />} Continue
      </Button>
    </div>
  );
}

export default FormRender;
