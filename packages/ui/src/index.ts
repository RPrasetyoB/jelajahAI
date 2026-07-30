export const ui = {
  buttonPrimary: "ui-button ui-button--primary",
  buttonSecondary: "ui-button ui-button--secondary",
  card: "ui-card",
  input: "ui-input",
  pillLink: "ui-pill-link",
  srOnly: "ui-sr-only"
} as const;

export type UiClassName = (typeof ui)[keyof typeof ui];
