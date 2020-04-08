import React from "react";
import Adapter from "enzyme-adapter-react-16";
import { act } from "react-dom/test-utils";
import { configure, mount } from "enzyme";
import WordMarker from "../internals/components/WordMarker";

const executeWordMarkerTest = (
  jsx: JSX.Element,
  markedWordIndex: number,
  expectedResultingHtml: string,
  ignoredWordSplittingCharactersRegex?: RegExp
) => {
  configure({ adapter: new Adapter() });

  let component: any;
  act(() => {
    component = mount(
      <WordMarker
        markedWordIndex={markedWordIndex}
        ignoredWordSplittingCharactersRegex={
          ignoredWordSplittingCharactersRegex
        }
      >
        {jsx}
      </WordMarker>
    );
  });
  component.update();

  expect(component.html()).toEqual(expectedResultingHtml);
};

it("mark no word in heading", async () => {
  const jsx = <h1>Mobilicorpus reducto</h1>;
  executeWordMarkerTest(jsx, -1, "<h1>Mobilicorpus reducto</h1>");
});

it("mark first word in heading", async () => {
  const jsx = <h1>Mobilicorpus reducto</h1>;
  executeWordMarkerTest(jsx, 0, "<h1><mark>Mobilicorpus</mark> reducto</h1>");
});

it("mark second word in heading", async () => {
  const jsx = <h1>Mobilicorpus reducto</h1>;
  executeWordMarkerTest(jsx, 1, "<h1>Mobilicorpus <mark>reducto</mark></h1>");
});

it("mark third word in article", async () => {
  const jsx = (
    <article>
      <h1>Mobilicorpus reducto</h1>
      <p>liberacorpus crucio.</p>
    </article>
  );
  executeWordMarkerTest(
    jsx,
    2,
    "<article><h1>Mobilicorpus reducto</h1><p><mark>liberacorpus</mark> crucio.</p></article>"
  );
});

it("mark first word in formatted paragraph", async () => {
  const jsx = (
    <p>
      Petrificus <em>lumos</em> lacarnum<strong>legilimens</strong> legilimens{" "}
      <strong>
        <em>quietus</em>
      </strong>{" "}
      vipera <del>arania me patronum</del> reducio.
    </p>
  );
  executeWordMarkerTest(
    jsx,
    0,
    "<p><mark>Petrificus</mark> <em>lumos</em> lacarnum<strong>legilimens</strong> legilimens <strong><em>quietus</em></strong> vipera <del>arania me patronum</del> reducio.</p>"
  );
});

it("mark second word in formatted paragraph", async () => {
  const jsx = (
    <p>
      Petrificus <em>lumos</em> lacarnum<strong>legilimens</strong> legilimens{" "}
      <strong>
        <em>quietus</em>
      </strong>{" "}
      vipera <del>arania me patronum</del> reducio.
    </p>
  );
  executeWordMarkerTest(
    jsx,
    1,
    "<p>Petrificus <em><mark>lumos</mark></em> lacarnum<strong>legilimens</strong> legilimens <strong><em>quietus</em></strong> vipera <del>arania me patronum</del> reducio.</p>"
  );
});

it("mark third word in formatted paragraph", async () => {
  const jsx = (
    <p>
      Petrificus <em>lumos</em> lacarnum<strong>legilimens</strong> legilimens{" "}
      <strong>
        <em>quietus</em>
      </strong>{" "}
      vipera <del>arania me patronum</del> reducio.
    </p>
  );
  executeWordMarkerTest(
    jsx,
    2,
    "<p>Petrificus <em>lumos</em> <mark>lacarnum</mark><strong>legilimens</strong> legilimens <strong><em>quietus</em></strong> vipera <del>arania me patronum</del> reducio.</p>"
  );
});

it("mark first word in text with link", async () => {
  const jsx = (
    <p>
      Would you click <a href="#">this link</a>?
    </p>
  );
  executeWordMarkerTest(
    jsx,
    0,
    '<p><mark>Would</mark> you click <a href="#">this link</a>?</p>'
  );
});

it("mark last word in text with link", async () => {
  const jsx = (
    <p>
      Would you click <a href="#">this link</a>?
    </p>
  );
  executeWordMarkerTest(
    jsx,
    4,
    '<p>Would you click <a href="#">this <mark>link</mark></a>?</p>'
  );
});

it("mark word after text with link to check that question mark after link is not seen as word", async () => {
  const jsx = (
    <p>
      Would you click <a href="#">this link</a>?
    </p>
  );
  executeWordMarkerTest(
    jsx,
    5,
    '<p>Would you click <a href="#">this link</a>?</p>'
  );
});

it("mark first word in heading with slash without spaces", async () => {
  const jsx = <h1>Mobilicorpus/reducto</h1>;
  executeWordMarkerTest(jsx, 0, "<h1><mark>Mobilicorpus</mark>/reducto</h1>");
});

it("mark second word in heading with slash without spaces", async () => {
  const jsx = <h1>Mobilicorpus/reducto</h1>;
  executeWordMarkerTest(jsx, 1, "<h1>Mobilicorpus/<mark>reducto</mark></h1>");
});

it("mark first word in heading with slash with spaces", async () => {
  const jsx = <h1>Mobilicorpus / reducto</h1>;
  executeWordMarkerTest(jsx, 0, "<h1><mark>Mobilicorpus</mark> / reducto</h1>");
});

it("mark second word in heading with slash with spaces", async () => {
  const jsx = <h1>Mobilicorpus / reducto</h1>;
  executeWordMarkerTest(jsx, 1, "<h1>Mobilicorpus / <mark>reducto</mark></h1>");
});

it("ignoring word splitting characters must not interfere with slashes", async () => {
  const jsx = <h1>Mobilicorpus/reducto</h1>;
  executeWordMarkerTest(
    jsx,
    0,
    "<h1><mark>Mobilicorpus</mark>/reducto</h1>",
    /·/
  );
});

it("mark second word in heading with diacritics", async () => {
  const jsx = <h1>Mobilicorpus rèdücto reducto</h1>;
  executeWordMarkerTest(
    jsx,
    1,
    "<h1>Mobilicorpus <mark>rèdücto</mark> reducto</h1>"
  );
});

it("do not split words because of an ignored character", async () => {
  const jsx = (
    <p>I am a bit fear·ful that fearful is split because of the dot.</p>
  );
  executeWordMarkerTest(
    jsx,
    4,
    "<p>I am a bit <mark>fear·ful</mark> that fearful is split because of the dot.</p>",
    /·/
  );
});

it("do not mark ignored character when not inside a word", async () => {
  const jsx = <p>After· standalone · and ·before.</p>;
  executeWordMarkerTest(
    jsx,
    0,
    "<p><mark>After</mark>· standalone · and ·before.</p>",
    /·/
  );
  executeWordMarkerTest(
    jsx,
    2,
    "<p>After· standalone · <mark>and</mark> ·before.</p>",
    /·/
  );
  executeWordMarkerTest(
    jsx,
    3,
    "<p>After· standalone · and ·<mark>before</mark>.</p>",
    /·/
  );
});
