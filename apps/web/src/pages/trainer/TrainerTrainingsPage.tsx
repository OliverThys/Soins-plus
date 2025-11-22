import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";

export function TrainerTrainingsPage() {
  const trainingsQuery = useQuery({
    queryKey: ["trainer-trainings"],
    queryFn: async () => (await api.get("/trainer/trainings")).data,
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => api.post(`/trainer/trainings/${payload.trainingId}/attendance`, payload),
  });

  return (
    <section className="page page--cinematic">
      <div className="page-shell trainer-page">
      <header className="home-panel-header">
        <div>
          <p className="muted">Présences</p>
          <h1 className="title-lg">Mes formations</h1>
          <p className="muted">Validez les présences et déclenchez les attestations.</p>
        </div>
      </header>
      <div className="stack">
        {trainingsQuery.data?.map((training: any) => (
          <article key={training.id} className="card">
            <div className="home-panel-header">
              <div>
                <h2 className="title-md">{training.title}</h2>
                <p className="muted">
                  {training.startDate ? new Date(training.startDate).toLocaleString("fr-BE") : "À la demande"}
                </p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  mutation.mutate({
                    trainingId: training.id,
                    entries: training.enrollments.map((enrollment: any) => ({
                      enrollmentId: enrollment.id,
                      present: true,
                    })),
                  })
                }
              >
                Valider tous présents
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {training.enrollments.map((enrollment: any) => (
                  <tr key={enrollment.id}>
                    <td>{enrollment.user.firstName + " " + enrollment.user.lastName}</td>
                    <td>{enrollment.attendance ? "Présent" : "À valider"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}

