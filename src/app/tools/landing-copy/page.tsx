import { redirect } from "next/navigation";

/** Legacy Landing Page Copy → Copy Studio */
export default function LandingCopyRedirect() {
  redirect("/tools/copy-studio");
}
