/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-no-comment-textnodes */
import { Todo } from '../types';
import { TempTodo } from './TempTodo';
import { TodoItem } from './TodoItem';

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
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          todoItem={todo}
          onDelete={onDelete}
          deletingTodoId={deletingTodoId}
          onEdit={onEdit}
          editingTodoId={editingTodoId}
          key={todo.id}
        />
      ))}

      {tempTodo !== null && (
        <TempTodo
          tempTodo={tempTodo}
          isLoading={isLoading}
          onDelete={onDelete}
        />
      )}
    </section>
  );
};
