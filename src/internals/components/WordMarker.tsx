import React from "react";

interface WordMarkerProps {
  markedWordIndex: number;
}

const WordMarker: React.FunctionComponent<WordMarkerProps> = props => {
  const [manipulatedChildren, setManipulatedChildren] = React.useState<
    React.ReactNode
  >();

  React.useEffect(() => {
    const newChildren = [];

    let currentIndex = 0;
    const markWordIfRequired = (node: React.ReactNode): React.ReactNode => {
      if (!node) {
        return;
      }

      const isTextNode = typeof node === "string";
      if (isTextNode) {
        const whitespaceOrNewlineRegex = /[\s\n]/;
        const words = (node as string).split(whitespaceOrNewlineRegex);

        const doesNodeContainHighlightedWord =
          props.markedWordIndex >= currentIndex &&
          props.markedWordIndex < currentIndex + words.length;

        if (!doesNodeContainHighlightedWord) {
          currentIndex += words.length;
          return node;
        }

        const wordIndexInsideNode = props.markedWordIndex - currentIndex;
        const textBeforeHighlightedWord = words
          .slice(0, wordIndexInsideNode)
          .join(" ");
        const textAfterHighlightedWord = words
          .slice(wordIndexInsideNode + 1)
          .join(" ");
        const highlightedWordComponent = React.createElement(
          "mark",
          null,
          words[wordIndexInsideNode]
        );

        currentIndex += words.length;
        return [
          `${textBeforeHighlightedWord} `,
          highlightedWordComponent,
          ` ${textAfterHighlightedWord}`
        ];
      }

      const hasChildrenDefinition =
        !!(node as React.ReactElement).props &&
        !!(node as React.ReactElement).props.children;
      if (!hasChildrenDefinition) {
        return node;
      }

      const newSubChildren = React.Children.map(
        (node as React.ReactElement).props.children,
        markWordIfRequired
      );
      return React.cloneElement(node as React.ReactElement, [], newSubChildren);
    };
    newChildren.push(React.Children.map(props.children, markWordIfRequired));

    setManipulatedChildren(newChildren);
  }, [props.children, props.markedWordIndex]);

  return <>{manipulatedChildren}</>;
};

export default WordMarker;
