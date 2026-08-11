"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "loading" | "choose" | "team-name" | "members";

type MemberDraft = {
  full_name: string;
  email: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("loading");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<MemberDraft[]>([
    { full_name: "", email: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspace() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id, onboarding_completed")
        .eq("owner_id", user.id)
        .single();

      if (!workspace) {
        setError("No se encontró tu workspace.");
        return;
      }

      if (workspace.onboarding_completed) {
        router.push("/dashboard");
        return;
      }

      setWorkspaceId(workspace.id);
      setStep("choose");
    }

    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function chooseIndividual() {
    if (!workspaceId) return;
    setSaving(true);
    const { error } = await supabase
      .from("workspaces")
      .update({ onboarding_completed: true })
      .eq("id", workspaceId);
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  function chooseTeam() {
    setStep("team-name");
  }

  async function confirmTeamName(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId || !teamName.trim()) return;

    setSaving(true);
    const { error } = await supabase
      .from("workspaces")
      .update({ name: teamName.trim() })
      .eq("id", workspaceId);
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
    setStep("members");
  }

  function updateMember(index: number, field: keyof MemberDraft, value: string) {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }

  function addMemberRow() {
    setMembers((prev) => [...prev, { full_name: "", email: "" }]);
  }

  async function finishWithMembers() {
    if (!workspaceId) return;
    setSaving(true);
    setError(null);

    const validMembers = members
      .filter((m) => m.full_name.trim().length > 0)
      .map((m) => ({
        workspace_id: workspaceId,
        full_name: m.full_name.trim(),
        email: m.email.trim() || null,
      }));

    if (validMembers.length > 0) {
      const { error: insertError } = await supabase
        .from("workspace_members")
        .insert(validMembers);

      if (insertError) {
        setSaving(false);
        setError(insertError.message);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from("workspaces")
      .update({ onboarding_completed: true })
      .eq("id", workspaceId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  function skipMembers() {
    finishWithMembers();
  }

  if (step === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-ink-soft">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-panel border border-line rounded p-8">
        {step === "choose" && (
          <>
            <h1 className="font-display text-2xl font-extrabold mb-1">
              ¿Cómo vas a trabajar?
            </h1>
            <p className="text-ink-soft text-sm mb-6">
              Podés cambiar esto más adelante agregando miembros cuando
              quieras.
            </p>

            <button
              onClick={chooseIndividual}
              disabled={saving}
              className="w-full text-left border border-line rounded p-4 mb-3 hover:border-teal transition-colors disabled:opacity-60"
            >
              <p className="font-medium mb-1">De manera individual</p>
              <p className="text-sm text-ink-soft">
                Solo vos vas a llevar el registro de tu tiempo.
              </p>
            </button>

            <button
              onClick={chooseTeam}
              disabled={saving}
              className="w-full text-left border border-line rounded p-4 hover:border-teal transition-colors disabled:opacity-60"
            >
              <p className="font-medium mb-1">En equipo</p>
              <p className="text-sm text-ink-soft">
                Vos y otras personas van a registrar tiempo en proyectos
                compartidos.
              </p>
            </button>
          </>
        )}

        {step === "team-name" && (
          <form onSubmit={confirmTeamName}>
            <h1 className="font-display text-2xl font-extrabold mb-1">
              Nombrá tu equipo
            </h1>
            <p className="text-ink-soft text-sm mb-6">
              El nombre de tu equipo o empresa.
            </p>

            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Ej: Estudio Creativo SRL"
              className="w-full border border-line rounded px-3 py-2 mb-4 outline-none focus:border-teal"
            />

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-teal text-white font-medium rounded py-2 hover:bg-teal-dark transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Continuar"}
            </button>
          </form>
        )}

        {step === "members" && (
          <>
            <h1 className="font-display text-2xl font-extrabold mb-1">
              Agregá a tu equipo
            </h1>
            <p className="text-ink-soft text-sm mb-6">
              Opcional — podés hacerlo más tarde desde el módulo Miembros.
            </p>

            {members.map((member, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={member.full_name}
                  onChange={(e) =>
                    updateMember(index, "full_name", e.target.value)
                  }
                  className="flex-1 border border-line rounded px-3 py-2 outline-none focus:border-teal"
                />
                <input
                  type="email"
                  placeholder="Correo (opcional)"
                  value={member.email}
                  onChange={(e) =>
                    updateMember(index, "email", e.target.value)
                  }
                  className="flex-1 border border-line rounded px-3 py-2 outline-none focus:border-teal"
                />
              </div>
            ))}

            <button
              onClick={addMemberRow}
              type="button"
              className="text-sm text-teal-dark font-medium mb-6"
            >
              + Agregar otra persona
            </button>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={skipMembers}
                disabled={saving}
                type="button"
                className="flex-1 border border-line rounded py-2 font-medium hover:bg-cream transition-colors disabled:opacity-60"
              >
                Cargar más tarde
              </button>
              <button
                onClick={finishWithMembers}
                disabled={saving}
                type="button"
                className="flex-1 bg-teal text-white font-medium rounded py-2 hover:bg-teal-dark transition-colors disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Continuar"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
