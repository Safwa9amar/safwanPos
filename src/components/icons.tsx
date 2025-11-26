
import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      {...props}
    >
      <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm-48,16v88a8,8,0,0,1-16,0V114.7l-44.69,44.68a8,8,0,0,1-11.31-11.31L132.69,104H112a8,8,0,0,1,0-16h48a8,8,0,0,1,8,8Z" />
    </svg>
  ),
};
