"use client";

import InputWithLabel from "@/components/custom/InputWithLabel/InputWithLabel";
import React, { useReducer } from "react";
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
    name: session?.user?.name || "",
    yoe: 0,
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
        const udpatedTechUsedelete = state.desired_companies.filter(
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

  // const [state, formAction] = useFormState(setCandidateInfo, initalFormData);
  const updateUserWithId = setCandidateInfo.bind(null, id)


  return (
    <form action={updateUserWithId}>
      <div className="space-y-6">
        <div className="flex flex-row gap-8">
          <InputWithLabel
            inputType="text"
            id="name"
            name="name"
            inputValue={session?.user?.name as string}
            placeholder="Name"
            readOnly={true}
            label="Name"
          />
          <InputWithLabel
            inputType="number"
            id="years_of_experience"
            name="yoe"
            inputValue={""}
            placeholder="Ex: 2,3,4,11..."
            label="Current work experience"
            readOnly={false}
          />
        </div>
        <div className="flex flex-row gap-8">
          <ClientSelection
            label="Current Role"
            updateAction={dispatch}
            createdDispatchType={ActionType.UPDATE_CURRENT_ROLE}
            name="current_role"
          />
          <ClientSelection
            label="Desired Role"
            updateAction={dispatch}
            createdDispatchType={ActionType.UPDATE_DESIRED_ROLE}
            name="desired_role"
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
          />
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}

export default Form;
