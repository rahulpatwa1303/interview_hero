export type FormDataState = {
  technologies_used: any;
  name: string;
  yoe: number;
  current_role: string;
  desired_role: string;
  preferred_programming_lang: string[];
  desired_companies: string[];
};

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

export interface Actions {
  type: ActionType;
  payload: any;
}

export type Dispatch<Action> = (action: Action) => void;
