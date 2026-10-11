"use client";

import type { ReactNode } from "react";
import { socialLinks } from "@/content/site";
import { SparkleCopyEmail, SparkleLink } from "@/components/ui/SparkleButton";
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo";
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/csr/LinkedinLogo";
import { XLogoIcon } from "@phosphor-icons/react/dist/csr/XLogo";

const LINKS: { label: string; text: string; icon: ReactNode }[] = [
  { label: "LinkedIn", text: "Check out my LinkedIn", icon: <LinkedinLogoIcon size={14} aria-hidden="true" /> },
  { label: "X", text: "Check out my X", icon: <XLogoIcon size={14} aria-hidden="true" /> },
  { label: "GitHub", text: "Check out my GitHub", icon: <GithubLogoIcon size={14} aria-hidden="true" /> },
];

/** Copy-email and elsewhere-links, as Spacered sparkle buttons. */
export function ContactActions({ className }: { className?: string }) {
  return (
    <div className={className} data-reveal>
      <SparkleCopyEmail copiedLabel="copieeeeeeed!!!">Copy my email</SparkleCopyEmail>
      {LINKS.map(({ label, text, icon }) => {
        const link = socialLinks.find((l) => l.label === label);
        return link ? (
          <SparkleLink key={label} href={link.href} icon={icon}>
            {text}
          </SparkleLink>
        ) : null;
      })}
    </div>
  );
}
