/**
 * Four edge spans that trace a card's border on hover, drawn in sequence
 * (top -> right -> bottom -> left). Purely decorative; the parent needs the
 * `profile-draw` class for the hover rules to apply.
 */
export function BorderDraw() {
  return (
    <span className="profile-draw-border" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
