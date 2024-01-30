import scrollama from "scrollama";

const scroller = scrollama();

const handleStepEnter = (response: scrollama.CallbackResponse) => {
  const { index } = response;

  const nodes = document.querySelectorAll(".puf-step__graphic");

  nodes.forEach((node, i) => {
    if (i === index) {
      node.classList.add("puf-step__graphic--active");
    } else {
      node.classList.remove("puf-step__graphic--active");
    }
  });
};

scroller
  .setup({
    step: "#puf-scrolly article .puf-step",
    offset: 0.5,
  })
  .onStepEnter(handleStepEnter);
