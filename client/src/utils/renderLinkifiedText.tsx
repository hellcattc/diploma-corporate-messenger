import type { JSX } from "react";
import TaskLink from "../components/TaskLink";

interface linkifyOpts {
  unlink: boolean;
}

const renderLinkifiedText = (text: string, opts: linkifyOpts) => {
  const parts: (string | JSX.Element)[] = [];
  const linkPattern = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    // Текст до совпадения
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const title = match[1];
    const path = match[2];

    if (opts.unlink) {
      parts.push(title);
    } else {
      parts.push(<TaskLink key={match.index} title={title} url={`${path}`} />);
    }
    lastIndex = linkPattern.lastIndex;
  }

  // Остаток текста
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};

export default renderLinkifiedText;
