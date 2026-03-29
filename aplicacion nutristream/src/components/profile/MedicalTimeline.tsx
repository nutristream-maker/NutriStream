import React from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

interface TimelineEvent {
    date: string;
    title: string;
    description?: string;
    type: 'condition' | 'vaccine' | 'procedure' | 'checkup';
    status?: string;
}

const MedicalTimeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
    // Sort events by date descending
    const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getIcon = (type: string) => {
        switch (type) {
            case 'vaccine': return <FiCheckCircle className="text-green-500" />;
            case 'condition': return <FiAlertCircle className="text-red-500" />;
            case 'checkup': return <FiActivity className="text-blue-500" />;
            default: return <FiClock className="text-slate-500" />;
        }
    };

    return (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8 py-4">
            {sortedEvents.map((event, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-8"
                >
                    {/* Dot */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{event.date}</span>
                            <span className="bg-slate-100 dark:bg-slate-700 p-1 rounded-full text-lg">
                                {getIcon(event.type)}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{event.title}</h3>
                        {event.description && <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{event.description}</p>}
                        {event.status && (
                            <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${event.status === 'Recuperado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {event.status}
                            </span>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default MedicalTimeline;
