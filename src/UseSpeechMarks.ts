import * as React from "react";

export interface SpeechMark {
  time: number;
  type: string;
  start: number;
  end: number;
  value: string;
}

interface UseSpeechMarksReturnValue {
  currentWordIndex: number;
  start: () => void;
  stop: () => void;
}

const useSpeechMarks = (
  speechMarks: SpeechMark[]
): UseSpeechMarksReturnValue => {
  const noWordSelectedIndex = -1;
  const [currentWordIndex, setCurrentWordIndex] = React.useState<number>(
    noWordSelectedIndex
  );
  const [isPlaying, setPlaying] = React.useState<boolean>(false);
  const timeoutHandles = React.useRef<NodeJS.Timeout[]>([]);

  React.useEffect(() => {
    return () => {
      timeoutHandles.current.forEach(clearTimeout);
    };
  }, []);

  const start = () => {
    if (!isPlaying) {
      setPlaying(true);

      timeoutHandles.current.push(
        ...speechMarks
          .filter((speechMark: SpeechMark) => speechMark.value.length > 0)
          .filter((speechMark: SpeechMark) => {
            const ssmlTagRegex = /<.*\/>/;
            const isSsmlTag = speechMark.value.match(ssmlTagRegex) !== null;
            return !isSsmlTag;
          })
          .map((speechMark: SpeechMark, index: number) =>
            setTimeout(() => setCurrentWordIndex(index), speechMark.time)
          )
      );
    }
  };

  const stop = () => {
    if (isPlaying) {
      setPlaying(false);

      setCurrentWordIndex(noWordSelectedIndex);
      timeoutHandles.current.forEach(clearTimeout);
    }
  };

  return {
    currentWordIndex,
    start,
    stop
  };
};

export default useSpeechMarks;
