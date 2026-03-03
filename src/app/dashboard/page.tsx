/**
 * Page principale du tableau de bord.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text">Tableau de bord</h1>
      <p className="text-text/60">Bienvenue sur votre espace.</p>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Utilisateurs", value: "—" },
          { label: "Abonnements", value: "—" },
          { label: "Revenus", value: "—" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface rounded-xl border border-white/10 p-6"
          >
            <p className="text-sm text-text/60 mb-1">{label}</p>
            <p className="text-2xl font-bold text-text">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
