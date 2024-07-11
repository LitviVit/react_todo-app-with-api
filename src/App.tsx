/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  createTodo,
  deleteTodo,
  editTodo,
  getTodos,
  USER_ID,
} from './api/todos';
import { FilterOptions, Todo } from './types';
import { TodoList } from './components/TodoList';
import { Header } from './components/Header';
import { getPrepearedTodos } from './utils/getPrepearedTodos';
import { Footer } from './components/Footer';
import { Error as ErrorNotification } from './components/Error';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterCompleting, setFilterCompleting] = useState<FilterOptions>(
    FilterOptions.ALL,
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage('Unable to load todos');
      })
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      });
  }, []);

  const handleAddTodo = async (title: string) => {
    const newTodo: Omit<Todo, 'id'> = {
      userId: USER_ID,
      title,
      completed: false,
    };

    const temporaryTodo: Todo = {
      id: 0,
      ...newTodo,
    };

    setTempTodo(temporaryTodo);
    setIsLoading(true);

    try {
      const response = await createTodo(newTodo);

      setIsLoading(true);
      setTodos(prevTodos => [...prevTodos, response]);
      setTempTodo(null);
    } catch (error) {
      setErrorMessage('Unable to add a todo');
      setTempTodo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
  };

  const handleDeleteTodo = async (id: number) => {
    setIsLoading(true);
    setDeletingTodoId(id);
    deleteTodo(id)
      .then(() => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
        setTimeout(() => inputRef.current?.focus(), 0);
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
        //setTimeout(() => setErrorMessage(''), 3000);
      })
      .finally(() => {
        setIsLoading(false);
        setDeletingTodoId(null);
      });
  };

  const handleDeleteCompletedTodos = () => {
    setIsLoading(true);
    const completedTodos = todos.filter(todo => todo.completed);

    Promise.allSettled(
      completedTodos.map(todo => deleteTodo(todo.id).then(() => todo)),
    )
      .then(values => {
        values.forEach(todo => {
          if (todo.status === 'rejected') {
            setErrorMessage('Unable to delete a todo');
          } else {
            setTodos(prevTodos => {
              const deletedTodo = todo.value as Todo;

              return prevTodos.filter(todo1 => todo1.id !== deletedTodo.id);
            });
          }
        });
      })
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 0);
      });
  };

  const handleEditTodo = async (id: number, data: Partial<Todo>) => {
    setIsLoading(true);
    setEditingTodoId(id);
    try {
      const editedTodo = await editTodo(id, data);

      if (editedTodo.id) {
        setTodos(prevTodos =>
          prevTodos.map(todo => {
            if (todo.id === id) {
              return { ...editedTodo };
            }

            return todo;
          }),
        );
        setEditingTodoId(null);
      }
    } catch {
      setErrorMessage('Unable to update a todo');
      setIsLoading(false);
      throw new Error();
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAll = () => {
    setIsLoading(true);
    const allCompleted = todos.every(todo => todo.completed);
    const newStatus = !allCompleted;

    const todosToUpdate = todos.filter(todo => todo.completed !== newStatus);

    Promise.allSettled(
      todosToUpdate.map(todo =>
        editTodo(todo.id, { completed: newStatus }).then(() => todo),
      ),
    )
      .then(results => {
        results.forEach(result => {
          if (result.status === 'rejected') {
            setErrorMessage('Unable to update a todo');
          } else {
            const updatedTodo = result.value as Todo;

            setTodos(prevTodos =>
              prevTodos.map(todo =>
                todo.id === updatedTodo.id
                  ? { ...todo, completed: newStatus }
                  : todo,
              ),
            );
          }
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const filteredTodos = useMemo(
    () => getPrepearedTodos(todos, filterCompleting),
    [todos, filterCompleting],
  );

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          tempTodo={tempTodo}
          onAdd={handleAddTodo}
          onError={handleError}
          isError={!!errorMessage}
          isLoading={isLoading}
          isAllCompleted={todos.every(todo => todo.completed)}
          onToggleAll={handleToggleAll}
          ref={inputRef}
        />

        <TodoList
          todos={filteredTodos}
          tempTodo={tempTodo}
          onDelete={handleDeleteTodo}
          isLoading={isLoading}
          deletingTodoId={deletingTodoId}
          onEdit={handleEditTodo}
          editingTodoId={editingTodoId}
        />
        {!!todos.length && (
          <Footer
            todos={todos.filter(todo => !todo.completed)}
            filter={filterCompleting}
            setFilter={setFilterCompleting}
            isAllActive={todos.every(todo => !todo.completed)}
            onDeleteCompleted={handleDeleteCompletedTodos}
          />
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        onCloseErrorMessage={() => setErrorMessage('')}
      />
    </div>
  );
};
