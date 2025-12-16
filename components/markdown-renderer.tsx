"use client";
import { motion } from "framer-motion";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Split the content by double newlines to separate paragraphs
  const sections = content.split("\n\n");

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      {sections.map((section, index) => {
        // Check if the section is a heading
        if (section.startsWith("## ")) {
          return (
            <motion.h2
              key={index}
              className="text-2xl font-bold mt-8 mb-4 text-primary"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {section.replace("## ", "")}
            </motion.h2>
          );
        }

        // Check if the section is a list
        if (section.includes("\n- ")) {
          const [listTitle, ...listItems] = section.split("\n- ");
          return (
            <div key={index}>
              {listTitle && (
                <motion.p
                  className="mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {listTitle}
                </motion.p>
              )}
              <motion.ul
                className="list-disc pl-5 mb-4 space-y-1"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {listItems.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </motion.ul>
            </div>
          );
        }

        // Regular paragraph
        return (
          <motion.p
            key={index}
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {section}
          </motion.p>
        );
      })}
    </div>
  );
}
