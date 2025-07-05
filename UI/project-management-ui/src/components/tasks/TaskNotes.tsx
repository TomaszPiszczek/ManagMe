import React, { useState, useEffect, useRef } from 'react';
import { taskNoteService, TaskNote, TaskNoteRequest } from '../../services/taskNoteService';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';

interface TaskNotesProps {
    taskId: string;
    taskName: string;
    onClose: () => void;
    onNotesUpdate?: () => void;
}

const TaskNotes: React.FC<TaskNotesProps> = ({ taskId, taskName, onClose, onNotesUpdate }) => {
    const { user } = useUser();
    const [notes, setNotes] = useState<TaskNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotes();
    }, [taskId]);

    useEffect(() => {
        scrollToBottom();
    }, [notes]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const taskNotes = await taskNoteService.getTaskNotes(taskId);
            setNotes(taskNotes);
        } catch (error) {
            toast.error('Failed to load task notes');
        } finally {
            setLoading(false);
        }
    };

    const canAddNote = () => {
        return user && (user.role === 'ADMIN' || user.role === 'DEVELOPER' || user.role === 'DEVOPS');
    };

    const handleSendNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !user || !canAddNote()) return;

        try {
            setSending(true);
            const isAdminNote = user.role === 'ADMIN';
            const request: TaskNoteRequest = {
                noteText: newNote.trim(),
                isAdminNote
            };

            await taskNoteService.createTaskNote(taskId, request);
            setNewNote('');
            fetchNotes();
            onNotesUpdate?.();
            toast.success('Note added successfully');
        } catch (error) {
            toast.error('Failed to add note');
        } finally {
            setSending(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
    };

    const isCurrentUser = (noteUserId: string) => {
        return user?.id === noteUserId;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl h-2/3 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-2/3 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Task Notes: {taskName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {notes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p>No notes yet. Start a conversation!</p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className={`flex ${isCurrentUser(note.userId) ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        isCurrentUser(note.userId)
                                            ? 'bg-blue-600 text-white'
                                            : note.isAdminNote
                                            ? 'bg-red-100 text-red-900 border border-red-300'
                                            : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-xs font-medium">
                                            {note.userName}
                                            {note.isAdminNote && ' (Admin)'}
                                        </span>
                                        <span className="text-xs opacity-75">
                                            {formatTimestamp(note.creationTimestamp)}
                                        </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{note.noteText}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t dark:border-gray-700 p-4">
                    {canAddNote() ? (
                        <form onSubmit={handleSendNote} className="flex space-x-2">
                            <input
                                type="text"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Type your note..."
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!newNote.trim() || sending}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center space-x-1"
                            >
                                {sending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                                <span>{sending ? 'Sending...' : 'Send'}</span>
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <p>You don't have permission to add notes to this task.</p>
                        </div>
                    )}
                    
                    {user?.role === 'ADMIN' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Your notes will be marked as admin notes and highlighted in red.
                        </p>
                    )}
                    {(user?.role === 'DEVELOPER' || user?.role === 'DEVOPS') && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            You can reply to notes and communicate with the team.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskNotes;