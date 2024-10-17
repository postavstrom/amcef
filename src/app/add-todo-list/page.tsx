'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Field, Input, Label, Select, Checkbox } from "@headlessui/react"
import TodoForm from "../../components/TodoForm";
import { format } from 'date-fns';

const todoListSchema = z.object({
    name: z.string().min(1, "Názov zoznamu je povinný"),
});

const todoSchema = z.object({
    title: z.string().min(1, "Názov úlohy je povinný"),
    description: z.string().optional(),
    deadline: z.string().optional(),
});

type Todo = {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    todoListId: string;
    deadline?: string;
};

type TodoList = {
    id: string;
    name: string;
    todos?: Todo[];
};

export default function AddTodoList() {
    const [todoLists, setTodoLists] = useState<TodoList[]>([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQueries, setSearchQueries] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const { register: registerList, handleSubmit: handleSubmitList, reset: resetList, formState: { errors: listErrors } } = useForm<{ name: string }>({
        resolver: zodResolver(todoListSchema),
    });
    const { reset: resetTodo, formState: { errors: todoErrors } } = useForm<{ title: string, description?: string, deadline?: string }>({
        resolver: zodResolver(todoSchema),
    });
    const [selectedListForTodo, setSelectedListForTodo] = useState<string | null>(null);

    useEffect(() => {
        const fetchTodoLists = async () => {
            try {
                setLoading(true);
                const response = await axios.get("https://670fb93da85f4164ef2ba7dd.mockapi.io/api/todoLists");
                const lists = response.data;

                const fetchTodosPromises = lists.map(async (list: TodoList) => {
                    try {
                        const todosResponse = await axios.get(`https://670fb93da85f4164ef2ba7dd.mockapi.io/api/todoLists/${list.id}/todos`);
                        return { ...list, todos: todosResponse.data };
                    } catch (error) {
                        console.error(`Failed to load todos for list ${list.id}.`, error);
                        return { ...list, todos: [] };
                    }
                });

                const listsWithTodos = await Promise.all(fetchTodosPromises);
                setTodoLists(listsWithTodos);
            } catch (err) {
                console.error("Failed to load ToDo lists.", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTodoLists();
    }, []);

    const createTodoList = async (data: { name: string }) => {
        try {
            const response = await axios.post("https://670fb93da85f4164ef2ba7dd.mockapi.io/api/todoLists", {
                name: data.name,
            });
            setTodoLists((prevLists) => [...prevLists, response.data]);
            resetList();
        } catch (error) {
            console.error("Failed to create ToDo list.", error);
        }
    };

    const addTodo = async (todoListId: string, data: { title: string, description?: string, deadline?: string }) => {
        if (!data.title.trim()) {
            return;
        }

        try {
            const response = await axios.post(`https://670fb93da85f4164ef2ba7dd.mockapi.io/api/todoLists/${todoListId}/todos`, {
                title: data.title,
                description: data.description,
                completed: false,
                todoListId: todoListId,
                deadline: data.deadline || undefined,
            });
            setTodoLists((prevLists) =>
                prevLists.map((list) =>
                    list.id === todoListId
                        ? { ...list, todos: [...(list.todos || []), response.data] }
                        : list
                )
            );
            resetTodo();
            setSelectedListForTodo(null);
        } catch (error) {
            console.error("Failed to add ToDo.", error);
        }
    };

    const deleteTodo = async (todoListId: string, todoId: string) => {
        try {
            await axios.delete(`https://670fb93da85f4164ef2ba7dd.mockapi.io/api/todoLists/${todoListId}/todos/${todoId}`);
            setTodoLists((prevLists) =>
                prevLists.map((list) =>
                    list.id === todoListId
                        ? { ...list, todos: list.todos?.filter((todo) => todo.id !== todoId) }
                        : list
                )
            );
        } catch (error) {
            console.error("Failed to delete ToDo.", error);
        }
    };

    const toggleTodoCompletion = async (todoListId: string, todoId: string, completed: boolean) => {
        try {
            await axios.put(`https://670fb93da85f4164ef2ba7dd.mockapi.io/api/todoLists/${todoListId}/todos/${todoId}`, {
                completed: !completed
            });
            setTodoLists((prevLists) =>
                prevLists.map((list) =>
                    list.id === todoListId
                        ? {
                            ...list,
                            todos: list.todos?.map((todo) =>
                                todo.id === todoId ? { ...todo, completed: !completed } : todo
                            )
                        }
                        : list
                )
            );
        } catch (error) {
            console.error("Failed to update ToDo completion status.", error);
        }
    };

    const filteredTodos = (todos?: Todo[]) => {
        if (!todos) return [];
        const searchQuery = searchQueries[todos[0]?.todoListId || ""]?.toLowerCase() || "";

        const filteredByStatus = todos.filter(todo => {
            const matchesFilter =
                filterStatus === "completed" ? todo.completed :
                    filterStatus === "incomplete" ? !todo.completed :
                        true;

            return matchesFilter;
        });

        return filteredByStatus.filter(todo =>
            todo.title.toLowerCase().includes(searchQuery) ||
            todo.description?.toLowerCase().includes(searchQuery)
        );
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-gray-200 p-4 rounded-md shadow">
            <h1 className="text-xl font-bold mb-5 px-4">Pridať ToDo zoznam</h1>
            <form onSubmit={handleSubmitList(createTodoList)} className="mb-5">
                <Field className="w-full max-w-md px-4 mb-2">
                    <Label className="text-sm/6 font-medium">Názov nového zoznamu</Label>
                    <Input
                        type="text"
                        {...registerList("name")}
                        className="border border-gray-300 rounded p-2 w-full">
                    </Input>
                    {listErrors.name && <span className="text-red-500">{listErrors.name.message}</span>}
                </Field>
                <div className="w-full max-w-md px-4">
                    <Button type="submit"
                            className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
                        Vytvoriť Zoznam
                    </Button>
                </div>
            </form>
            <h2 className="text-lg font-bold mb-3 px-4">Vytvorené ToDo zoznamy</h2>

            <Field className="w-full max-w-md px-4 mb-2">
                <Label className="text-sm/6 font-medium">Zobrazené zoznamy</Label>
                <div className="relative">
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded p-2 w-full mb-5"
                    >
                        <option value="all">Všetky</option>
                        <option value="completed">Hotové</option>
                        <option value="incomplete">Rozpracované</option>
                    </Select>
                </div>
            </Field>

            <div>
                {loading ? (
                    <div className="text-center">
                        <p>Načítavanie...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {todoLists.map((list) => (
                            <div key={list.id} className="py-4 bg-gray-100 rounded-md shadow">
                                <h3 className="px-4 font-semibold">{list.name}</h3>
                                <Field className="w-full max-w-md px-4 mb-2">
                                    <Input
                                        type="text"
                                        placeholder="Vyhľadávanie ToDo"
                                        value={searchQueries[list.id] || ""}
                                        onChange={(e) => setSearchQueries({...searchQueries, [list.id]: e.target.value})}
                                        className="border border-gray-300 rounded p-2 w-full mb-2"
                                    >
                                    </Input>
                                </Field>
                                <div className="px-4">
                                    {list.todos && filteredTodos(list.todos).length > 0 ? (
                                        filteredTodos(list.todos).map((todo) => (
                                            <div key={todo.id} className="ml-1 flex justify-between items-center mb-2">
                                                <div className="flex items-center">
                                                    <Checkbox
                                                        checked={todo.completed}
                                                        onChange={() => toggleTodoCompletion(list.id, todo.id, todo.completed)}
                                                        className="group block size-4 rounded border bg-white data-[checked]:bg-blue-500 mr-4"
                                                    >
                                                    </Checkbox>
                                                    <span className={todo.completed ? "line-through" : ""}>
                                                {todo.title} - {todo.description}<br/>
                                                <span className="text-gray-500">
                                                    Deadline: {
                                                    (todo.deadline &&
                                                        !todo.deadline.startsWith('deadline') &&
                                                        !isNaN(Date.parse(todo.deadline)))
                                                        ? format(new Date(todo.deadline), 'dd.MM.yyyy HH:mm')
                                                        : 'Nie je nastavený'
                                                }
                                                </span>
                                            </span>
                                                </div>

                                                <button onClick={() => deleteTodo(list.id, todo.id)}
                                                        className="text-red-500">Odstrániť
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <li>Žiadne ToDo položky na zobrazenie.</li>
                                    )}
                                </div>
                                {selectedListForTodo === list.id && (
                                    <TodoForm
                                        onSubmit={(data) => addTodo(list.id, data)}
                                        onCancel={() => setSelectedListForTodo(null)}
                                        errors={todoErrors}
                                    />
                                )}
                                <div className="w-full max-w-md px-4">
                                    {selectedListForTodo !== list.id && (
                                        <Button
                                            onClick={() => setSelectedListForTodo(list.id)}
                                            className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                                        >
                                            Pridať úlohu
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
