// data/projects.ts
export interface Project {
  slug: string;
  title: string;
  description: string;
  screenshot?: string;
  technologies: string[];
  github?: string;
  link?: string;
  fullDescription?: string;
  images: string[];
  darkImages?: string[];
}

export const projects: Project[] = [
  {
    slug: "bedrock",
    title: "Bedrock",
    description: "Level up your notes with the power of Markdown",
    technologies: ["React", "Tailwind", "TypeScript", "Electron"],
    github: "https://github.com/bendsp/bedrock",
    link: "https://bedrock.desprets.net/",
    fullDescription: `
      A Markdown editor, built with React and Tailwind.
    `,
    images: ["/bedrock_light.webp"],
    darkImages: ["/bedrock_dark.webp"],
  },
  {
    slug: "fundamental",
    title: "Fundamental",
    description: "The easiest wallet in the world!",
    technologies: ["React-Native", "Tailwind", "TypeScript", "Crypto"],
    github: "https://github.com/fdmntl/fundamental-app",
    link: "https://www.fundamentalwallet.com/",
    fullDescription: `
    # Origin
    I founded Fundamental with 5 classmates in 2024 as part of Epitech's [EIP Program](https://experience.epitech.eu/).  
    We recognized DeFi's immense potential and value to the world, but realized existing apps were either far too complex to become mainstream or went against the core principle of decentralization.
    # Mission
    That's why our mission at Fundamental is to make the easiest wallet in the world, without ever compromising on our values of decentralization and security.`,
    images: ["/fundamental_light.webp"],
    darkImages: ["/fundamental_dark.webp"],
  },
  {
    slug: "imagn",
    title: "imagn.xyz",
    description: "An AI-powered image editor and generator",
    technologies: [
      "Next.js",
      "Tailwind",
      "PostgreSQL",
      "Drizzle ORM",
      "Clerk",
      "Stripe",
    ],
    link: "https://imagn.xyz/",
    fullDescription: `
      An AI powered image editor and generator, powered by Gemini-2.0 and GPT-image-1 (coming soon).  
      The app is currently in development and some features are not yet functional.
      I plan to add more models and features in the future.
    `,
    images: ["/imagn_light.webp"],
    darkImages: ["/imagn_dark.webp"],
  },
  {
    slug: "emoji-picker",
    title: "Emoji Color Picker",
    description: "Find out which emoji has the closest average RGB value",
    technologies: ["React", "Tailwind", "TypeScript"],
    github: "https://github.com/bendsp/emoji-color-picker",
    link: "https://emoji.desprets.net/",
    fullDescription: `
      A unique take on color pickers, showing the emoji with the closest average RGB value.  
      Built with Apple's emoji set in mind. I may add support for other emoji sets in the future.
    `,
    images: ["/emojipicker_light.webp"],
    darkImages: ["/emojipicker_dark.webp"],
  },
  {
    slug: "skribbl-chat",
    title: "skribbl.chat",
    description: "A Pictochat inspired chatroom",
    technologies: ["React-Native", "Tailwind", "TypeScript"],
    github: "https://github.com/bendsp/skribbl.chat",
    link: "https://skribbl.chat/",
    fullDescription: `
      A Pictochat inspired chatroom, built with React-Native and Tailwind.  
    `,
    images: ["/skribbl.png"],
  },
  {
    slug: "desprets-net",
    title: "desprets.net",
    description: "To learn recursion, one must first understand recursion.",
    technologies: ["React", "Tailwind", "TypeScript"],
    github: "https://github.com/bendsp/desprets.net",
    link: "https://desprets.net/",
    fullDescription: `
      The website you are on right now!   
      I built this because I wanted somewhere to show off my projects, my skills and who I am.  
      You can see the source code and learn how I built it [on GitHub](https://github.com/bendsp/desprets.net).
    `,
    images: ["/despretsnet_light.webp"],
    darkImages: ["/despretsnet_dark.webp"],
  },
];
