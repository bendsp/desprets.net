"use client";

import { useEffect } from "react";
import { Github, Mail, Linkedin, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AnimatedText from "@/components/animated-text";
import SmoothScrollLink from "@/components/smooth-scroll-link";
import ProjectCard from "@/components/project-card";
import SectionDivider from "@/components/section-divider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { createLucideIcon } from "lucide-react";
import { projects } from "@/app/projects";

const XIcon = createLucideIcon("X", [
  [
    "path",
    {
      d: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
      stroke: "none",
      fill: "currentColor",
    },
  ],
]);

// Check if element is in viewport
const useScrollReveal = () => {
  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll(".scroll-reveal");
      const windowHeight = window.innerHeight;
      const visibilityThreshold = 150;

      for (let i = 0; i < reveals.length; i++) {
        const el = reveals[i];
        const rect = el.getBoundingClientRect();

        const isInView =
          rect.top < windowHeight - visibilityThreshold &&
          rect.bottom > visibilityThreshold;

        if (isInView) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on initial load

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
};

export default function Home() {
  useScrollReveal();
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-mono">
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.section
          className="py-8 flex flex-col items-center justify-center text-center relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-4xl md:text-6xl font-bold mb-4 relative z-10">
            Benjamin Desprets
          </div>
          <AnimatedText
            text="Full-stack developer"
            className="text-xl md:text-2xl max-w-2xl mb-6 text-zinc-600 dark:text-gray-400 relative z-10"
            typingSpeed={50}
            showCursor={true}
          />
          <motion.div
            className="flex space-x-4 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <SmoothScrollLink
              href="#about"
              className="inline-block"
              title="Jump to About Me section"
            >
              <Button
                variant="outline"
                className="border-emerald-400 text-emerald-400 hover:bg-emerald-400/10"
              >
                About Me
              </Button>
            </SmoothScrollLink>
            <SmoothScrollLink
              href="#contact"
              className="inline-block"
              title="Jump to Contact section"
            >
              <Button className="bg-emerald-400 text-black hover:bg-emerald-500">
                Contact Me
              </Button>
            </SmoothScrollLink>
          </motion.div>
        </motion.section>

        {/* Projects Section */}
        <section id="projects" className="py-8 scroll-reveal scroll-mt-20">
          <AnimatedText
            text="Projects"
            className="text-3xl font-bold mb-1"
            typingSpeed={100}
            showCursor={false}
          />
          <SectionDivider />
          <div className="mx-auto relative px-2 md:px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
              }}
              plugins={[WheelGesturesPlugin({ forceWheelAxis: "x" })]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {projects.map((project, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <ProjectCard project={project} index={index} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="max-md:left-2 bg-emerald-400 dark:bg-emerald-400 text-black dark:text-black hover:bg-emerald-600 dark:hover:bg-emerald-600" />
              <CarouselNext className="max-md:right-2 bg-emerald-400 dark:bg-emerald-400 text-black dark:text-black hover:bg-emerald-600 dark:hover:bg-emerald-600" />
            </Carousel>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-8 scroll-reveal scroll-mt-20">
          <AnimatedText
            text="About Me"
            className="text-3xl font-bold mb-1"
            typingSpeed={100}
            showCursor={false}
          />
          <SectionDivider />
          <motion.div
            className="flex flex-col md:flex-row items-start md:items-center md:space-x-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full md:w-2/5 flex justify-center md:justify-start md:pl-4">
              <img
                src="/headshot.jpg"
                loading="lazy"
                width="256"
                height="256"
                alt="A headshot of me"
                className="rounded-lg object-cover w-64 h-64 md:w-256 md:h-256"
              />
            </div>
            <div className="w-full mt-4 md:mt-0 md:pl-4">
              <p className="text-zinc-600 dark:text-gray-400 mb-3 mx-4 text-justify md:mx-0 md:mr-10">
                I'm a passionate developer with a focus on creating clean,
                efficient, and user-friendly applications. With expertise in
                both frontend and backend technologies, I enjoy building
                complete solutions that solve real-world problems.
              </p>
              <p className="text-zinc-600 dark:text-gray-400 mb-3 mx-4 text-justify md:mx-0 md:mr-10">
                I'm currently completing my master's degree in computer science
                at Epitech and obtaining a certificate in management at McGill
                University. My academic journey has equipped me with a strong
                foundation in software development, problem-solving, and
                leadership skills.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Education Section */}
        <section id="education" className="py-8 scroll-reveal scroll-mt-20">
          <AnimatedText
            text="Education"
            className="text-3xl font-bold mb-1"
            typingSpeed={100}
            showCursor={false}
          />
          <SectionDivider />
          <div className="space-y-6">
            {education.map((item, index) => (
              <motion.div
                key={index}
                className="relative pl-8 border-l-2 border-zinc-200 dark:border-zinc-800"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                {/* Dot marker */}
                <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-emerald-400"></div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                  <h3 className="text-lg font-semibold">{item.degree}</h3>
                  <span className="text-emerald-400 text-sm font-mono">
                    {item.startYear} - {item.endYear}
                  </span>
                </div>

                <div className="flex items-center mb-2">
                  <GraduationCap className="h-4 w-4 mr-2 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-zinc-600 dark:text-gray-400">
                    {item.institution}
                  </span>
                  {item.location && (
                    <span className="text-zinc-500 dark:text-zinc-400 text-sm ml-2">
                      • {item.location}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-zinc-600 dark:text-gray-400 text-sm">
                    {item.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-8 scroll-reveal scroll-mt-20">
          <AnimatedText
            text="Skills"
            className="text-3xl font-bold mb-1"
            typingSpeed={100}
            showCursor={false}
          />
          <SectionDivider />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Object.entries(skillsByCategory).map(
              ([category, skills], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5 }}
                  className="mb-4"
                >
                  <h3 className="text-xl font-semibold mb-2 text-emerald-400">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.3, delay: index * 0.2 }}
                      >
                        <div className="h-2 w-2 bg-emerald-400 mr-2"></div>
                        <span>{skill}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </motion.div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-8 scroll-reveal scroll-mt-20">
          <AnimatedText
            text="Contact"
            className="text-3xl font-bold mb-1"
            typingSpeed={100}
            showCursor={false}
          />
          <SectionDivider />
          <div className="max-w-md">
            <motion.p
              className="text-zinc-600 dark:text-gray-400 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5 }}
            >
              Interested in working together? Feel free to reach out through any
              of the following channels:
            </motion.p>
            <div className="space-y-3">
              <motion.a
                href="mailto:benjamin.desprets@epitech.eu"
                title="Send email to benjamin.desprets@epitech.eu"
                className="flex items-center group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{
                  opacity: { duration: 0.25, delay: 0 },
                  x: { duration: 0.25, delay: 0 },
                }}
                whileHover={{
                  x: 50,
                  transition: { duration: 0.2, delay: 0 },
                }}
              >
                <Mail className="mr-4 text-emerald-400" />
                <span className="group-hover:text-emerald-400 transition-colors">
                  benjamin.desprets@epitech.eu
                </span>
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/benjamindesprets"
                title="Visit LinkedIn profile"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{
                  opacity: { duration: 0.25, delay: 0 },
                  x: { duration: 0.25, delay: 0 },
                }}
                whileHover={{
                  x: 50,
                  transition: { duration: 0.2, delay: 0 },
                }}
              >
                <Linkedin className="mr-4 text-emerald-400" />
                <span className="group-hover:text-emerald-400 transition-colors">
                  linkedin.com/in/benjamindesprets
                </span>
              </motion.a>
              <motion.a
                href="https://github.com/bendrsio"
                title="Visit GitHub profile"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{
                  opacity: { duration: 0.25, delay: 0 },
                  x: { duration: 0.25, delay: 0 },
                }}
                whileHover={{
                  x: 50,
                  transition: { duration: 0.2, delay: 0 },
                }}
              >
                <Github className="mr-4 text-emerald-400" />
                <span className="group-hover:text-emerald-400 transition-colors">
                  github.com/bendrsio
                </span>
              </motion.a>
              <motion.a
                href="https://x.com/bendrsio"
                title="Visit Twitter (X) profile"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{
                  opacity: { duration: 0.25, delay: 0 },
                  x: { duration: 0.25, delay: 0 },
                }}
                whileHover={{
                  x: 50,
                  transition: { duration: 0.2, delay: 0 },
                }}
              >
                <XIcon className="mr-4 text-emerald-400" />
                <span className="group-hover:text-emerald-400 transition-colors">
                  x.com/bendrsio
                </span>
              </motion.a>
            </div>
          </div>
        </section>
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-emerald-400 text-black shadow-lg hover:bg-emerald-500 transition-all duration-300 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-up"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </motion.button>
      </main>
    </div>
  );
}

// Education data
const education = [
  {
    degree: "Master's in Software Engineering (Expected)",
    institution: "Epitech",
    location: "Montreal, Canada / Paris, France",
    startYear: "2024",
    endYear: "2026",
    description:
      "Specialized in software engineering, full-stack development, and maintaining production systems.",
  },
  {
    degree: "Certificate in Management",
    institution: "McGill University",
    location: "Montreal, Canada",
    startYear: "2024",
    endYear: "2025",
    description:
      "Focused on project management, leadership, finance, and business strategy.",
  },
  {
    degree: "Bachelor's in Software Engineering",
    institution: "Epitech",
    location: "Paris, France / Berlin, Germany",
    startYear: "2020",
    endYear: "2024",
    description:
      "Part of the International Track program. Foundation in programming fundamentals, algorithms, and software development methodologies.",
  },
];

const skillsByCategory = {
  Languages: [
    "C",
    "C++",
    "TypeScript",
    "JavaScript",
    "Solidity",
    "Python",
    "Lua",
  ],
  Technologies: [
    "React",
    "React Native",
    "Next.js",
    "Tailwind",
    "Three.js",
    "Node.js",
    "UIPath",
    "Power Automate",
  ],
  "Data & AI": ["SQL", "Pandas", "NumPy", "Ollama", "OpenAI API", "Gemini API"],
  "Cloud & DevOps": [
    "Azure",
    "AWS",
    "Railway",
    "Git",
    "GitHub Actions",
    "Jenkins",
    "CI/CD",
    "Docker",
  ],
  Blockchain: ["Foundry", "Hardhat", "Viem", "Ethers.js", "OpenZeppelin"],
  "Soft Skills": [
    "Project Management",
    "Teamwork",
    "Leadership",
    "Adaptability",
    "Client Relations",
  ],
};
