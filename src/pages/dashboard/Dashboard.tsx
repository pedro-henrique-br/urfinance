import { MainLayout } from "@/components/layout/MainLayout";

export default function Dashboard() {
  return (
    <MainLayout
      title="Dashboard"
      subtitle="Visão geral das suas finanças"
    >
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">
            Bem-vindo 👋
          </h2>
          <p className="text-muted-foreground">
            Aqui vai o conteúdo do seu dashboard.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
