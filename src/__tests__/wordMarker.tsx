import React from "react";
import Adapter from "enzyme-adapter-react-16";
import { act } from "react-dom/test-utils";
import { configure, mount } from "enzyme";
import WordMarker from "../internals/components/WordMarker";

const executeWordMarkerTest = (
  jsx: JSX.Element,
  markedWordIndex: number,
  expectedResultingHtml: string
) => {
  configure({ adapter: new Adapter() });

  let component: any;
  act(() => {
    component = mount(
      <WordMarker markedWordIndex={markedWordIndex}>{jsx}</WordMarker>
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
