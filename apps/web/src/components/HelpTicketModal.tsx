import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api.js";
import { Modal } from "./Modal.js";
import { useForm } from "react-hook-form";
import { useAlert } from "../context/AlertContext.js";
import { Icon } from "./Icon.js";
import { useQueryClient } from "@tanstack/react-query";

interface HelpTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export function HelpTicketModal({ isOpen, onClose, userId, userEmail, userName }: HelpTicketModalProps) {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  const form = useForm<{
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }>({
    defaultValues: {
      name: userName || "",
      email: userEmail || "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => api.post("/legal/ticket", { ...values, userId }),
    onSuccess: () => {
      showAlert("Ticket créé avec succès. Nous vous répondrons dans les plus brefs délais.", "success");
      form.reset();
      onClose();
      // Invalider les tickets admin si l'utilisateur est admin
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: (error: any) => {
      showAlert(error.response?.data?.message || "Erreur lors de la création du ticket", "error");
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data);
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ouvrir un ticket d'aide">
      <form onSubmit={handleSubmit} className="help-ticket-form">
        <div className="help-ticket-form__info">
          <Icon name="document" size={20} />
          <p className="muted">
            Décrivez votre problème ou votre question. Notre équipe vous répondra dans les plus brefs délais.
          </p>
        </div>

        <div className="field">
          <label className="field__label">
            Nom complet <span className="text-error">*</span>
          </label>
          <input
            className="input"
            type="text"
            required
            placeholder="Votre nom complet"
            {...form.register("name", { required: true })}
          />
        </div>

        <div className="field">
          <label className="field__label">
            Email <span className="text-error">*</span>
          </label>
          <input
            className="input"
            type="email"
            required
            placeholder="votre@email.com"
            {...form.register("email", { required: true })}
          />
        </div>

        <div className="field">
          <label className="field__label">Téléphone (optionnel)</label>
          <input
            className="input"
            type="tel"
            placeholder="+32 470 12 34 56"
            {...form.register("phone")}
          />
        </div>

        <div className="field">
          <label className="field__label">
            Sujet <span className="text-error">*</span>
          </label>
          <input
            className="input"
            type="text"
            required
            placeholder="Résumé de votre demande"
            {...form.register("subject", { required: true })}
          />
        </div>

        <div className="field">
          <label className="field__label">
            Message <span className="text-error">*</span>
          </label>
          <textarea
            className="input"
            rows={6}
            required
            placeholder="Décrivez votre problème ou votre question en détail..."
            {...form.register("message", { required: true })}
          />
        </div>

        <div className="help-ticket-form__actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Icon name="clock" size={18} aria-hidden />
                Envoi en cours...
              </>
            ) : (
              <>
                <Icon name="check" size={18} aria-hidden />
                Envoyer le ticket
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

