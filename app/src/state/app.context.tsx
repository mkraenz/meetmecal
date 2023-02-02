import type { Dispatch, FC, ReactNode, Reducer } from "react";
import { createContext, useContext, useReducer } from "react";

type ISODateString = string;

export interface MeetingType {
  durationInMins: number;
  displayName: string;
  id: string;
}
export interface Availability {
  start: ISODateString;
  end: ISODateString;
}

export interface Slot {
  start: Date;
  end: Date;
}
interface AppState {
  step: 0 | 1 | 2 | 3;
  meetingType: MeetingType | null;
  slot: Slot | null;
  bookerName: string;
  bookerEmail: string;
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>(null as any); // The defaultValue argument is only used when a component does not have a matching Provider above it in the tree.

type Action =
  | { type: "nextStep" }
  | { type: "previousStep" }
  | { type: "setSlot"; slot: Slot }
  | { type: "setMeetingType"; meetingType: MeetingType }
  | { type: "setBookerDetails"; name: string; email: string };

const reducer: Reducer<AppState, Action> = (prevState, action) => {
  switch (action.type) {
    case "setMeetingType":
      return {
        ...prevState,
        meetingType: action.meetingType,
        step: 1,
      };
    case "setSlot":
      return {
        ...prevState,
        step: 2,
        slot: action.slot,
      };
    case "setBookerDetails":
      return {
        ...prevState,
        bookerEmail: action.email,
        bookerName: action.name,
      };
    case "nextStep":
      if (prevState.step > 2)
        throw new Error(
          "DO NOT DISPATCH nextStep action when already in the last step"
        );
      return {
        ...prevState,
        step: (prevState.step + 1) as 0 | 1 | 2 | 3,
      };
    case "previousStep":
      switch (prevState.step) {
        case 0:
          return prevState;
        case 1:
          return {
            ...prevState,
            meetingType: null,
            step: 0,
          };
        case 2:
          return {
            ...prevState,
            slot: null,
            step: 1,
          };
      }
    default:
      return prevState;
  }
};

export const AppStateProvider: FC<{
  children: ReactNode;
}> = (props) => {
  const [state, dispatch] = useReducer(reducer, {
    step: 0,
    meetingType: null,
    slot: null,
    bookerName: "",
    bookerEmail: "",
  });

  return <AppStateContext.Provider value={{ state, dispatch }} {...props} />;
};

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context) return context;

  throw new Error(
    "You need to wrap your component tree with AppStateProvider."
  );
}
