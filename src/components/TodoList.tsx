/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-no-comment-textnodes */
import classNames from 'classnames';
import { Todo } from '../types';
import { useEffect, useRef, useState } from 'react';

type Props = {
  todos: Todo[];
  tempTodo: Todo | null;
  onDelete: (id: number) => void;
  isLoading: boolean;
  deletingTodoId: number | null;
  onEdit: (id: number, data: Partial<Todo>) => void;
  editingTodoId: number | null;
};

export const TodoList: React.FC<Props> = ({
  todos,
  tempTodo,
  onDelete,
  isLoading,
  deletingTodoId,
  onEdit,
  editingTodoId,
}) => {
  const [editTitle, setEditTitle] = useState('');
  const [currentEditing, setCurrentEditing] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (todo: Todo) => {
    setEditTitle(todo.title);
    setCurrentEditing(todo.id);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
  };

  const handleEditBlur = async (todo: Todo) => {
    //const trimmeredTitle = editTitle.trim();

    if (editTitle.trim() === '') {
      try {
        await onDelete(todo.id);
        //setCurrentEditing(null);
      } catch (err) {
        setCurrentEditing(todo.id);
        inputRef.current?.focus();
      }
    } else if (editTitle !== todo.title) {
      try {
        await onEdit(todo.id, { title: editTitle.trim() });
        setCurrentEditing(null);
      } catch (err) {
        setCurrentEditing(todo.id);
        inputRef.current?.focus();
      }
    } else {
      setCurrentEditing(null);
    }

    //setCurrentEditing(null);
  };

  const handleEditKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    todo: Todo,
  ) => {
    if (e.key === 'Enter') {
      handleEditBlur(todo);
    } else if (e.key === 'Escape') {
      setCurrentEditing(null);
      setEditTitle(todo.title);
    }
  };

  useEffect(() => {
    if (currentEditing !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentEditing, inputRef]);

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <div
          data-cy="Todo"
          className={classNames('todo', {
            completed: todo.completed,
          })}
          key={todo.id}
        >
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              onChange={() => onEdit(todo.id, { completed: !todo.completed })}
              checked={todo.completed}
            />
          </label>
          {currentEditing !== todo.id ? (
            <>
              <span
                data-cy="TodoTitle"
                className="todo__title"
                onDoubleClick={() => handleEdit(todo)}
              >
                {todo.title}
              </span>
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
                onClick={() => onDelete(todo.id)}
              >
                ×
              </button>
            </>
          ) : (
            <form onSubmit={e => e.preventDefault()}>
              <input
                data-cy="TodoTitleField"
                type="text"
                className="todo__title-field"
                placeholder="Empty todo will be deleted"
                value={editTitle}
                onChange={handleEditChange}
                onBlur={() => handleEditBlur(todo)}
                onKeyDown={e => handleEditKeyDown(e, todo)}
                autoFocus
                ref={inputRef}
              />
            </form>
          )}

          {/* overlay will cover the todo while it is being deleted or updated */}
          <div
            data-cy="TodoLoader"
            className={classNames('modal overlay', {
              'is-active':
                todo.id === deletingTodoId || todo.id === editingTodoId,
            })}
          >
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </div>
      ))}

      {tempTodo !== null && (
        <div
          data-cy="Todo"
          className={classNames('todo', {
            completed: tempTodo.completed,
          })}
          key={tempTodo.id}
        >
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={tempTodo.completed}
            />
          </label>
          <span data-cy="TodoTitle" className="todo__title">
            {tempTodo.title}
          </span>
          {/* Remove button appears only on hover */}
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDelete(tempTodo.id)}
          >
            ×
          </button>
          {/* overlay will cover the todo while it is being deleted or updated */}
          <div
            data-cy="TodoLoader"
            className={classNames('modal overlay', { 'is-active': isLoading })}
          >
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </div>
      )}
    </section>
  );
};
