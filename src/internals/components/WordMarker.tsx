import React from "react";

interface WordMarkerProps {
  markedWordIndex: number;
  ignoredWordSplittingCharactersRegex?: RegExp;
}

type MapFunction = (child: React.ReactNode) => React.ReactNode;

const deepMap = (
  children: React.ReactNode,
  map: MapFunction
): React.ReactNode => {
  return React.Children.map(children, child => {
    if (React.isValidElement(child) && child.props.children) {
      return React.cloneElement(child, {
        children: deepMap(child.props.children, map)
      });
    }
    return map(child);
  });
};

interface WordPosition {
  startIndex: number;
  endIndex: number;
}

export const markChildText = (
  children: React.ReactNode,
  markedWordIndex: number,
  ignoredWordSplittingCharactersRegex?: RegExp
): React.ReactNode => {
  const newChildren = [];

  let currentIndex = 0;
  const markWordIfRequired: MapFunction = child => {
    if (!child) {
      return child;
    }

    const isText = typeof child === "string";
    if (isText) {
      if ((child as string).trim().length === 0) {
        return child;
      }

      const isOnlySpecialCharacters = (child as string)
        .trim()
        .match(/^[!@#$%^&*(),.?"'`:{}|<>\-_]+$/);
      if (isOnlySpecialCharacters) {
        return child;
      }

      const text: string = child as string;

      const isWordRegex = new RegExp(
        `([a-zA-Z0-9À-ž]([a-zA-Z0-9À-ž${ignoredWordSplittingCharactersRegex?.source}]*)[a-zA-Z0-9À-ž])|[a-zA-Z0-9À-ž]+`,
        "g"
      );
      const wordPositions: WordPosition[] = [];
      let match;
      while ((match = isWordRegex.exec(text)) != null) {
        const startIndex = match.index;
        const wordLength = match[0].length;
        wordPositions.push({
          startIndex,
          endIndex: startIndex + wordLength
        });
      }

      const doesChildContainHighlightedWord =
        markedWordIndex >= currentIndex &&
        markedWordIndex < currentIndex + wordPositions.length;

      if (!doesChildContainHighlightedWord) {
        currentIndex += wordPositions.length;
        return child;
      }

      const wordIndexInsideChild = markedWordIndex - currentIndex;

      const markedWordPosition = wordPositions[wordIndexInsideChild];

      const textBeforeHighlightedWord = text.slice(
        0,
        markedWordPosition.startIndex
      );
      const textAfterHighlightedWord = text.slice(markedWordPosition.endIndex);
      const highlightedWordComponent = React.createElement(
        "mark",
        null,
        text.slice(markedWordPosition.startIndex, markedWordPosition.endIndex)
      );

      currentIndex += wordPositions.length;

      return [
        textBeforeHighlightedWord,
        highlightedWordComponent,
        textAfterHighlightedWord
      ];
    }
    return child;
  };
  newChildren.push(deepMap(children, markWordIfRequired));

  return newChildren;
};

const WordMarker: React.FunctionComponent<WordMarkerProps> = props => {
  const [manipulatedChildren, setManipulatedChildren] = React.useState<
    React.ReactNode
  >(props.children);

  React.useEffect(() => {
    setManipulatedChildren(
      markChildText(
        props.children,
        props.markedWordIndex,
        props.ignoredWordSplittingCharactersRegex
      )
    );
  }, [props.children, props.markedWordIndex]);

  return <>{manipulatedChildren}</>;
};

export default WordMarker;
