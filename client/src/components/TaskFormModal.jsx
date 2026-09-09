import { useEffect, useState } from 'react';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';
import Textarea from './ui/Textarea.jsx';
import Select from './ui/Select.jsx';
import Alert from './ui/Alert.jsx';
import { ApiError } from '../api/client.js';
import { STATUS_META, STATUS_ORDER } from '../lib/status.js';
import { toDateInputValue } from '../lib/date.js';

const statusOptions = STATUS_ORDER.map((value) => ({
  value,
  label: STATUS_META[value].label,
}));

const emptyForm = {
  title: '',
  description: '',
  status: 'pending',
  dueDate: '',
};

const toFormState = (task) =>
  task
    ? {
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        dueDate: toDateInputValue(task.dueDate),
      }
    : emptyForm;

function TaskFormModal({ open, task, onClose, onSubmit, submitting }) {
  const [values, setValues] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const isEditing = Boolean(task);

  // Reset whenever the modal opens, so a previous edit never leaks into a
  // subsequent create.
  useEffect(() => {
    if (open) {
      setValues(toFormState(task));
      setFieldErrors({});
      setFormError(null);
    }
  }, [open, task]);

  const setField = (name) => (event) =>
    setValues((current) => ({ ...current, [name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const payload = {
      title: values.title,
      description: values.description.trim() === '' ? null : values.description,
      status: values.status,
      dueDate: values.dueDate === '' ? null : values.dueDate,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        setFieldErrors(error.details);
      }
      setFormError(
        error instanceof ApiError ? error.message : 'Something went wrong'
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit task' : 'New task'}
    >
      {formError && (
        <div className="mt-4">
          <Alert title="Could not save this task">{formError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <Input
          label="Title"
          name="title"
          value={values.title}
          onChange={setField('title')}
          placeholder="What needs doing?"
          error={fieldErrors.title?.[0]}
        />
        <Textarea
          label="Description"
          name="description"
          rows={3}
          value={values.description}
          onChange={setField('description')}
          placeholder="Optional detail"
          error={fieldErrors.description?.[0]}
        />
        <Select
          label="Status"
          name="status"
          value={values.status}
          onChange={setField('status')}
          options={statusOptions}
          error={fieldErrors.status?.[0]}
        />
        <Input
          label="Due date"
          name="dueDate"
          type="date"
          value={values.dueDate}
          onChange={setField('dueDate')}
          error={fieldErrors.dueDate?.[0]}
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEditing ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskFormModal;
