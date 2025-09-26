import React, { useState, useEffect } from 'react';
import { FaCheck, FaEdit, FaSpinner, FaExclamationTriangle, FaCalendarAlt, FaFlag } from 'react-icons/fa';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  // Load tasks from localStorage or mock data
  useEffect(() => {
    const loadTasks = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          setTasks(parsedTasks);
          setFilteredTasks(parsedTasks);
        } else {
          const mockTasks = [
            { _id: '1', title: 'Complete project documentation', description: 'Write documentation', status: 'incomplete', priority: 'high', dueDate: new Date().toISOString() },
            { _id: '2', title: 'Fix navigation bug', description: 'Sidebar bug', status: 'complete', priority: 'medium', dueDate: new Date().toISOString() },
            { _id: '3', title: 'Implement user feedback', description: 'Add feedback form', status: 'incomplete', priority: 'low', dueDate: new Date(Date.now() + 86400000).toISOString() },
            { _id: '4', title: 'Update dependencies', description: 'Update npm packages', status: 'incomplete', priority: 'medium', dueDate: new Date(Date.now() + 172800000).toISOString() },
          ];
          localStorage.setItem('tasks', JSON.stringify(mockTasks));
          setTasks(mockTasks);
          setFilteredTasks(mockTasks);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();

    const handleStorageChange = (e) => {
      if (e.key === 'tasks') {
        try {
          const updatedTasks = JSON.parse(e.newValue || '[]');
          setTasks(updatedTasks);
          setFilteredTasks(updatedTasks);
        } catch { }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter tasks as user types
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredTasks(
      tasks.filter(task =>
        task.title.toLowerCase().includes(term) || task.description.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, tasks]);

  const handleStatusChange = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task._id === taskId
        ? { ...task, status: task.status === 'complete' ? 'incomplete' : 'complete', updatedAt: new Date().toISOString() }
        : task
    );
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    window.dispatchEvent(new StorageEvent('storage', { key: 'tasks', newValue: JSON.stringify(updatedTasks) }));
  };

  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditForm({ title: task.title, description: task.description });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveTask = (taskId) => {
    if (!editForm.title.trim()) { alert('Task title cannot be empty'); return; }
    const updatedTasks = tasks.map(task =>
      task._id === taskId
        ? { ...task, title: editForm.title, description: editForm.description, updatedAt: new Date().toISOString() }
        : task
    );
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    setEditingTask(null);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    window.dispatchEvent(new StorageEvent('storage', { key: 'tasks', newValue: JSON.stringify(updatedTasks) }));
  };

  const cancelEditing = () => setEditingTask(null);

  const formatDate = (dateString) => {
    try { return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return 'Invalid date'; }
  };

  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-4 flex justify-center items-center"><FaSpinner className="animate-spin mr-2" />Loading tasks...</div>;
  if (error) return <div className="p-4 text-red-500 flex items-center"><FaExclamationTriangle className="mr-2" />{error}</div>;
  if (tasks.length === 0) return <div className="p-4 text-gray-500">No tasks available.</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow max-h-96 overflow-y-auto">
      {/* Search Input */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tasks..."
        className="w-full p-2 mb-3 border text-black rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      <ul className="space-y-3">
        {filteredTasks.map(task => (
          <li key={task._id} className="border-b pb-3">
            {editingTask === task._id ? (
              <div className="space-y-2">
                <input type="text" name="title" value={editForm.title} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Task title" />
                <textarea name="description" value={editForm.description} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Task description" rows={2} />
                <div className="flex justify-end gap-2">
                  <button onClick={cancelEditing} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                  <button onClick={() => saveTask(task._id)} className="px-3 py-1 bg-blue-500 text-white rounded">Save</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <h4 className={`${task.status === 'complete' ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.title}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => handleStatusChange(task._id)} className={`p-1 rounded ${task.status === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}><FaCheck /></button>
                    <button onClick={() => startEditing(task)} className="p-1 rounded bg-blue-100 text-blue-600"><FaEdit /></button>
                  </div>
                </div>
                <p className={`${task.status === 'complete' ? 'text-gray-400' : 'text-gray-600'} mt-1 text-sm`}>{task.description}</p>
                <div className="mt-2 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded flex items-center ${task.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}><FaCheck className="mr-1" />{task.status === 'complete' ? 'Complete' : 'Incomplete'}</span>
                    {task.priority && <span className={`text-xs px-2 py-1 rounded flex items-center ${getPriorityClasses(task.priority)}`}><FaFlag className="mr-1" />{task.priority}</span>}
                  </div>
                  {task.dueDate && <span className="text-xs text-gray-500 flex items-center"><FaCalendarAlt className="mr-1" />{formatDate(task.dueDate)}</span>}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
