/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-no-comment-textnodes */
import classNames from 'classnames';
import { Todo } from '../types';

type Props = {
  tempTodo: Todo;
  isLoading: boolean;
  onDelete: (id: number) => void;
};

export const TempTodo: React.FC<Props> = ({
  tempTodo,
  isLoading,
  onDelete,
}) => {
  return (
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
  );
};
