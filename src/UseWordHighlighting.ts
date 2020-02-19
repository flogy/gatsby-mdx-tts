import * as React from "react";

interface WordHighlighting {
  totalWordCount: number;
  manipulatedChildren: React.ReactNode;
}

const useWordHighlighting = (
  children: React.ReactNode,
  highlightedWordIndex: number
): WordHighlighting => {
  const [totalWordCount, setTotalWordCount] = React.useState<number>(0);
  const [manipulatedChildren, setManipulatedChildren] = React.useState<
    React.ReactNode
  >();

  React.useEffect(() => {
    const newChildren = [];

    let currentIndex = 0;
    const highlightWordIfRequired = (
      node: React.ReactNode
    ): React.ReactNode => {
      if (!node) {
        return;
      }

      const isTextNode = typeof node === "string";
      if (isTextNode) {
        const words = (node as string).split(" ");

        const doesNodeContainHighlightedWord =
          highlightedWordIndex >= currentIndex &&
          highlightedWordIndex < currentIndex + words.length;

        if (!doesNodeContainHighlightedWord) {
          currentIndex += words.length;
          return node;
        }

        const wordIndexInsideNode = highlightedWordIndex - currentIndex;
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
        highlightWordIfRequired
      );
      return React.cloneElement(node as React.ReactElement, [], newSubChildren);
    };
    newChildren.push(React.Children.map(children, highlightWordIfRequired));

    setTotalWordCount(currentIndex);
    setManipulatedChildren(newChildren);
  }, [children, highlightedWordIndex]);

  return {
    totalWordCount,
    manipulatedChildren
  };
};

export default useWordHighlighting;
