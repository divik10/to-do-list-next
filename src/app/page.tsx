'use client';

import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { format, addDays, startOfWeek } from 'date-fns';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";

type TodoObject = {
  id: string;
  value: string;
  done: boolean;
};

const Home: React.FC = () => {
  const [todo, setTodo] = useState<string>('');
  const [todos, setTodos] = useState<Record<string, TodoObject[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<{ id: string; value: string } | null>(null);

  const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(todos).length > 0) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = () => {
    const formattedDate = formatDate(selectedDate);
    const newTodo: TodoObject = { id: uuid(), value: todo, done: false };

    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      if (!updatedTodos[formattedDate]) {
        updatedTodos[formattedDate] = [];
      }
      updatedTodos[formattedDate] = [newTodo, ...updatedTodos[formattedDate]];
      return updatedTodos;
    });

    setTodo('');
    setShowAddModal(false);
  };

  const markTodoDone = (id: string) => {
    const formattedDate = formatDate(selectedDate);
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      updatedTodos[formattedDate] = updatedTodos[formattedDate].map(todo =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      );
      return updatedTodos;
    });
  };

  const deleteTodo = (id: string) => {
    const formattedDate = formatDate(selectedDate);
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      updatedTodos[formattedDate] = updatedTodos[formattedDate].filter(todo => todo.id !== id);
      return updatedTodos;
    });
  };

  const handleEditTodo = (id: string) => {
    const formattedDate = formatDate(selectedDate);
    const todoToEdit = todos[formattedDate]?.find((todo) => todo.id === id);
    if (todoToEdit) {
      setEditingTodo({ id: todoToEdit.id, value: todoToEdit.value });
    }
  };

  const saveEditedTodo = () => {
    if (editingTodo) {
      const formattedDate = formatDate(selectedDate);
      setTodos((prevTodos) => {
        const updatedTodos = { ...prevTodos };
        updatedTodos[formattedDate] = updatedTodos[formattedDate].map(todo =>
          todo.id === editingTodo.id ? { ...todo, value: editingTodo.value } : todo
        );
        return updatedTodos;
      });
      setEditingTodo(null);
    }
  };

  const startOfWeekDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }).map((_, index) =>
    addDays(startOfWeekDate, index)
  );

  const formattedSelectedDate = formatDate(selectedDate);
  const todosForSelectedDate = todos[formattedSelectedDate] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-black text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Todo App</h1>
      </header>

      <div className="flex justify-around bg-white shadow-md p-3">
        {weekDays.map((date) => (
          <Button
            variant={formatDate(date) === formattedSelectedDate ? 'default' : 'ghost'}
            onClick={() => setSelectedDate(date)}
            key={date.toISOString()}
          >
            <span className="flex flex-col items-center">
              {format(date, 'E')} <br />
              {format(date, 'dd')}
            </span>
          </Button>
        ))}
      </div>

      <main className="flex-grow p-4">
        <h2 className="text-xl mb-4 text-black">Tasks for {formattedSelectedDate}</h2>
        <ul>
          {todosForSelectedDate.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-2"
            >
              {editingTodo?.id === todo.id ? (
                <Input
                  value={editingTodo.value}
                  onChange={(e) =>
                    setEditingTodo((prev) =>
                      prev ? { ...prev, value: e.target.value } : null
                    )
                  }
                  className="w-full text-black"
                />
              ) : (
                <span
                  className={`cursor-pointer text-black ${
                    todo.done ? 'line-through text-gray-500' : ''
                  }`}
                  onClick={() => markTodoDone(todo.id)}
                >
                  {todo.value}
                </span>
              )}
              <div className="flex gap-2">
                {editingTodo?.id === todo.id ? (
                  <Button onClick={saveEditedTodo}>Save</Button>
                ) : (
                  <Button variant="secondary" onClick={() => handleEditTodo(todo.id)}>
                    Edit
                  </Button>
                )}
                <Button variant="destructive" onClick={() => deleteTodo(todo.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {todosForSelectedDate.length === 0 && (
          <p className="text-gray-500">No tasks for this day.</p>
        )}
      </main>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogTrigger>
          <Button variant="default" className="fixed bottom-5 right-5">
            +
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Task</DialogTitle>
          </DialogHeader>
          <Input
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            placeholder="Enter task"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={addTodo}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
