import { redirect } from "next/navigation";

/** Legacy Stitch Prompt Composer → ArroDesign */
export default function StitchComposerRedirect() {
  redirect("/tools/arrodesign");
}
