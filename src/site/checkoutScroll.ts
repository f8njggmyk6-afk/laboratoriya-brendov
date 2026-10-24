// Recheck the destination while mobile browser chrome and focused layouts settle.
let cancelPending: (() => void) | undefined;
export function revealCheckoutSection(id: string) {
  cancelPending?.();
  const target = document.getElementById(id);
  if (!target) return () => {};
  const root = document.documentElement;
  const previous = root.style.getPropertyValue("scroll-behavior");
  const priority = root.style.getPropertyPriority("scroll-behavior");
  root.style.setProperty("scroll-behavior", "auto", "important");
  let stopped = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  let frame = 0;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    timers.forEach(clearTimeout);
    for (const event of ["touchstart", "wheel", "pointerdown", "keydown"]) window.removeEventListener(event, stop);
    if (previous) root.style.setProperty("scroll-behavior", previous, priority);
    else root.style.removeProperty("scroll-behavior");
    if (cancelPending === stop) cancelPending = undefined;
  };
  const align = () => {
    if (stopped || !target.isConnected) return;
    const headerBottom = Math.max(0, document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0);
    const visibleTop = Math.max(headerBottom, window.visualViewport?.offsetTop ?? 0) + 24;
    root.style.setProperty("--checkout-header-size", `${headerBottom}px`);
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - visibleTop);
    window.scrollTo({top, behavior:"auto"});
  };
  cancelPending = stop;
  // Clip, rather than hidden overflow on checkout's frame prevents a second,
  // invisible scroll container when Safari moves focus.
  target.focus({preventScroll:true});
  align();
  frame = requestAnimationFrame(align);
  for (const delay of [80, 240, 500]) timers.push(setTimeout(align, delay));
  timers.push(setTimeout(stop, 550));
  for (const event of ["touchstart", "wheel", "pointerdown", "keydown"]) window.addEventListener(event, stop, {passive:true});
  return stop;
}
