import { useForm, FieldErrors, SubmitHandler  } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Field, Input } from "@headlessui/react";

const todoSchema = z.object({
    title: z.string().min(1, "Názov úlohy je povinný"),
    description: z.string().optional(),
    deadline: z.string().optional(),
});

type TodoFormProps = {
    onSubmit: (data: { title: string; description?: string; deadline?: string }) => void;
    onCancel: () => void;
    errors?: FieldErrors<{ title: string; description?: string; deadline?: string }>;
};

type TodoFormInputs = {
    title: string;
    description?: string;
    deadline?: string;
};

const TodoForm = ({ onSubmit, onCancel }: TodoFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<TodoFormInputs>({
        resolver: zodResolver(todoSchema),
    });

    const submitHandler: SubmitHandler<TodoFormInputs> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="mt-2">
            <Field className="w-full max-w-md px-4 mb-2">
                <Input
                    type="text"
                    {...register("title")}
                    placeholder="Názov úlohy"
                    className="border border-gray-300 rounded p-2 w-full"
                />
                {errors.title && <span className="text-red-500">{errors.title.message}</span>}
            </Field>
            <Field className="w-full max-w-md px-4 mb-2">
                <Input
                    {...register("description")}
                    placeholder="Popis úlohy (voliteľné)"
                    className="border border-gray-300 rounded p-2 w-full mt-2"
                />
            </Field>
            <Field className="w-full max-w-md px-4 mb-2">
                <Input
                    type="datetime-local"
                    {...register("deadline")}
                    className="border border-gray-300 rounded p-2 w-full mt-2"
                />
            </Field>

            <div className="flex justify-between w-full max-w-md px-4">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600">
                    Skryť formulár
                </Button>
                <Button type="submit"
                        className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
                    Pridať úlohu
                </Button>
            </div>
        </form>
    );
};

export default TodoForm;
