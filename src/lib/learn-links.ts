/** Props for opening Learn Hub in a new browser tab from the main site. */
export const OPEN_LEARN_IN_NEW_TAB = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export const LEARN_HUB_PATH = "/learn";

export const LEARN_PRIMARY_NAV_HEIGHT = 68;
export const LEARN_TOPIC_STRIP_HEIGHT = 48;

/** Combined height of primary nav + topic strip (px). */
export const LEARN_NAV_HEIGHT =
  LEARN_PRIMARY_NAV_HEIGHT + LEARN_TOPIC_STRIP_HEIGHT;
