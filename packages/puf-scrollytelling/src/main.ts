import scrollama from "scrollama";

const scroller = scrollama();

const handleStepEnter = (response: scrollama.CallbackResponse) => {
  const { index } = response;

  const nodes = document.querySelectorAll(".puf-img-container__cell");

  nodes.forEach((node, i) => {
    if (i === index) {
      node.classList.add("puf-img-container__cell--active");
    } else {
      node.classList.remove("puf-img-container__cell--active");
    }
  });
};

scroller
  .setup({
    step: "#puf-scrolly .puf-step",
    offset: 0.5,
    progress: true,
  })
  .onStepEnter(handleStepEnter);
