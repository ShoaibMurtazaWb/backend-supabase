"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase-client";
import { Session } from "@supabase/supabase-js";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function TaskManager({session}: {session: Session}) {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newDescription, setNewDescription] = useState("");

  const fetchTasks = async () => {
    const { error, data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching data:", error.message);
    }

    setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const channel = supabase.channel("tasks-channel");

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "tasks" },
      (payload) => {
        const newTask = payload.new as Task;
        setTasks((prev) => [...prev, newTask]);
      },
    );

    channel.subscribe();

    // This cleanup function fixes your error
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const updateTask = async (id: number) => {
    const { error, data } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", id);
    if (error) {
      console.error("Error updating tasks: ", error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error, data } = await supabase
      .from("tasks")
      .insert({...newTask, email: session.user.email})
      .select()
      .single();
    if (error) {
      console.error("Error Inserting tasks: ", error.message);
    }
    setNewTask({ title: "", description: "" });
  };

  return (
    // Background container covering full viewport height with centered contents
    <div className="w-full max-w-md mx-auto p-4 bg-[#1E1E1E] text-white rounded-lg border border-gray-800 shadow-xl mt-12 flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-6 tracking-wide">
        Task Manager CRUD
      </h2>

      {/* Centered Form */}
      <form
        className="w-full max-w-100 flex flex-col items-center mb-6"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Task Title"
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full mb-3 p-2 bg-[#2d2d2d] border border-gray-600 rounded text-center text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400"
        />
        <textarea
          placeholder="Task Description"
          rows={2}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full mb-4 p-2 bg-[#2d2d2d] border border-gray-600 rounded text-center text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400 resize-none"
        />
        <button
          type="submit"
          className="py-1.5 px-4 bg-[#2d2d2d] border border-gray-600 rounded text-sm hover:bg-[#3d3d3d] transition duration-200"
        >
          Add Task
        </button>
      </form>

      {/* Centered List of Tasks */}
      <ul className="w-full max-w-100 list-none p-0 space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="border border-gray-600 rounded p-5 flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-base font-medium mb-1">{task.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{task.description}</p>
            <textarea
              placeholder="Updated description"
              onChange={(e) => setNewDescription(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => updateTask(task.id)}
                className="py-1 px-3 bg-[#2d2d2d] border border-gray-600 rounded text-xs hover:bg-[#3d3d3d] transition"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="py-1 px-3 bg-[#2d2d2d] border border-gray-600 rounded text-xs hover:bg-[#3d3d3d] transition"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
