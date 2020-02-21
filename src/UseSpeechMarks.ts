import * as React from "react";

export interface SpeechMark {
  time: number;
  type: string;
  start: number;
  end: number;
  value: string;
}

const useSpeechMarks = (
  speechMarks: SpeechMark[],
  isPlaying: boolean
): number => {
  const noWordSelectedIndex = -1;
  const [currentWordIndex, setCurrentWordIndex] = React.useState<number>(
    noWordSelectedIndex
  );
  const timeoutHandles = React.useRef<NodeJS.Timeout[]>([]);

  React.useEffect(() => {
    return () => {
      timeoutHandles.current.forEach(clearTimeout);
    };
  }, []);

  React.useEffect(() => {
    isPlaying ? start() : stop();
  }, [isPlaying]);

  const start = () => {
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
  };

  const stop = () => {
    setCurrentWordIndex(noWordSelectedIndex);
    timeoutHandles.current.forEach(clearTimeout);
  };

  return currentWordIndex;
};

export default useSpeechMarks;
