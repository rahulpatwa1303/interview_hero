export interface FormDataState {
  name: string; // Ensures 'name' is always a string
  yoe: number; // Adjust the type based on your data
  current_role: string;
  desired_role: string;
  preferred_programming_lang: string[];
  desired_companies: string[];
  technologies_used: string[];
  interview_id: string;
}


export enum ActionType {
  UPDATE_YOE = "UPDATE_YOE",
  UPDATE_CURRENT_ROLE = "UPDATE_CURRENT_ROLE",
  UPDATE_DESIRED_ROLE = "UPDATE_DESIRED_ROLE",
  UPDATE_PROG_LANGUAGE = "UPDATE_PROG_LANGUAGE",
  DELETE_PROG_LANGUAGE = "DELETE_PROG_LANGUAGE",
  UPDATE_DESIRED_COMP = "UPDATE_DESIRED_COMP",
  DELETE_DESIRED_COMP="DELETE_DESIRED_COMP",
  UPDATE_TECH_USED = "UPDATE_TECH_USED",
  DELETE_TECH_USED="DELETE_TECH_USED"
}

export type Actions = {
  // Define the action types and properties as needed
  type: string; // Action type (e.g., 'UPDATE_NAME')
  payload?: any; // Optional payload for additional data
};

export type Dispatch<Action> = (action: Action) => void;
