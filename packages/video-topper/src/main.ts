import scrollama from "scrollama";

const scroller = scrollama();

scroller
  .setup({
    step: "#video-topper .video-topper__trigger",
    progress: true,
    offset: 1,
  })
  .onStepProgress((response: scrollama.ProgressCallbackResponse) => {
    const { progress } = response;
    console.log(progress);
    const overlay = document.querySelector(
      "#video-topper .video-topper__overlay"
    ) as HTMLDivElement | null;

    if (overlay) {
      overlay.style.opacity = `${1 - progress}`;
    }
  });
