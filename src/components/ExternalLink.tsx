import React, { ReactNode } from 'react';

interface ExternalLinkProps {
    href: string;
    children?: ReactNode;
    className?: string;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children, className }) => {
    return (
        <a
            href={href}
            className={className}
            target="_blank"
            rel="noopener noreferrer"
        >
            {children}
        </a>
    )
}

export default ExternalLink;