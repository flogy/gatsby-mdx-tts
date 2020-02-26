import * as React from "react";
import useSpeechMarks, { SpeechMark } from "./internals/hooks/UseSpeechMarks";
import WordMarker from "./internals/components/WordMarker";

interface SpeechOutputProps {
  id: string;
}

const SpeechOutput: React.FunctionComponent<SpeechOutputProps> = props => {
  const [isPlaying, setPlaying] = React.useState<boolean>(false);
  const [speechMarks, setSpeechmarks] = React.useState<SpeechMark[]>([]);
  const soundFileHandle = React.useRef<HTMLAudioElement>();

  React.useEffect(() => {
    soundFileHandle.current = new Audio(`/tts/${props.id}.mp3`);
    soundFileHandle.current.addEventListener("ended", () => setPlaying(false));
    const fetchSpeechMarks = async () => {
      const response: any = await fetch(`/tts/${props.id}.json`);
      const speechMarksJson: any = await response.json();
      setSpeechmarks(speechMarksJson.speechMarks);
    };
    fetchSpeechMarks();
  }, [props.id]);

  const currentWordIndex = useSpeechMarks(speechMarks, isPlaying);

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
