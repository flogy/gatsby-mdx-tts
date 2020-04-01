import * as React from "react";
import isomorphicFetch from "isomorphic-fetch";
import useSpeechMarks, { SpeechMark } from "./internals/hooks/UseSpeechMarks";
import WordMarker from "./internals/components/WordMarker";

export interface PlayButtonProps {
  isPlaying: boolean;
  onClick: () => void;
}

const DefaultPlayButton: React.FunctionComponent<PlayButtonProps> = props => (
  <button onClick={props.onClick}>{props.isPlaying ? "Stop" : "Play"}</button>
);

export interface SpeechOutputProps {
  id: string;
  customPlayButton?: React.FunctionComponent<PlayButtonProps>;
  onWordMarked?: (word: string) => void;
}

const SpeechOutput: React.FunctionComponent<SpeechOutputProps> = props => {
  const [isPlaying, setPlaying] = React.useState<boolean>(false);
  const [speechMarks, setSpeechmarks] = React.useState<SpeechMark[]>([]);
  const soundFileHandle = React.useRef<HTMLAudioElement>();

  React.useEffect(() => {
    soundFileHandle.current = new Audio(`/tts/${props.id}.mp3`);
    soundFileHandle.current.addEventListener("ended", () => setPlaying(false));
    const fetchSpeechMarks = async () => {
      const response: any = await isomorphicFetch(`/tts/${props.id}.json`);
      const speechMarksJson: any = await response.json();
      setSpeechmarks(speechMarksJson.speechMarks);
    };
    fetchSpeechMarks();
  }, [props.id]);

  const currentWord = useSpeechMarks(speechMarks, isPlaying);

  React.useEffect(
    () => props.onWordMarked && props.onWordMarked(currentWord.word),
    [currentWord, props.onWordMarked]
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

  const PlayButton = props.customPlayButton || DefaultPlayButton;

  return (
    <>
      <PlayButton isPlaying={isPlaying} onClick={onPlayStopButtonClicked} />
      <WordMarker markedWordIndex={currentWord.index}>
        {props.children}
      </WordMarker>
    </>
  );
};

export default SpeechOutput;
