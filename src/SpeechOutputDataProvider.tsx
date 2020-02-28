import React from "react";
import { SpeechOutputData } from "./mapQueryResults";

interface SpeechOutputDataProviderProps {
  speechOutputData: SpeechOutputData[];
}

export const SpeechOutputDataContext = React.createContext<SpeechOutputData[]>(
  []
);

const SpeechOutputDataProvider: React.FunctionComponent<SpeechOutputDataProviderProps> = props => {
  return (
    <SpeechOutputDataContext.Provider value={props.speechOutputData}>
      {props.children}
    </SpeechOutputDataContext.Provider>
  );
};

export default SpeechOutputDataProvider;
