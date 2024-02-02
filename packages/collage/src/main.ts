import scrollama from "scrollama";

const scroller = scrollama();

scroller
  .setup({
    step: ".collage__overlay",
    progress: true,
  })
  .onStepProgress((response) => {
    const { progress, element } = response;

    element.style.opacity = `${1 - progress}`;
  });
