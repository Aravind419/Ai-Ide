import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import PromptInput from './components/PromptInput';
import type { FileData } from './types';
import { generateWebsiteCode } from './services/geminiService';

// Make JSZip available from CDN
declare const JSZip: any;

const initialPrompt = "Create a landing page for a fictional space exploration company called 'Stellar Ventures'. It should have a hero section with a call-to-action button, an 'Our Missions' section with three mission cards, and a simple footer. Use a dark, futuristic theme with blue and purple accents.";

const App: React.FC = () => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [prompt, setPrompt] = useState(initialPrompt);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const generatedFiles = await generateWebsiteCode(prompt);
            setFiles(generatedFiles);
            // Automatically select index.html if it exists
            if (generatedFiles.some(f => f.name === 'index.html')) {
                setActiveFile('index.html');
            } else if (generatedFiles.length > 0) {
                setActiveFile(generatedFiles[0].name);
            } else {
                setActiveFile(null);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
            setFiles([]);
            setActiveFile(null);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    const handleFileSelect = (fileName: string) => {
        setActiveFile(fileName);
    };

    const handleContentChange = (newContent: string) => {
        if (!activeFile) return;
        setFiles(currentFiles =>
            currentFiles.map(file =>
                file.name === activeFile ? { ...file, content: newContent } : file
            )
        );
    };
    
    const handleFileCreate = (fileName: string) => {
        if (!fileName.match(/^[a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+$/)) {
            alert('Invalid file name. Please use a valid name with an extension (e.g., "about.html").');
            return;
        }

        if (files.some(file => file.name.toLowerCase() === fileName.toLowerCase())) {
            alert(`A file named "${fileName}" already exists.`);
            return;
        }

        const newFile: FileData = {
            name: fileName,
            content: ``,
        };

        setFiles(currentFiles => [...currentFiles, newFile]);
        setActiveFile(fileName);
    };

    const handleDownloadZip = useCallback(() => {
        if (typeof JSZip === 'undefined') {
            setError("Could not download. JSZip library not found.");
            return;
        }
        const zip = new JSZip();
        files.forEach(file => {
            zip.file(file.name, file.content);
        });
        zip.generateAsync({ type: "blob" })
            .then(function(content: Blob) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "codecanvas-project.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    }, [files]);
    
    // Auto-generate on first load for demonstration
    useEffect(() => {
      handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col bg-slate-900">
            <Header />
            <main className="flex-grow p-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                <div className="flex flex-col gap-4 min-h-0">
                    <div className="flex-grow min-h-0">
                        <EditorPanel
                            files={files}
                            activeFile={activeFile}
                            onFileSelect={handleFileSelect}
                            onContentChange={handleContentChange}
                            onDownload={handleDownloadZip}
                            onFileCreate={handleFileCreate}
                        />
                    </div>
                    <PromptInput
                        prompt={prompt}
                        setPrompt={setPrompt}
                        onSubmit={handleGenerate}
                        isLoading={isLoading}
                    />
                </div>
                <div className="min-h-0">
                    <PreviewPanel files={files} />
                </div>
            </main>
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
                    <h4 className="font-bold mb-1">Error</h4>
                    <p className="text-sm">{error}</p>
                    <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-100 hover:text-white">&times;</button>
                </div>
            )}
        </div>
    );
};

export default App;
