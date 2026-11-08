import { useEffect, useReducer, type ReactNode } from 'react';
import type { Task } from '../types/task';
import { initialTaskState, taskReducer, type TaskState } from '../reducers/taskReducer';
import { TaskContext } from './TaskContextValue';

const STORAGE_KEY = 'study-planner-tasks';
const DELETE_DELAY = 5000;

interface TaskProviderProps {
    children: ReactNode;
}

function loadTaskState(): TaskState {
    try {
        const savedState = localStorage.getItem(STORAGE_KEY);

        if (savedState) {
            const parsedState = JSON.parse(savedState) as TaskState;

            if (Array.isArray(parsedState.tasks)) {
                return {
                    tasks: parsedState.tasks,
                    pendingDelete: parsedState.pendingDelete ?? null,
                };
            }
        }
    } catch (error) {
        console.error('Failed to load tasks from localStorage:', error);
    }

    return initialTaskState;
}

export function TaskProvider({
    children,
}: TaskProviderProps) {
    const [state, dispatch] = useReducer(
        taskReducer,
        undefined,
        loadTaskState
    );

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );
        } catch (error) {
            console.error('Failed to save tasks to localStorage:', error);
        }
    }, [state]);

    useEffect(() => {
        if (!state.pendingDelete) {
            return;
        }

        const taskId = state.pendingDelete.task.id;

        const timeoutId = window.setTimeout(() => {
            dispatch({
                type: 'CONFIRM_DELETE',
                payload: taskId,
            });
        }, DELETE_DELAY);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [state.pendingDelete]);

    const addTask = (task: Task) => {
        dispatch({
            type: 'ADD_TASK',
            payload: task,
        });
    };

    const toggleTask = (id: number) => {
        dispatch({
            type: 'TOGGLE_TASK',
            payload: id,
        });
    };

    const deleteTask = (id: number) => {
        dispatch({
            type: 'DELETE_TASK',
            payload: id,
        });
    };

    const updateTask = (task: Task) => {
        dispatch({
            type: 'UPDATE_TASK',
            payload: task,
        });
    };

    const clearCompleted = () => {
        dispatch({
            type: 'CLEAR_COMPLETED',
        });
    };

    const undoDelete = () => {
        dispatch({
            type: 'UNDO_DELETE',
        });
    };

    return (
        <TaskContext.Provider
            value={{
                tasks: state.tasks,
                addTask,
                toggleTask,
                deleteTask,
                updateTask,
                clearCompleted,
                undoDelete,
                pendingDelete: state.pendingDelete?.task ?? null,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}
