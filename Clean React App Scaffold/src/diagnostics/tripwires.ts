export interface TripwireResult {
  name: string;
  ok: boolean;
  note: string;
}

export const runTripwires = () => {
  const results: TripwireResult[] = [];

  // Existing tripwires…

  // Drawer background tripwire
  const drawer = document.querySelector("aside[data-theme='panel']");
  if (drawer) {
    const bg = getComputedStyle(drawer).backgroundColor;
    // Known "bad" raw white background values
    const badBackgrounds = ["rgb(255, 255, 255)", "#fff", "#ffffff"];
    if (badBackgrounds.includes(bg)) {
      results.push({
        name: "drawer.backgroundTheme",
        ok: false,
        note: `Drawer background is raw ${bg} instead of var(--color-panel)`
      });
    } else {
      results.push({
        name: "drawer.backgroundTheme",
        ok: true,
        note: "Drawer background uses design system token"
      });
    }
  }

  return results;
};