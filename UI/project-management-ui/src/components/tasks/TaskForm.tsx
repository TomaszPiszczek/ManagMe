import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Task } from '../../services/taskService';
import { Item } from '../../services/itemService';

interface TaskFormProps {
    task?: Task | null;
    stories: Item[];
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Task name is required').max(255, 'Name too long'),
    description: Yup.string().max(1000, 'Description too long'),
    priority: Yup.string().required('Priority is required'),
    projectId: Yup.string().required('Project is required'),
    estimatedTime: Yup.number().min(1, 'Must be at least 1 hour').max(1000, 'Too many hours'),
});

const TaskForm: React.FC<TaskFormProps> = ({ task, stories, onSubmit, onCancel }) => {
    const initialValues = {
        name: task?.name || '',
        description: task?.description || '',
        priority: task?.priority || 'MEDIUM',
        projectId: task?.project?.id || '',
        estimatedTime: task?.estimatedTime || '',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {task ? 'Edit Task' : 'Create New Task'}
                    </h3>
                    
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Task Name
                                    </label>
                                    <Field
                                        type="text"
                                        name="name"
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter task name"
                                    />
                                    <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="description"
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter task description"
                                    />
                                    <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                                </div>

                                <div>
                                    <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Story
                                    </label>
                                    <Field
                                        as="select"
                                        name="itemId"
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select a story</option>
                                        {stories.map((story) => (
                                            <option key={story.id} value={story.id}>
                                                {story.name}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="itemId" component="div" className="mt-1 text-sm text-red-600" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Priority
                                        </label>
                                        <Field
                                            as="select"
                                            name="priority"
                                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </Field>
                                        <ErrorMessage name="priority" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>

                                    <div>
                                        <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Hours
                                        </label>
                                        <Field
                                            type="number"
                                            name="estimatedTime"
                                            min="1"
                                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Est. hours"
                                        />
                                        <ErrorMessage name="estimatedTime" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : task ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default TaskForm;