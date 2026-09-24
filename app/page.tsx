import { redirect } from "next/navigation";

/** Отдельной витрины у программы нет: открыл — и сразу работаешь. */
export default function Home() {
  redirect("/orders");
}
