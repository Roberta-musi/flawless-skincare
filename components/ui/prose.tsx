import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { type Inline, parseMarkdown } from "@/lib/markdown";

function InlineContent({ nodes }: { nodes: Inline[] }) {
  return nodes.map((node, i) => {
    if (node.type === "strong") return <strong key={i} className="font-medium text-plum">{node.value}</strong>;
    if (node.type === "em") return <em key={i}>{node.value}</em>;
    if (node.type === "link") {
      const external = node.href.startsWith("http");
      return (
        <a
          key={i}
          href={node.href}
          className="text-fuchsia underline decoration-fuchsia/30 underline-offset-4 hover:decoration-fuchsia"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {node.value}
        </a>
      );
    }
    return <Fragment key={i}>{node.value}</Fragment>;
  });
}

export function Prose({ source, className }: { source: string | null | undefined; className?: string }) {
  if (!source?.trim()) return null;
  return (
    <div className={cn("flex flex-col gap-4 text-[15px] leading-7 text-plum/80", className)}>
      {parseMarkdown(source).map((block, i) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3";
          return (
            <Tag key={i} className={cn("text-plum", block.level === 2 ? "mt-4 text-3xl" : "mt-2 text-2xl")}>
              <InlineContent nodes={block.content} />
            </Tag>
          );
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={i} className={cn("flex flex-col gap-2 pl-5", block.ordered ? "list-decimal" : "list-disc marker:text-gold")}>
              {block.items.map((item, j) => (
                <li key={j} className="pl-1">
                  <InlineContent nodes={item} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <InlineContent nodes={line} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
