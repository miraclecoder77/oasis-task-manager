import TaskCard from './TaskCard.jsx';

function TaskList({ tasks, onEdit }) {
  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} />
      ))}
    </div>
  );
}

export default TaskList;
