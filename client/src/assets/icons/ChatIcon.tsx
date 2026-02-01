import type { SVGProps } from "react";
const ChatIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <path d="M40 20c0 11.046-8.954 20-20 20H.002s3.464-8.32 2.078-11.11A19.918 19.918 0 0 1 0 20C0 8.954 8.954 0 20 0s20 8.954 20 20Z" />
  </svg>
);
export default ChatIcon;
