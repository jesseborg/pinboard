import { ComponentProps } from "react";

export function ImageIcon({ className }: ComponentProps<"svg">) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M15.25 7C14.1454 7 13.25 7.89543 13.25 9C13.25 10.1046 14.1454 11 15.25 11C16.3546 11 17.25 10.1046 17.25 9C17.25 7.89543 16.3546 7 15.25 7Z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M7 3C4.79086 3 3 4.79086 3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V7C21 4.79086 19.2091 3 17 3H7ZM14.7071 13.2929L18.9323 17.518C18.9764 17.3528 19 17.1792 19 17V7C19 5.89543 18.1046 5 17 5H7C5.89543 5 5 5.89543 5 7V13.5858L7.29289 11.2929C7.68342 10.9024 8.31658 10.9024 8.70711 11.2929L12 14.5858L13.2929 13.2929C13.6834 12.9024 14.3166 12.9024 14.7071 13.2929Z"
				fill="currentColor"
			/>
		</svg>
	);
}
