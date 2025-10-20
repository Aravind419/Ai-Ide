
import React, { useState, useEffect } from 'react';
import type { FileData } from '../types';
import WebIcon from './icons/WebIcon';

interface PreviewPanelProps {
    files: FileData[];
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ files }) => {
    const [srcDoc, setSrcDoc] = useState('');

    useEffect(() => {
        if (files.length === 0) {
            setSrcDoc('');
            return;
        }

        const htmlFile = files.find(f => f.name === 'index.html');
        if (!htmlFile) {
            setSrcDoc('<div style="color: #cbd5e1; font-family: sans-serif; padding: 2rem;">index.html not found.</div>');
            return;
        }

        const cssFile = files.find(f => f.name === 'style.css');
        const jsFile = files.find(f => f.name === 'script.js');

        const styleTag = cssFile ? `<style>${cssFile.content}</style>` : '';
        const scriptTag = jsFile ? `<script>${jsFile.content}</script>` : '';

        // Inject styles and scripts into the HTML content
        let finalHtml = htmlFile.content;
        
        // Inject style tag into the head
        if (styleTag) {
            if (finalHtml.includes('</head>')) {
                 finalHtml = finalHtml.replace('</head>', `${styleTag}</head>`);
            } else {
                 finalHtml = styleTag + finalHtml;
            }
        }
       
        // Inject script tag before closing body tag
        if (scriptTag) {
             if (finalHtml.includes('</body>')) {
                finalHtml = finalHtml.replace('</body>', `${scriptTag}</body>`);
            } else {
                finalHtml += scriptTag;
            }
        }
       
        setSrcDoc(finalHtml);

    }, [files]);

    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
            <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex items-center gap-2">
                 <WebIcon className="w-5 h-5 text-slate-400" />
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Preview</h2>
            </div>
            {files.length > 0 ? (
                 <iframe
                    srcDoc={srcDoc}
                    title="Website Preview"
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full bg-white"
                />
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-500 p-4">
                    <WebIcon className="w-16 h-16 mb-4 text-slate-600" />
                    <h3 className="text-lg font-semibold">Your Website Preview</h3>
                    <p className="text-sm text-center">Use the prompt below to generate a website and see it live here.</p>
                </div>
            )}
        </div>
    );
};

export default PreviewPanel;
