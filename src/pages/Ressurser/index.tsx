import React from 'react';
import './index.css';
import { Link } from 'react-router-dom';

function Ressurser(): React.ReactElement<any, any> {
    const links: { name: string, path: string }[] = [
        { name: 'Butikker', path: './Butikker' },
        { name: 'Guider', path: './Guider' },
        { name: 'Lenker', path: './Lenker' },
        { name: 'Lokale Arrangement', path: './LokaleArrangement' },
    ];

    return (
        <div className="Ressurser">
            <div className='Intro'>
                <h1 className='MainHeader'>Ressurser</h1>
                <p>
                    Her finner du lenker til sider med nyttige ressurser.
                </p>
            </div>
            <div className="resource-links">
                {links.map((link) => (
                    <h2>
                        <Link to={link['path']} className="resource-link">
                            {link['name']}
                        </Link>
                    </h2>
                ))}
            </div>
        </div>
    );
}

export default Ressurser;