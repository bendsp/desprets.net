import type { MDXComponents } from "mdx/types.js";
import type { ComponentPropsWithoutRef } from "react";
import {
  ExternalLink,
  ProjectsSection,
  Subtle,
} from "@/components/homepage-content";

function Table(props: ComponentPropsWithoutRef<"table">) {
  return <table {...props} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 {...props} />,
    h2: (props) => <h2 {...props} />,
    p: (props) => <p {...props} />,
    ul: (props) => <ul {...props} />,
    ol: (props) => <ol {...props} />,
    li: (props) => <li {...props} />,
    table: Table,
    thead: (props) => <thead {...props} />,
    tbody: (props) => <tbody {...props} />,
    tr: (props) => <tr {...props} />,
    th: (props) => <th {...props} />,
    td: (props) => <td {...props} />,
    hr: (props) => <hr {...props} />,
    code: (props) => <code {...props} />,
    a: (props) => <a {...props} />,
    ExternalLink,
    ProjectsSection,
    Subtle,
    ...components,
  };
}
