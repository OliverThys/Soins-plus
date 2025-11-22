import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { useAlert } from "../../context/AlertContext.js";
import { Modal } from "../../components/Modal.js";
import { useForm } from "react-hook-form";
import clsx from "clsx";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

interface Ticket {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  adminNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function AdminTicketsPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const notesForm = useForm<{ adminNotes: string }>();

  const ticketsQuery = useQuery({
    queryKey: ["admin-tickets", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
      const response = await api.get("/admin/legal/tickets", { params });
      return response.data as Ticket[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      api.patch(`/admin/legal/tickets/${id}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      showAlert("Ticket mis à jour avec succès", "success");
      setIsDetailModalOpen(false);
      setSelectedTicket(null);
    },
    onError: (error: any) => {
      showAlert(error.response?.data?.message || "Erreur lors de la mise à jour", "error");
    },
  });

  const handleStatusChange = (ticketId: string, status: TicketStatus) => {
    updateMutation.mutate({ id: ticketId, values: { status } });
  };

  const handlePriorityChange = (ticketId: string, priority: TicketPriority) => {
    updateMutation.mutate({ id: ticketId, values: { priority } });
  };

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    notesForm.reset({ adminNotes: ticket.adminNotes || "" });
    setIsDetailModalOpen(true);
  };

  const handleSaveNotes = notesForm.handleSubmit((data) => {
    if (!selectedTicket) return;
    updateMutation.mutate({
      id: selectedTicket.id,
      values: { adminNotes: data.adminNotes },
    });
  });

  const getStatusBadgeClass = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return "ticket-status--open";
      case "IN_PROGRESS":
        return "ticket-status--in-progress";
      case "RESOLVED":
        return "ticket-status--resolved";
      case "CLOSED":
        return "ticket-status--closed";
      default:
        return "";
    }
  };

  const getPriorityBadgeClass = (priority: TicketPriority) => {
    switch (priority) {
      case "LOW":
        return "ticket-priority--low";
      case "NORMAL":
        return "ticket-priority--normal";
      case "HIGH":
        return "ticket-priority--high";
      case "URGENT":
        return "ticket-priority--urgent";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return "Ouvert";
      case "IN_PROGRESS":
        return "En cours";
      case "RESOLVED":
        return "Résolu";
      case "CLOSED":
        return "Fermé";
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: TicketPriority) => {
    switch (priority) {
      case "LOW":
        return "Basse";
      case "NORMAL":
        return "Normale";
      case "HIGH":
        return "Haute";
      case "URGENT":
        return "Urgente";
      default:
        return priority;
    }
  };

  const tickets = ticketsQuery.data || [];
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <section className="page page--cinematic">
      <div className="page-shell admin-page">
        <header className="home-panel-header">
          <div>
            <p className="eyebrow">Support</p>
            <h1 className="title-lg">Gestion des tickets</h1>
            <p className="muted">Gérez les demandes d'aide et de support des utilisateurs</p>
          </div>
        </header>

        <div className="tickets-stats">
          <div className="ticket-stat-card ticket-stat-card--open">
            <div className="ticket-stat-card__icon">
              <Icon name="document" size={24} />
            </div>
            <div className="ticket-stat-card__content">
              <span className="ticket-stat-card__label">Ouverts</span>
              <strong className="ticket-stat-card__value">{openCount}</strong>
            </div>
          </div>
          <div className="ticket-stat-card ticket-stat-card--in-progress">
            <div className="ticket-stat-card__icon">
              <Icon name="clock" size={24} />
            </div>
            <div className="ticket-stat-card__content">
              <span className="ticket-stat-card__label">En cours</span>
              <strong className="ticket-stat-card__value">{inProgressCount}</strong>
            </div>
          </div>
          <div className="ticket-stat-card ticket-stat-card--resolved">
            <div className="ticket-stat-card__icon">
              <Icon name="check-circle" size={24} />
            </div>
            <div className="ticket-stat-card__content">
              <span className="ticket-stat-card__label">Résolus</span>
              <strong className="ticket-stat-card__value">{resolvedCount}</strong>
            </div>
          </div>
        </div>

        <div className="tickets-filters">
          <div className="tickets-filters__buttons">
            <button
              type="button"
              className={clsx("ticket-filter-btn", statusFilter === "ALL" && "ticket-filter-btn--active")}
              onClick={() => setStatusFilter("ALL")}
            >
              Tous
            </button>
            <button
              type="button"
              className={clsx("ticket-filter-btn", statusFilter === "OPEN" && "ticket-filter-btn--active")}
              onClick={() => setStatusFilter("OPEN")}
            >
              Ouverts
            </button>
            <button
              type="button"
              className={clsx("ticket-filter-btn", statusFilter === "IN_PROGRESS" && "ticket-filter-btn--active")}
              onClick={() => setStatusFilter("IN_PROGRESS")}
            >
              En cours
            </button>
            <button
              type="button"
              className={clsx("ticket-filter-btn", statusFilter === "RESOLVED" && "ticket-filter-btn--active")}
              onClick={() => setStatusFilter("RESOLVED")}
            >
              Résolus
            </button>
            <button
              type="button"
              className={clsx("ticket-filter-btn", statusFilter === "CLOSED" && "ticket-filter-btn--active")}
              onClick={() => setStatusFilter("CLOSED")}
            >
              Fermés
            </button>
          </div>
        </div>

        {ticketsQuery.isLoading && <p className="muted">Chargement des tickets...</p>}
        {ticketsQuery.isError && <p className="muted">Erreur lors du chargement des tickets.</p>}

        <div className="tickets-list">
          {tickets.length === 0 ? (
            <div className="tickets-empty">
              <Icon name="document" size={48} />
              <p className="muted">Aucun ticket trouvé</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-card__header">
                  <div className="ticket-card__meta">
                    <h3 className="ticket-card__subject">{ticket.subject}</h3>
                    <div className="ticket-card__info">
                      <span className="ticket-card__author">
                        {ticket.user ? `${ticket.user.firstName} ${ticket.user.lastName}` : ticket.name}
                      </span>
                      <span className="ticket-card__email">{ticket.email}</span>
                      <span className="ticket-card__date">
                        {new Date(ticket.createdAt).toLocaleDateString("fr-BE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="ticket-card__badges">
                    <span className={clsx("ticket-status", getStatusBadgeClass(ticket.status))}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <span className={clsx("ticket-priority", getPriorityBadgeClass(ticket.priority))}>
                      {getPriorityLabel(ticket.priority)}
                    </span>
                  </div>
                </div>
                <p className="ticket-card__message">{ticket.message.substring(0, 150)}...</p>
                <div className="ticket-card__actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleViewDetails(ticket)}
                  >
                    <Icon name="eye" size={16} aria-hidden />
                    Voir les détails
                  </button>
                  <select
                    className="ticket-status-select"
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                    disabled={updateMutation.isPending}
                  >
                    <option value="OPEN">Ouvert</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="RESOLVED">Résolu</option>
                    <option value="CLOSED">Fermé</option>
                  </select>
                  <select
                    className="ticket-priority-select"
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(ticket.id, e.target.value as TicketPriority)}
                    disabled={updateMutation.isPending}
                  >
                    <option value="LOW">Basse</option>
                    <option value="NORMAL">Normale</option>
                    <option value="HIGH">Haute</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTicket(null);
          }}
          title={selectedTicket?.subject || "Détails du ticket"}
        >
          {selectedTicket && (
            <div className="ticket-detail">
              <div className="ticket-detail__section">
                <h3 className="ticket-detail__section-title">Informations</h3>
                <div className="ticket-detail__info-grid">
                  <div>
                    <span className="ticket-detail__label">Auteur</span>
                    <p>
                      {selectedTicket.user
                        ? `${selectedTicket.user.firstName} ${selectedTicket.user.lastName}`
                        : selectedTicket.name}
                    </p>
                  </div>
                  <div>
                    <span className="ticket-detail__label">Email</span>
                    <p>{selectedTicket.email}</p>
                  </div>
                  {selectedTicket.phone && (
                    <div>
                      <span className="ticket-detail__label">Téléphone</span>
                      <p>{selectedTicket.phone}</p>
                    </div>
                  )}
                  <div>
                    <span className="ticket-detail__label">Date de création</span>
                    <p>
                      {new Date(selectedTicket.createdAt).toLocaleDateString("fr-BE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {selectedTicket.resolvedAt && (
                    <div>
                      <span className="ticket-detail__label">Résolu le</span>
                      <p>
                        {new Date(selectedTicket.resolvedAt).toLocaleDateString("fr-BE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="ticket-detail__section">
                <h3 className="ticket-detail__section-title">Message</h3>
                <div className="ticket-detail__message">{selectedTicket.message}</div>
              </div>

              <div className="ticket-detail__section">
                <h3 className="ticket-detail__section-title">Notes administrateur</h3>
                <form onSubmit={handleSaveNotes} className="ticket-detail__notes-form">
                  <textarea
                    className="input"
                    rows={6}
                    placeholder="Ajoutez des notes internes sur ce ticket..."
                    {...notesForm.register("adminNotes")}
                  />
                  <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les notes"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </section>
  );
}

