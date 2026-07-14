import Link from "next/link";
import { LEARNING_PATHS } from "@/lib/learn-content";
import { getPathOverviewHref } from "@/lib/learn-nav";
import LearnLogo from "@/components/learn/LearnLogo";

/** @deprecated Prefer shared marketing Footer on hub/overview pages. */
export default function LearnFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="learn-footer mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <LearnLogo showBadge={false} />
            </div>
            <p className="learn-body-sm max-w-sm">
              Resource edukasi untuk developer yang membangun dengan AI agent.
              Fokus belajar — tanpa distraksi.
            </p>
          </div>

          <div>
            <p className="learn-label mb-4">Tutorial</p>
            <ul className="flex flex-col gap-2.5">
              {LEARNING_PATHS.map((path) => (
                <li key={path.slug}>
                  <Link
                    href={getPathOverviewHref(path)}
                    className="learn-nav-text learn-hover-link text-sm"
                    style={{ color: "var(--learn-text-secondary)" }}
                  >
                    {path.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="learn-label mb-4">ArroBuild</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  href="/"
                  className="learn-nav-text learn-hover-link text-sm"
                  style={{ color: "var(--learn-text-secondary)" }}
                >
                  Situs utama
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="learn-nav-text learn-hover-link text-sm"
                  style={{ color: "var(--learn-text-secondary)" }}
                >
                  Dokumentasi teknis
                </Link>
              </li>
              <li>
                <Link
                  href="/generate"
                  className="learn-nav-text learn-hover-link text-sm"
                  style={{ color: "var(--learn-text-secondary)" }}
                >
                  Generate
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="learn-footer-bottom flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p
            className="learn-nav-text text-xs"
            style={{ color: "var(--learn-text-tertiary)" }}
          >
            © {year} ArroBuild Learn
          </p>
          <p
            className="learn-nav-text text-xs"
            style={{ color: "var(--learn-text-tertiary)" }}
          >
            Dibuat untuk developer Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
