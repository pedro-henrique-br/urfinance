import { Link } from "react-router-dom";

const Forbidden = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">403</h1>
        <p className="mb-4 text-muted-foreground">
          Voce nao tem permissao para acessar esta pagina
        </p>

        <Link
          to="/dashboard"
          className="text-primary underline hover:text-primary/90"
        >
          Voltar ao inicio
        </Link>
      </div>
    </div>
  );
}

export default Forbidden