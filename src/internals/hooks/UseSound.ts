import * as React from "react";

export type UseSoundHookSignature = (
  soundFilePath: string
) => [boolean, React.Dispatch<React.SetStateAction<boolean>>];

const useSound: UseSoundHookSignature = (soundFilePath: string) => {
  const [isPlaying, setPlaying] = React.useState<boolean>(false);
  const soundFileHandle = React.useRef<HTMLAudioElement>();

  React.useEffect(() => {
    soundFileHandle.current = new Audio(soundFilePath);
    soundFileHandle.current.addEventListener("ended", () => setPlaying(false));
  }, [soundFilePath]);

  React.useEffect(() => {
    if (!soundFileHandle.current) {
      return;
    }
    if (isPlaying) {
      soundFileHandle.current.play();
    } else {
      soundFileHandle.current.pause();
      soundFileHandle.current.currentTime = 0;
    }
  }, [isPlaying]);

  React.useEffect(() => {    
    return () => {
      if (soundFileHandle.current) {
        soundFileHandle.current.pause();
        soundFileHandle.current.currentTime = 0;
      }
    }
  }, []);

  return [isPlaying, setPlaying];
};

export default useSound;
