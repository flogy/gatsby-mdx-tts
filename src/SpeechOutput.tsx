import * as React from "react";
import useSpeechMarks from "./internals/hooks/UseSpeechMarks";
import WordMarker from "./internals/components/WordMarker";
import { SpeechOutputDataContext } from "./SpeechOutputDataProvider";

interface SpeechOutputProps {
  id: string;
}

const SpeechOutput: React.FunctionComponent<SpeechOutputProps> = props => {
  const speechOutputData = React.useContext(SpeechOutputDataContext);
  const relevantSpeechOutputData = speechOutputData.find(
    data => data.speechOutputId === props.id
  );
  if (!relevantSpeechOutputData) {
    throw new Error(`Could not find speech output data for ID: ${props.id}`);
  }

  const [isPlaying, setPlaying] = React.useState<boolean>(false);
  const soundFileHandle = React.useRef<HTMLAudioElement>();

  React.useEffect(() => {
    soundFileHandle.current = new Audio(
      relevantSpeechOutputData.relativeAudioFilePath
    );
    soundFileHandle.current.addEventListener("ended", () => setPlaying(false));
  }, [props.id]);

  const currentWordIndex = useSpeechMarks(
    relevantSpeechOutputData.speechMarks,
    isPlaying
  );

  const onPlayStopButtonClicked = () => {
    if (isPlaying) {
      setPlaying(false);
      if (soundFileHandle.current) {
        soundFileHandle.current.pause();
        soundFileHandle.current.currentTime = 0;
      }
    } else {
      setPlaying(true);
      if (soundFileHandle.current) {
        soundFileHandle.current.play();
      }
    }
  };
  return (
    <>
      <button onClick={onPlayStopButtonClicked}>
        {isPlaying ? "Stop" : "Play"}
      </button>
      <WordMarker markedWordIndex={currentWordIndex}>
        {props.children}
      </WordMarker>
    </>
  );
};

export default SpeechOutput;
