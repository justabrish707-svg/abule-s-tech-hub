import { GraduationCap, Heart, Target, Code2, Shield, Globe } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const About = () => (
  <main className="pt-16">
    <div className="container max-w-2xl py-16">
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-6">About Me</h1>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="space-y-4 text-muted-foreground leading-relaxed mb-12">
          <p>
            Hey! I'm <span className="text-foreground font-medium">Abule</span>, a computer science
            student at <span className="text-foreground font-medium">Arba Minch University</span> in Ethiopia.
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
        <h2 className="text-xl font-bold mb-4">Skills & Interests</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
          {[
            { icon: Globe, label: "Web Development", desc: "HTML, CSS, JS, React" },
            { icon: Shield, label: "Cybersecurity", desc: "Network security, pen testing" },
            { icon: Code2, label: "Programming", desc: "C++, Python, TypeScript" },
            { icon: GraduationCap, label: "Computer Science", desc: "Algorithms, data structures" },
          ].map((s) => (
            <div key={s.label} className="flex gap-3 p-4 rounded-lg border border-border/50 bg-card">
              <s.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold">{s.label}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={240}>
        <h2 className="text-xl font-bold mb-4">Goals</h2>
        <div className="space-y-3">
          {[
            "Become a skilled full-stack developer",
            "Contribute to open-source security tools",
            "Land a role in software engineering or cybersecurity",
            "Build products that help people learn",
          ].map((goal) => (
            <div key={goal} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card">
              <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{goal}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
  </main>
);

export default About;
