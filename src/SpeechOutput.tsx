import * as React from "react";
import isomorphicFetch from "isomorphic-fetch";
import { VoiceId } from "@aws-sdk/client-polly";
import useSpeechMarks, { SpeechMark } from "./internals/hooks/UseSpeechMarks";
import WordMarker from "./internals/components/WordMarker";
import useSound, { UseSoundHookSignature } from "./internals/hooks/UseSound";

export interface PlayButtonProps {
  isPlaying: boolean;
  onClick: () => void;
}

const DefaultPlayButton: React.FunctionComponent<PlayButtonProps> = (props) => (
  <button onClick={props.onClick}>{props.isPlaying ? "Stop" : "Play"}</button>
);

export interface SpeechOutputProps {
  id: string;
  lexiconNames?: string[];
  ssmlTags?: string;
  voiceId?: VoiceId;
  customPlayButton?: React.FunctionComponent<PlayButtonProps>;
  onWordMarked?: (word: string) => void;
  useCustomSoundHook?: UseSoundHookSignature;
  ignoredWordSplittingCharactersRegex?: RegExp;
  children?: React.ReactNode;
}

const SpeechOutput: React.FunctionComponent<SpeechOutputProps> = (props) => {
  const useSoundHook: UseSoundHookSignature =
    props.useCustomSoundHook || useSound;
  const [isPlaying, setPlaying] = useSoundHook(`/tts/${props.id}.mp3`);
  const [speechMarks, setSpeechmarks] = React.useState<SpeechMark[]>([]);

  React.useEffect(() => {
    (async () => {
      const response = await isomorphicFetch(`/tts/${props.id}.json`);
      const speechMarksJson = await response.json();
      setSpeechmarks(speechMarksJson.speechMarks);
    })().catch((error) => console.error(error));
  }, [props.id]);

  const currentWord = useSpeechMarks(speechMarks, isPlaying);

  React.useEffect(
    () => props.onWordMarked && props.onWordMarked(currentWord.word),
    [currentWord, props.onWordMarked]
  );

  const onPlayStopButtonClicked = () => setPlaying(!isPlaying);

  const PlayButton = props.customPlayButton || DefaultPlayButton;

  return (
    <>
      <PlayButton isPlaying={isPlaying} onClick={onPlayStopButtonClicked} />
      <WordMarker
        markedWordIndex={currentWord.index}
        ignoredWordSplittingCharactersRegex={
          props.ignoredWordSplittingCharactersRegex
        }
      >
        {props.children}
      </WordMarker>
    </>
  );
};

export default SpeechOutput;
