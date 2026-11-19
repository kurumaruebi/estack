import { QrCode } from "@estack/ui";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

const meta = {
  title: "Foundation/QrCode",
  component: QrCode,
  args: {
    value:
      "estack://mobile-connect?api=https%3A%2F%2Fapi.estack.invalid&ticket=storybook-mobile-ticket_1234567890abcdef",
    label: "Example Mobile Connect QR code",
  },
  parameters: { layout: "centered", a11y: { test: "error" } },
} satisfies Meta<typeof QrCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
