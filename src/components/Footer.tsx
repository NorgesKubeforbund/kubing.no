import React from 'react';
import './Footer.css';
import { HashLink as Link } from 'react-router-hash-link';

export const Footer = (): React.ReactElement<any, any> => {

    return (
            <footer className="App-footer">
                <div className="footer-links">
                    <a href="https://www.facebook.com/profile.php?id=61556336000104" className="link">Facebook</a>
                    <a href="https://www.youtube.com/channel/UCfznV1sSz1o5FJAzmR87ijg" className="link">YouTube</a>
                    <a href="https://github.com/NorgesKubeforbund/kubing.no" className="link">GitHub</a>
                    <a href="https://w2.brreg.no/enhet/sok/detalj.jsp?orgnr=994663666" className="link">Om organisasjonen</a>
                    <Link to='/OmOss#kontaktOss' className="link">Kontakt oss</Link>
                </div>
            </footer>
    )
}

export default Footer;
