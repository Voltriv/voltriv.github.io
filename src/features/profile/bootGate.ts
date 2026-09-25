/**
 * The boot overlay (`#boot`) covers the page for roughly six seconds on first
 * load. Any entrance animation armed before it clears runs behind it and is
 * finished before anyone can see it, so the reveal system and the counters
 * both wait on this gate.
 *
 * "Cleared" means the overlay is gone from the DOM, or has begun its exit
 * (`.boot-gone`) — starting as it fades out reads better than starting a
 * second later once it unmounts.
 *
 * Deliberately observes BootIntro from the outside rather than coupling to it:
 * that component is not ours to change.
 *
 * @returns a disposer; safe to call whether or not the gate already fired.
 */
export function whenBootClears(run: () => void): () => void {
  const hasCleared = () => {
    const boot = document.getElementById("boot");
    return !boot || boot.classList.contains("boot-gone");
  };

  if (hasCleared() || typeof MutationObserver === "undefined") {
    run();
    return () => undefined;
  }

  const watcher = new MutationObserver(() => {
    if (!hasCleared()) return;
    watcher.disconnect();
    run();
  });

  watcher.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => watcher.disconnect();
}
