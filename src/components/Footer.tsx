import React from 'react';
import './Footer.css';
import { HashLink as Link } from 'react-router-hash-link';
import ExternalLink from './ExternalLink';

export const Footer = (): React.ReactElement<any, any> => {

    const links: { href: string, text: string }[] = [
        {
            href: "https://www.facebook.com/profile.php?id=61556336000104",
            text: "Facebook"
        },
        {
            href: "https://www.youtube.com/channel/UCfznV1sSz1o5FJAzmR87ijg",
            text: "YouTube"
        },
        {
            href: "https://github.com/NorgesKubeforbund/kubing.no",
            text: "GitHub"
        },
        {
            href: "https://w2.brreg.no/enhet/sok/detalj.jsp?orgnr=994663666",
            text: "Om organisasjonen"
        },
    ];

    return (
        <footer className="App-footer">
            <div className="footer-links">
                {links.map((link) => (
                    <ExternalLink href={link["href"]} className="link">
                        {link["text"]}
                    </ExternalLink>
                ))}
                <Link to='/OmOss#kontaktOss' className="link">Kontakt oss</Link>
            </div>
        </footer>
    )
}

export default Footer;
