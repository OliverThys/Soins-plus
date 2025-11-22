import { useForm } from "react-hook-form";

type QuizFormProps = {
  questions: Array<{
    id: string;
    label: string;
    multiple: boolean;
    answers: Array<{ id: string; label: string }>;
  }>;
  onSubmit: (payload: Record<string, string[]>) => void;
};

export function QuizForm({ questions, onSubmit }: QuizFormProps) {
  const { handleSubmit, register } = useForm();

  return (
    <form
      className="quiz-form"
      onSubmit={handleSubmit((values) => {
        const formatted = Object.entries(values).reduce<Record<string, string[]>>((acc, [key, value]) => {
          if (Array.isArray(value)) {
            acc[key] = value;
          } else {
            acc[key] = [value as string];
          }
          return acc;
        }, {});
        onSubmit(formatted);
      })}
    >
      {questions.map((question) => (
        <fieldset key={question.id} className="quiz-fieldset">
          <legend className="title-md">{question.label}</legend>
          <div className="quiz-options">
            {question.answers.map((answer) => (
              <label key={answer.id} className="quiz-option">
                <input
                  type={question.multiple ? "checkbox" : "radio"}
                  value={answer.id}
                  {...register(question.id)}
                />
                {answer.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="submit" className="btn btn-primary">
        Valider le QCM
      </button>
    </form>
  );
}

