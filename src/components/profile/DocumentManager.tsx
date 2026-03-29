import React from 'react';
import { FiFileText, FiDownload, FiUpload, FiTrash2, FiImage } from 'react-icons/fi';
import { Card, Button } from '../ui/Shared';

interface MedicalDoc {
    id: number;
    name: string;
    type: string;
    date: string;
    size: string;
    url: string;
}

const DocumentManager: React.FC<{ documents: MedicalDoc[] }> = ({ documents }) => {

    const getIcon = (type: string) => {
        if (type.includes('Imagen') || type.includes('Radiografía')) return <FiImage className="text-purple-500 text-xl" />;
        return <FiFileText className="text-blue-500 text-xl" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                    <h3 className="font-bold text-lg">Mis Documentos</h3>
                    <p className="text-slate-500 text-sm">Gestiona tus informes, analíticas y pruebas.</p>
                </div>
                <Button icon={FiUpload}>Subir Documento</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                    <Card key={doc.id} className="!p-4 flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm">
                                {getIcon(doc.type)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-xs">{doc.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{doc.date}</span>
                                    <span>•</span>
                                    <span>{doc.type}</span>
                                    <span>•</span>
                                    <span>{doc.size}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                                <FiDownload />
                            </button>
                            <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-red-500 transition-colors">
                                <FiTrash2 />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default DocumentManager;
