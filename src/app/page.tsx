import { Button } from "@headlessui/react"
import Link from "next/link";


export default function Home() {

  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-4xl font-bold mb-8">Vitajte v ToDo Aplikácii</h1>
          <Link href="/add-todo-list" className="block mt-5 text-blue-500 underline">
              <Button className="mt-2 bg-green-500 text-white rounded p-2">
                  ísť na aplikáciu
              </Button>
          </Link>
      </div>
  );
}
