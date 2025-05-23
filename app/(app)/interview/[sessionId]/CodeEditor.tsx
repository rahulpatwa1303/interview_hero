'use client';

import React, { useState, useRef, useEffect } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor'; // For types
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Define supported languages
const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'plaintext', label: 'Plain Text' }, // Fallback
];

interface CodeEditorProps {
    initialCode?: string;
    language?: string;
    onChange: (code: string, language: string) => void;
    onLanguageChange?: (language: string) => void; // Optional: if parent needs to know
    height?: string;
    theme?: 'vs-dark' | 'light'; // Monaco themes
    readOnly?: boolean;
}

const MonacoCodeEditor: React.FC<CodeEditorProps> = ({
    initialCode = '',
    language: initialLanguage = 'javascript',
    onChange,
    onLanguageChange,
    height = '400px',
    theme = 'vs-dark',
    readOnly = false,
}) => {
    const [code, setCode] = useState<string>(initialCode);
    const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const [editorHeight, setEditorHeight] = useState(height ?? '100%');

    const languageSelectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCode(initialCode); // Sync if initialCode prop changes
    }, [initialCode]);

    useEffect(() => {
        setSelectedLanguage(initialLanguage); // Sync if initialLanguage prop changes
    }, [initialLanguage]);

    useEffect(() => {
        const calculateHeight = () => {
            if (languageSelectorRef.current && languageSelectorRef.current.parentElement) {
                const parentHeight = languageSelectorRef.current.parentElement.clientHeight;
                const selectorHeight = languageSelectorRef.current.offsetHeight;
                const calculatedHeight = parentHeight - selectorHeight - 16; // 16px for gap-2 (8px top, 8px bottom effectively)
                if (calculatedHeight > 50) { // Ensure a minimum sensible height
                    setEditorHeight(`${calculatedHeight}px`);
                } else {
                    setEditorHeight('200px'); // Fallback minimum
                }
            }
        };

        calculateHeight(); // Initial calculation
        // Recalculate on window resize (optional, but good for responsiveness)
        window.addEventListener('resize', calculateHeight);
        return () => window.removeEventListener('resize', calculateHeight);
    }, []); // Run once and on resize


    const handleEditorDidMount: OnMount = (editorInstance, monacoInstance) => {
        editorRef.current = editorInstance;
        monacoRef.current = monacoInstance;

        // You can configure editor options here if needed
        // editorInstance.updateOptions({ /* ... */ });

        // Example: Enable Ctrl+S to trigger save (or your onChange)
        // editorInstance.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
        //   onChange(editorInstance.getValue(), selectedLanguage);
        //   console.log('Code saved via Ctrl+S');
        // });

        // Focus the editor
        editorInstance.focus();
        editorInstance.addCommand(
            monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
            () => {
                onChange(editorInstance.getValue(), selectedLanguage);
                console.log('Code saved with Ctrl+S');
            }
        );
    };

    const handleCodeChange = (value: string | undefined) => {
        const newCode = value || '';
        setCode(newCode);
        onChange(newCode, selectedLanguage);
    };

    const handleLanguageChange = (newLanguage: string) => {
        setSelectedLanguage(newLanguage);
        if (monacoRef.current && editorRef.current) {
            monacoRef.current.editor.setModelLanguage(editorRef.current.getModel()!, newLanguage);
        }
        if (onLanguageChange) {
            onLanguageChange(newLanguage);
        }
        // Also propagate change upwards if language is part of the "answer"
        onChange(code, newLanguage);
    };

    return (
        <div className="flex flex-col h-full w-full gap-2">
            <div className="flex-shrink-0 flex items-center gap-2" ref={languageSelectorRef}> {/* Language selector should not grow */}
                <Label htmlFor="language-select" className="text-sm">Language:</Label>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={readOnly}>
                    <SelectTrigger id="language-select" className="h-9 w-full sm:w-[180px] data-[placeholder]:text-muted-foreground">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        {supportedLanguages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {/* This div will take the remaining height */}
            <div className="border rounded-lg relative flex-grow" style={{ height: editorHeight }}> {/* Added relative for potential absolute positioned editor elements */}
                <Editor
                    // The Editor component itself doesn't always need a height prop if its parent has a defined height
                    // and the editor is configured to fill it (which it often does by default).
                    // However, explicitly setting height="100%" is safer.
                    height="100%"
                    language={selectedLanguage}
                    theme={theme}
                    value={code}
                    onChange={handleCodeChange}
                    onMount={handleEditorDidMount}
                    options={{
                        selectOnLineNumbers: true,
                        automaticLayout: true, // VERY IMPORTANT for responsive height
                        minimap: { enabled: true },
                        readOnly: readOnly,
                        wordWrap: 'on',
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>
        </div>
    );
};

export default MonacoCodeEditor;