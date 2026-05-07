import { GraduationCap, Target, Code2, Shield, Globe, MapPin, Calendar, Coffee, Send, Phone, Mail } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import aboutBg from "@/assets/about-bg.jpg";
import abulePortrait from "@/assets/abule-portrait.png";

const socials = [
  { icon: Send, href: "https://t.me/abule_48", label: "Telegram" },
  { icon: Phone, href: "https://wa.me/2510954897133", label: "WhatsApp" },
  { icon: Mail, href: "mailto:abuleman1221@gmail.com", label: "Email" },
];

const About = () => (
  <main className="pt-16">
    {/* Hero header */}
    <section className="relative overflow-hidden border-b border-border/30">
      <img src={aboutBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" width={1920} height={768} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="container py-20 relative">
        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-medium text-primary mb-3">About Me</p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Code. Create. <span className="text-gradient">Learn.</span> Repeat.
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Arba Minch, Ethiopia</span>
              <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> CS Student</span>
              <span className="inline-flex items-center gap-1.5"><Coffee className="h-3.5 w-3.5" /> Powered by caffeine</span>
            </div>
            <div className="flex gap-2 mt-5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95" aria-label={label}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0">
              <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary/40 via-primary/10 to-transparent blur-2xl" />
              <div className="relative h-full w-full rounded-full overflow-hidden border-2 border-primary/30 glow-border">
                <img src={abulePortrait} alt="Abule" className="h-full w-full object-cover" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>

    <div className="container max-w-3xl py-16">
      <ScrollReveal delay={80}>
        <div className="space-y-5 text-muted-foreground leading-relaxed mb-14 text-base">
          <p>
            Hey! I'm <span className="text-foreground font-semibold">Abule</span>, a computer science
            student at <span className="text-foreground font-semibold">Arba Minch University</span>.
            I'm passionate about building things with code and understanding how systems work — and break.
          </p>
          <p>
            My journey in tech started with curiosity about how websites work, which quickly led me down
            the rabbit hole of programming, web development, and cybersecurity. I believe in learning
            by doing and sharing what I learn along the way.
          </p>
          <p>
            Outside of code, I'm into music and creative projects. I think the best developers
            bring a bit of creativity into everything they build.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={160}>
        <div className="mb-14">
          <p className="text-sm font-medium text-primary mb-2">Expertise</p>
          <h2 className="text-2xl font-bold mb-6">Skills & Interests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Globe, label: "Web Development", desc: "HTML, CSS, JS, React, TypeScript" },
              { icon: Shield, label: "Cybersecurity", desc: "Network security, pen testing, CTFs" },
              { icon: Code2, label: "Programming", desc: "C++, Python, TypeScript, SQL" },
              { icon: GraduationCap, label: "Computer Science", desc: "Algorithms, data structures, OS" },
            ].map((s) => (
              <div key={s.label} className="group flex gap-4 p-5 rounded-2xl border border-border/50 bg-card card-hover">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-0.5">{s.label}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={240}>
        <p className="text-sm font-medium text-primary mb-2">Ambitions</p>
        <h2 className="text-2xl font-bold mb-6">Goals</h2>
        <div className="space-y-3">
          {[
            "Become a skilled full-stack developer",
            "Contribute to open-source security tools",
            "Land a role in software engineering or cybersecurity",
            "Build products that help people learn",
          ].map((goal, i) => (
            <div key={goal} className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card card-hover">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                {i + 1}
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{goal}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
  </main>
);

export default About;
