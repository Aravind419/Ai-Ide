
import React from 'react';
import CodeIcon from './icons/CodeIcon';

const Header: React.FC = () => (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <CodeIcon className="w-8 h-8 text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-200">
                CodeCanvas<span className="text-cyan-400">.AI</span>
            </h1>
        </div>
        <div className="text-sm text-slate-400">Describe. See. Deploy.</div>
    </header>
);

export default Header;
