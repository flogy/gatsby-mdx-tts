import React from "react";

interface WordMarkerProps {
  markedWordIndex: number;
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

export const markChildText = (
  children: React.ReactNode,
  markedWordIndex: number
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

      const hasWhiteSpaceBeforeFirstWord =
        (child as string).match(/^\s/) !== null;
      const hasWhiteSpaceAfterLastWord =
        (child as string).match(/.*\s$/) !== null;

      const whitespaceOrNewlineRegex = /[\s\n]/;
      const words = (child as string)
        .split(whitespaceOrNewlineRegex)
        .filter(word => word.trim().length > 0);

      const doesChildContainHighlightedWord =
        markedWordIndex >= currentIndex &&
        markedWordIndex < currentIndex + words.length;

      if (!doesChildContainHighlightedWord) {
        currentIndex += words.length;
        return child;
      }

      const wordIndexInsideChild = markedWordIndex - currentIndex;
      const textBeforeHighlightedWord = words
        .slice(0, wordIndexInsideChild)
        .join(" ");
      const textAfterHighlightedWord = words
        .slice(wordIndexInsideChild + 1)
        .join(" ");
      const highlightedWordComponent = React.createElement(
        "mark",
        null,
        words[wordIndexInsideChild]
      );

      currentIndex += words.length;
      return [
        ...[
          `${hasWhiteSpaceBeforeFirstWord ? " " : ""}${
            textBeforeHighlightedWord ? `${textBeforeHighlightedWord} ` : ""
          }`
        ],
        highlightedWordComponent,
        ...[
          `${textAfterHighlightedWord ? ` ${textAfterHighlightedWord}` : ""}${
            hasWhiteSpaceAfterLastWord ? " " : ""
          }`
        ]
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
      markChildText(props.children, props.markedWordIndex)
    );
  }, [props.children, props.markedWordIndex]);

  return <>{manipulatedChildren}</>;
};

export default WordMarker;
