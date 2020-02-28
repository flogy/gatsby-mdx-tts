import { SpeechMark } from "./internals/hooks/UseSpeechMarks";

export interface SpeechOutputData {
  speechOutputId: string;
  relativeAudioFilePath: string;
  speechMarks: SpeechMark[];
}

const mapQueryResults = (allSpeechOutput: any): SpeechOutputData[] =>
  allSpeechOutput.edges.map(({ node }: any) => ({
    speechOutputId: node.speechOutputId,
    relativeAudioFilePath: node.relativeAudioFilePath,
    speechMarks: node.speechMarks
  }));

export default mapQueryResults;
