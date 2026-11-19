// window.estack belongs in the application adapter.
export const documentation = "window.estack";
export const viewport = () => window.innerWidth;
export const platformAction = (props: { estack: () => void }) => props.estack();
