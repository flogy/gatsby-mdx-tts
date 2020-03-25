import * as React from "react";

export interface SpeechMark {
  time: number;
  type: string;
  start: number;
  end: number;
  value: string;
}

interface CurrentWord {
  index: number;
  word: string;
}

const useSpeechMarks = (
  speechMarks: SpeechMark[],
  isPlaying: boolean
): CurrentWord => {
  const noWordSelected: CurrentWord = {
    index: -1,
    word: ""
  };
  const [currentWord, setCurrentWord] = React.useState<CurrentWord>(
    noWordSelected
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
          setTimeout(
            () =>
              setCurrentWord({
                index,
                word: speechMark.value
              }),
            speechMark.time
          )
        )
    );
  };

  const stop = () => {
    setCurrentWord(noWordSelected);
    timeoutHandles.current.forEach(clearTimeout);
  };

  return currentWord;
};

export default useSpeechMarks;
