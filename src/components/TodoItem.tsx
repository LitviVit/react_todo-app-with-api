/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-no-comment-textnodes */
import { useEffect, useRef, useState } from 'react';
import { Todo } from '../types';
import classNames from 'classnames';

type Props = {
  todoItem: Todo;
  onDelete: (id: number) => void;
  deletingTodoId: number | null;
  onEdit: (id: number, data: Partial<Todo>) => void;
  editingTodoId: number | null;
};

export const TodoItem: React.FC<Props> = ({
  todoItem,
  onDelete,
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
    if (editTitle.trim() === '') {
      try {
        await onDelete(todo.id);
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
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: todoItem.completed,
      })}
      key={todoItem.id}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          onChange={() =>
            onEdit(todoItem.id, { completed: !todoItem.completed })
          }
          checked={todoItem.completed}
        />
      </label>
      {currentEditing !== todoItem.id ? (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => handleEdit(todoItem)}
          >
            {todoItem.title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDelete(todoItem.id)}
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
            onBlur={() => handleEditBlur(todoItem)}
            onKeyDown={e => handleEditKeyDown(e, todoItem)}
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
            todoItem.id === deletingTodoId || todoItem.id === editingTodoId,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};