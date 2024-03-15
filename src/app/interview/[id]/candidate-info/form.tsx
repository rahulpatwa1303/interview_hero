"use client";

import InputWithLabel from "@/components/custom/InputWithLabel/InputWithLabel";
import React, { useReducer, useState } from "react";
import { ClientMultiSelection, ClientSelection } from "./ClientSelection";
import { useSession } from "next-auth/react";
import { ActionType, Actions, FormDataState } from "@/lib/Types";
import { usePathname, useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { setCandidateInfo } from "./actions";
import SubmitButton from "../../SubmitButton";

function Form() {
  const { data: session } = useSession();

  const path = usePathname();
  const id = path.split("/")[2];

  const initalFormData = {
    name: session?.user?.name,
    yoe: null,
    current_role: "",
    desired_role: "",
    preferred_programming_lang: [],
    desired_companies: [],
    technologies_used: [],
    interview_id: id,
  };

  type Reducer<State, Action> = (state: State, action: Action) => State;

  type Action = Actions;

  const reducer: Reducer<FormDataState, Action> = (state, action) => {
    switch (action.type) {
      case ActionType.UPDATE_YOE:
        return {
          ...state,
          yoe: action.payload,
        };
      case ActionType.UPDATE_CURRENT_ROLE:
        return {
          ...state,
          current_role: action.payload.role,
        };
      case ActionType.UPDATE_DESIRED_ROLE:
        return {
          ...state,
          desired_role: action.payload.role,
        };
      case ActionType.DELETE_PROG_LANGUAGE:
        const udpatedOnDelete = state.preferred_programming_lang.filter(
          (item) => item !== action.payload
        );
        return {
          ...state,
          preferred_programming_lang: [...udpatedOnDelete],
        };
      case ActionType.UPDATE_PROG_LANGUAGE:
        return {
          ...state,
          preferred_programming_lang: [
            ...state.preferred_programming_lang,
            action.payload,
          ],
        };
      case ActionType.DELETE_DESIRED_COMP:
        const udpatedCompDelete = state.desired_companies.filter(
          (item) => item !== action.payload
        );
        return {
          ...state,
          desired_companies: [...udpatedCompDelete],
        };
      case ActionType.UPDATE_DESIRED_COMP:
        return {
          ...state,
          desired_companies: [...state.desired_companies, action.payload],
        };
      case ActionType.DELETE_TECH_USED:
        const udpatedTechUsedelete = state.technologies_used.filter(
          (item) => item !== action.payload
        );
        return {
          ...state,
          technologies_used: [...udpatedTechUsedelete],
        };
      case ActionType.UPDATE_TECH_USED:
        return {
          ...state,
          technologies_used: [...state.technologies_used, action.payload],
        };
      default:
        return state;
    }
  };

  const [formData, dispatch] = useReducer(reducer, initalFormData);

  const [formDataError, setFormDataError] = useState({} as any);

  const handleSubmit = () => {
    const error: any = {};
    if (!formData.yoe) error.yoe = "Year of experience is required";
    if (!formData.current_role) error.current_role = "Current role is required";
    if (!formData.desired_role) error.desired_role = "Desired role is required";

    if (formData.preferred_programming_lang.length === 0)
      error.preferred_programming_lang =
        "Need to select at least one programming language";

    if (formData.desired_companies.length === 0)
      error.desired_companies = "Need to select at least one dream company";

    if (formData.technologies_used.length === 0)
      error.technologies_used =
        "Need to select at least one technology that you are familiar with";

    setFormDataError(error);

    if (Object.keys(error).length === 0) {
      setCandidateInfo(formData);
    }
  };

  return (
    <form action={handleSubmit}>
      <div className="space-y-6">
        <div className="flex flex-row gap-8">
          <InputWithLabel
            inputType="text"
            id="name"
            name="name"
            inputValue={initalFormData.name}
            placeholder="Name"
            readOnly={true}
            label="Name"
          />
          <InputWithLabel
            inputType="number"
            id="years_of_experience"
            name="yoe"
            inputValue={initalFormData.yoe}
            placeholder="Ex: 2,3,4,11..."
            label="Current work experience"
            readOnly={false}
            onChange={dispatch}
            createdDispatchType={ActionType.UPDATE_YOE}
            error={formDataError.yoe}
          />
        </div>
        <div className="flex flex-row gap-8">
          <ClientSelection
            label="Current Role"
            updateAction={dispatch}
            createdDispatchType={ActionType.UPDATE_CURRENT_ROLE}
            name="current_role"
            error={formDataError.current_role}
          />
          <ClientSelection
            label="Desired Role"
            updateAction={dispatch}
            createdDispatchType={ActionType.UPDATE_DESIRED_ROLE}
            name="desired_role"
            error={formDataError.desired_role}
          />
        </div>
        <div className="flex flex-row gap-8">
          <ClientMultiSelection
            label="Programming Language"
            hint="You can add max. 5"
            updateAction={dispatch}
            elementData={formData.preferred_programming_lang}
            model="programing_lang"
            createdDispatchType={ActionType.UPDATE_PROG_LANGUAGE}
            deleteDispatchType={ActionType.DELETE_PROG_LANGUAGE}
            name="preferred_programming_lang"
            error={formDataError.preferred_programming_lang}
            maxLength={5}
            grid="grid-cols-2"
            />
          <ClientMultiSelection
            label="Dream Companies"
            hint="You can add max. 5"
            updateAction={dispatch}
            elementData={formData.desired_companies}
            model="companies"
            createdDispatchType={ActionType.UPDATE_DESIRED_COMP}
            deleteDispatchType={ActionType.DELETE_DESIRED_COMP}
            name="desired_companies"
            error={formDataError.desired_companies}
            maxLength={5}
            grid="grid-cols-2"
          />
        </div>
        <div className="w-full">
          <ClientMultiSelection
            label="Primary Technologies Used"
            hint="You can add max. 10"
            updateAction={dispatch}
            elementData={formData.technologies_used}
            model="technologies_used"
            createdDispatchType={ActionType.UPDATE_TECH_USED}
            deleteDispatchType={ActionType.DELETE_TECH_USED}
            name="technologies_used"
            error={formDataError.technologies_used}
            maxLength={10}
            grid="grid-cols-5"
          />
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}

export default Form;
