import ReservationForm from "@/app/components/Forms/ReservationForm";

const courts = [
  { id: 1, name: "Pista 1", price: 20, capacity: 4 },
  { id: 2, name: "Pista 2", price: 24, capacity: 4 },
  { id: 3, name: "Pista 3", price: 18, capacity: 2 },
];

export default function CreateReservationPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Crear reserva</h1>
      <ReservationForm courtOptions={courts} />
    </div>
  );
}
