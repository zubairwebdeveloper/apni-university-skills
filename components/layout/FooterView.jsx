import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa6";

import { Container } from "./Container";
import { footerNav } from "@/config/site";
import { AnimatedLogo } from "./AnimatedLogo";
import { ScrollToTop } from "./ScrollToTop";
import { FloatingGlows, Reveal, ShimmerLine } from "./FooterMotion";

const contactInfo = [
  {
    icon: Mail,
    label: "support@ztskillspro.com",
    href: "mailto:support@ztskillspro.com",
  },
  { icon: Phone, label: "+92 300 0000000", href: "tel:+923000000000" },
  { icon: MapPin, label: "Islamabad, Pakistan" },
];

const socials = [
  { icon: FaFacebookF, label: "Facebook", href: "https://facebook.com" },
  { icon: FaInstagram, label: "Instagram", href: "https://instagram.com" },
  { icon: FaLinkedinIn, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: FaYoutube, label: "YouTube", href: "https://youtube.com" },
];

// Link with a sliding arrow and an underline that grows on hover.
function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex cursor-pointer items-center text-sm text-foreground/70 outline-none transition-all duration-200 hover:translate-x-1 hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-x-0"
    >
      <ArrowRight
        aria-hidden="true"
        className="size-0 -translate-x-2 text-primary opacity-0 transition-all duration-300 group-hover:mr-1.5 group-hover:size-3.5 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:mr-1.5 group-focus-visible:size-3.5 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
      />
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
        />
      </span>
    </Link>
  );
}

function SocialLink({ icon: Icon, label, href }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group flex size-10 items-center justify-center rounded-full border border-border bg-background/60 text-foreground/70 outline-none backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
    >
      <Icon aria-hidden="true" className="size-4" />
    </Link>
  );
}

function ContactRow({ icon: Icon, label, href }) {
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 break-words">{label}</span>
    </>
  );

  const base =
    "group flex items-center gap-3 text-sm text-foreground/70 transition-colors duration-200";

  return href ? (
    <Link
      href={href}
      className={`${base} outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {content}
    </Link>
  ) : (
    <div className={base}>{content}</div>
  );
}

export function FooterView() {
  return (
    <footer className="relative overflow-hidden border-t bg-gradient-to-b from-secondary/40 via-secondary/60 to-secondary">
      <ShimmerLine />
      <FloatingGlows />

      <Container>
        {/* Main area: brand on the left, navigation spread on the right */}
        <div className="relative z-10 flex flex-col gap-12 py-14 lg:flex-row lg:justify-between lg:gap-16 lg:py-16">
          {/* Brand, about, contact, socials */}
          <Reveal className="space-y-6 lg:max-w-sm">
            <AnimatedLogo tagline="Learn Skills. Build Your Future." />

            <p className="max-w-sm text-sm leading-relaxed text-foreground/70">
              Industry-ready courses, expert mentors and hands-on projects to
              help you master in-demand skills and grow your career.
            </p>

            <ul className="space-y-3">
              {contactInfo.map((item) => (
                <li key={item.label}>
                  <ContactRow {...item} />
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
              {socials.map((social) => (
                <SocialLink key={social.label} {...social} />
              ))}
            </div>
          </Reveal>

          {/* Navigation: 2 columns on mobile, then spread with justify-between / around */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:flex sm:justify-between sm:gap-8 lg:flex-1 lg:justify-around">
            {Object.entries(footerNav).map(([title, links], i) => (
              <Reveal key={title} delay={0.1 + i * 0.1}>
                <nav aria-label={title}>
                  <h2 className="relative inline-block font-sans text-sm font-semibold text-foreground">
                    {title}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1.5 left-0 h-0.5 w-6 rounded-full bg-primary"
                    />
                  </h2>

                  <ul className="mt-5 space-y-3">
                    {links.map((link) => (
                      <li key={link.href}>
                        <FooterLink href={link.href}>{link.label}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <Reveal
          delay={0.2}
          y={12}
          className="relative z-10 flex flex-col items-center gap-2 border-t py-6 text-center text-xs text-foreground/60 sm:flex-row sm:justify-between sm:text-left"
        >
          <p>
            © {new Date().getFullYear()} ZT Skills Pro. All rights reserved.
          </p>
          <p>Made with care for learners everywhere.</p>
        </Reveal>
      </Container>

      <ScrollToTop />
    </footer>
  );
}
