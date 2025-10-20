import React from 'react';
import type { FileData } from '../types';
import FileIcon from './icons/FileIcon';
import DownloadIcon from './icons/DownloadIcon';
import PlusIcon from './icons/PlusIcon';

// Globals from Prettier CDN
declare const prettier: any;
declare const prettierPlugins: any;

interface EditorPanelProps {
    files: FileData[];
    activeFile: string | null;
    onFileSelect: (fileName: string) => void;
    onContentChange: (newContent: string) => void;
    onDownload: () => void;
    onFileCreate: (fileName: string) => void;
}

const formatCode = async (code: string, fileName: string): Promise<string> => {
    const extension = fileName.split('.').pop();
    let parser: string;

    switch (extension) {
        case 'html':
            parser = 'html';
            break;
        case 'css':
            parser = 'css';
            break;
        case 'js':
            parser = 'babel';
            break;
        default:
            return code; // Don't format unknown file types
    }

    try {
        if (typeof prettier === 'undefined' || typeof prettierPlugins === 'undefined') {
            console.warn('Prettier is not available.');
            return code;
        }
        // Using await with prettier.format is the correct modern approach
        return await prettier.format(code, {
            parser,
            plugins: prettierPlugins,
            printWidth: 80,
            tabWidth: 2,
            useTabs: false,
            semi: true,
            singleQuote: true,
        });
    } catch (error) {
        console.warn(`Could not format ${fileName}:`, error);
        return code; // Return original code on formatting error
    }
};

const FileExplorer: React.FC<{
    files: FileData[];
    activeFile: string | null;
    onFileSelect: (fileName: string) => void;
    onDownload: () => void;
    onFileCreate: (fileName: string) => void;
}> = ({ files, activeFile, onFileSelect, onDownload, onFileCreate }) => {
    
    const handleNewFile = () => {
        const fileName = prompt("Enter the new file name (e.g., 'about.html', 'utils.js'):");
        if (fileName && fileName.trim()) {
            onFileCreate(fileName.trim());
        }
    };

    return (
        <div className="bg-slate-800/50 p-3 border-b border-slate-700">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Project Files</h2>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleNewFile}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                        title="Create a new file"
                    >
                        <PlusIcon className="w-4 h-4" />
                        New
                    </button>
                    {files.length > 0 && (
                        <button 
                            onClick={onDownload}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                            title="Download Project as ZIP"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Download
                        </button>
                    )}
                </div>
            </div>
            {files.length > 0 ? (
                <ul>
                    {files.map(file => (
                        <li key={file.name}>
                            <button
                                onClick={() => onFileSelect(file.name)}
                                className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                                    activeFile === file.name
                                        ? 'bg-cyan-500/10 text-cyan-300'
                                        : 'text-slate-300 hover:bg-slate-700/50'
                                }`}
                            >
                                <FileIcon fileType={file.name.split('.').pop()} />
                                {file.name}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="text-center text-sm text-slate-500 py-4 px-2">
                    Your generated files will appear here.
                 </div>
            )}
        </div>
    );
};

const CodeEditor: React.FC<{
    file: FileData | null;
    onContentChange: (newContent: string) => void;
}> = ({ file, onContentChange }) => {

    // Format code when a new file is selected or generated
    React.useEffect(() => {
        if (file) {
            const formatAsync = async () => {
                const formattedContent = await formatCode(file.content, file.name);
                // Only update if content has changed to avoid potential loops
                if (formattedContent.trim() !== file.content.trim()) {
                    onContentChange(formattedContent);
                }
            };
            formatAsync();
        }
        // We only want this to run when the file NAME changes, not its content.
        // This prevents re-formatting on every keystroke.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file?.name]);


    const handleBlur = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (file) {
             const formattedContent = await formatCode(e.target.value, file.name);
             if (formattedContent.trim() !== e.target.value.trim()) {
                onContentChange(formattedContent);
             }
        }
    };

    if (!file) {
        return <div className="p-6 text-slate-500 text-center">Select a file to view its content</div>;
    }

    return (
        <div className="h-full bg-transparent">
            <textarea
                value={file.content}
                onChange={(e) => onContentChange(e.target.value)}
                onBlur={handleBlur}
                className="w-full h-full bg-transparent text-slate-300 font-mono text-sm p-4 resize-none focus:outline-none"
                spellCheck="false"
            />
        </div>
    );
};

const EditorPanel: React.FC<EditorPanelProps> = ({ files, activeFile, onFileSelect, onContentChange, onDownload, onFileCreate }) => {
    const currentFile = files.find(f => f.name === activeFile) || null;
    
    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
            <FileExplorer files={files} activeFile={activeFile} onFileSelect={onFileSelect} onDownload={onDownload} onFileCreate={onFileCreate} />
            <div className="flex-grow relative">
                <CodeEditor file={currentFile} onContentChange={onContentChange} />
            </div>
        </div>
    );
};

export default EditorPanel;
