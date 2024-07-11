import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Todo } from '../types';

type Props = {
  todos: Todo[];
  onAdd: (title: string) => void;
  onError: (message: string) => void;
  isError: boolean;
  isLoading: boolean;
  isAllCompleted: boolean;
  onToggleAll: () => void;
};

export const Header: React.FC<Props> = ({
  todos,
  onAdd,
  onError,
  isError,
  isLoading,
  isAllCompleted,
  onToggleAll,
}) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (trimmedTitle === '') {
      onError('Title should not be empty');
      setTimeout(() => onError(''), 3000);

      return;
    }

    onAdd(trimmedTitle);
  };

  useEffect(() => {
    if (!isLoading && !isError) {
      setTitle('');
    }
  }, [isLoading, isError]);

  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      {!isLoading && todos.length && (
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active: isAllCompleted,
          })}
          data-cy="ToggleAllButton"
          onClick={onToggleAll}
        />
      )}

      {/* Add a todo on form submit */}
      <form onSubmit={handleSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </form>
    </header>
  );
};