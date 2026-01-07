// data/projects.ts
export interface Project {
  id: string;
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

export const projects = [
  {
    id: "1",
    slug: "bedrock",
    title: "Bedrock",
    description: "Markdown Editor - Level up your notes!",
    technologies: ["React", "Tailwind", "TypeScript", "Electron"],
    github: "https://github.com/bendsp/bedrock",
    link: "https://bedrock.desprets.net/",
    fullDescription: `
      A Markdown editor, built with React and Tailwind.
    `,
    images: ["/bedrock_light.jpg"],
    darkImages: ["/bedrock_dark.jpg"],
  },
  {
    id: "2",
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
    images: ["/Fundamental.jpeg"],
  },
  {
    id: "3",
    slug: "imagn",
    title: "Imagn AI",
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
    images: ["/Imagen.png"],
  },
  {
    id: "4",
    slug: "skribbl-chat",
    title: "Skribbl.chat",
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
    id: "5",
    slug: "emoji-picker",
    title: "Emoji-Picker",
    description: "A unique take on the classic color picker",
    technologies: ["React", "Tailwind", "TypeScript"],
    github: "https://github.com/bendsp/emoji-color-picker",
    link: "https://emoji.desprets.net/",
    fullDescription: `
      A unique take on color pickers, showing the emoji with the closest average RGB value.  
      Built with Apple's emoji set in mind. I may add support for other emoji sets in the future.
    `,
    images: ["/Emoji-Color-Picker.png"],
  },
  {
    id: "6",
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
    images: ["/Desprets.png"],
  },
];
