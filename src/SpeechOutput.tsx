import * as React from "react";
import useWordHighlighting from "./UseWordHighlighting";

interface SpeechOutputProps {
  id: string;
}

const SpeechOutput: React.FunctionComponent<SpeechOutputProps> = props => {
  const initialWordIndex = -1;
  const [isPlaying, setPlaying] = React.useState<boolean>(false);
  const [wordIndex, setWordIndex] = React.useState<number>(initialWordIndex);
  const intervalHandle = React.useRef<NodeJS.Timeout>();
  const soundFileHandle = React.useRef<HTMLAudioElement>();

  const { totalWordCount, manipulatedChildren } = useWordHighlighting(
    props.children,
    wordIndex
  );

  const updateHighlightedWordIndex = () => {
    setWordIndex(currentWordIndex => {
      if (currentWordIndex + 1 === totalWordCount) {
        return -1;
      } else {
        return currentWordIndex + 1;
      }
    });
  };

  React.useEffect(() => {
    soundFileHandle.current = new Audio(`/tts/${props.id}.mp3`);
  }, [props.id]);

  React.useEffect(() => {
    if (!isPlaying) {
      intervalHandle.current && clearInterval(intervalHandle.current);
      setWordIndex(initialWordIndex);
      return;
    }

    updateHighlightedWordIndex();
    intervalHandle.current = setInterval(updateHighlightedWordIndex, 500);

    return () => {
      intervalHandle.current && clearInterval(intervalHandle.current);
    };
  }, [isPlaying, totalWordCount]);

  const onPlayStopButtonClicked = () => {
    if (!soundFileHandle.current) {
      return;
    }
    if (isPlaying) {
      soundFileHandle.current.pause();
      soundFileHandle.current.currentTime = 0;
    } else {
      soundFileHandle.current.play();
    }

    setPlaying(!isPlaying);
  };
  return (
    <>
      <button onClick={onPlayStopButtonClicked}>
        {isPlaying ? "Stop" : "Play"}
      </button>
      <p>Total words: {totalWordCount}</p>
      <div style={{ backgroundColor: "#d7d7d7" }}>{manipulatedChildren}</div>
    </>
  );
};

export default SpeechOutput;
