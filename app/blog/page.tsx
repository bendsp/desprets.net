"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import AnimatedText from "@/components/animated-text";
import SectionDivider from "@/components/section-divider";

// Sample blog posts data
const blogPosts = [
  {
    slug: "getting-started-with-nextjs",
    title: "Getting Started with Next.js",
    excerpt:
      "Learn how to build modern web applications with Next.js, React's framework for production.",
    date: "2025-04-15",
    readingTime: 5,
    categories: ["Web Development", "React", "Next.js"],
  },
  {
    slug: "understanding-typescript",
    title: "Understanding TypeScript for JavaScript Developers",
    excerpt:
      "A comprehensive guide to TypeScript and how it improves your JavaScript development experience.",
    date: "2025-05-22",
    readingTime: 8,
    categories: ["TypeScript", "JavaScript", "Web Development"],
  },
  {
    slug: "tailwind-css-tips",
    title: "10 Tailwind CSS Tips to Improve Your Workflow",
    excerpt:
      "Practical tips and tricks to make the most out of Tailwind CSS in your projects.",
    date: "2025-06-10",
    readingTime: 6,
    categories: ["CSS", "Tailwind", "Web Development"],
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <AnimatedText
            text="Blog"
            className="text-4xl font-bold mb-2"
            typingSpeed={50}
            showCursor={false}
          />
          <SectionDivider />
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Thoughts, ideas, and insights about web development, programming,
            and technology.
          </p>
        </motion.div>

        <div className="grid gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border border-border rounded-none p-6 hover:border-primary/50 transition-all"
            >
              <Link href={`/blog/posts/${post.slug}`} className="block group">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2 md:mt-0">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{post.readingTime} min read</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map((category, catIndex) => (
                    <span
                      key={catIndex}
                      className="text-xs px-2 py-1 bg-muted rounded-none"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-primary group-hover:underline">
                  <span className="mr-1">Read more</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </main>
    </div>
  );
}
