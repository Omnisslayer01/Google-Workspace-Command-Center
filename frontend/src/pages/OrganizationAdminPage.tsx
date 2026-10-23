
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  ChevronDown,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import {
  addOrganizationMember,
  createOrganization,
  getOrganizationMembers,
  getOrganizations,
  updateOrganizationMemberRole,
  type ApiOrganizationRole,
  type Organization,
  type OrganizationMember,
  type OrganizationRole,
} from "../lib/organizationApi";

const roleLabels: Record<ApiOrganizationRole, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string, email: string): string {
  const value = name?.trim() || email?.trim() || "U";

  return value
    .split(/[\s._@-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function OrganizationAdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    number | null
  >(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);

  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [creatingOrganization, setCreatingOrganization] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(
    null
  );

  const [organizationName, setOrganizationName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<ApiOrganizationRole>("member");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | OrganizationRole>(
    "all"
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedOrganization = useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === selectedOrganizationId
      ) ?? null,
    [organizations, selectedOrganizationId]
  );

  const isAdmin = selectedOrganization?.role === "admin";

  const loadOrganizations = useCallback(async (preferredId?: number) => {
    setLoadingOrganizations(true);
    setError("");

    try {
      const response = await getOrganizations();
      const list = response.results ?? [];

      setOrganizations(list);

      setSelectedOrganizationId((currentId) => {
        if (
          preferredId !== undefined &&
          list.some((organization) => organization.id === preferredId)
        ) {
          return preferredId;
        }

        if (
          currentId !== null &&
          list.some((organization) => organization.id === currentId)
        ) {
          return currentId;
        }

        return list[0]?.id ?? null;
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingOrganizations(false);
    }
  }, []);

  const loadMembers = useCallback(async (organizationId: number) => {
    setLoadingMembers(true);
    setError("");

    try {
      const response = await getOrganizationMembers(organizationId);
      setMembers(response.results ?? []);
    } catch (err) {
      setMembers([]);
      setError(getErrorMessage(err));
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    if (selectedOrganizationId === null) {
      setMembers([]);
      return;
    }

    void loadMembers(selectedOrganizationId);
  }, [selectedOrganizationId, loadMembers]);

  const handleCreateOrganization = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const name = organizationName.trim();

    if (!name) {
      setError("Please enter an organization name.");
      return;
    }

    setCreatingOrganization(true);
    setError("");
    setSuccess("");

    try {
      const response = await createOrganization(name);

      setOrganizationName("");
      setShowCreateForm(false);

      await loadOrganizations(response.organization.id);

      setSuccess(`"${response.organization.name}" was created successfully.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreatingOrganization(false);
    }
  };

  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedOrganizationId === null) {
      setError("Create or select an organization first.");
      return;
    }

    if (!memberEmail.trim()) {
      setError("Enter the email address of a registered user.");
      return;
    }

    setAddingMember(true);
    setError("");
    setSuccess("");

    try {
      const response = await addOrganizationMember(selectedOrganizationId, {
        email: memberEmail.trim(),
        role: memberRole,
      });

      setMembers((current) => {
        if (current.some((member) => member.id === response.member.id)) {
          return current;
        }

        return [...current, response.member];
      });

      setMemberEmail("");
      setMemberRole("member");
      setSuccess("Member added successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddingMember(false);
    }
  };

  const handleRoleChange = async (
    member: OrganizationMember,
    newRole: OrganizationRole
  ) => {
    if (selectedOrganizationId === null || member.role === newRole) return;

    setUpdatingMemberId(member.id);
    setError("");
    setSuccess("");

    try {
      const updatedMember = await updateOrganizationMemberRole(
        selectedOrganizationId,
        member.userId,
        { role: newRole }
      );

      setMembers((current) =>
        current.map((item) =>
          item.id === member.id ? updatedMember : item
        )
      );

      setSuccess(`Updated ${member.name || member.email}'s role.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !normalizedSearch ||
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch);

      const matchesRole = roleFilter === "all" || member.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  const adminCount = members.filter((member) => member.role === "Admin").length;
  const managerCount = members.filter(
    (member) => member.role === "Manager"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Building2 size={16} />
              Workspace administration
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Organization &amp; Members
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Create workspaces, manage members, and control their
              organization roles.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadOrganizations(selectedOrganizationId ?? undefined);
              if (selectedOrganizationId !== null) {
                void loadMembers(selectedOrganizationId);
              }
            }}
            disabled={loadingOrganizations || loadingMembers}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            {loadingOrganizations || loadingMembers ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1 break-words">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="font-semibold"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <Check size={18} className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1">{success}</p>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
              className="font-semibold"
            >
              ×
            </button>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Building2 size={20} className="text-indigo-600" />
                Your workspaces
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a workspace to manage its members.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm((current) => !current);
                setError("");
                setSuccess("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Create workspace
            </button>
          </div>

          {showCreateForm && (
            <form
              onSubmit={handleCreateOrganization}
              className="mt-5 flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label
                  htmlFor="organization-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Workspace name
                </label>
                <input
                  id="organization-name"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  placeholder="e.g. Engineering Team"
                  maxLength={255}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="submit"
                disabled={creatingOrganization}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingOrganization && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                Create
              </button>
            </form>
          )}

          {loadingOrganizations ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin" />
              Loading workspaces...
            </div>
          ) : organizations.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
              <Building2 size={32} className="mx-auto text-slate-400" />
              <h3 className="mt-3 font-semibold">No workspaces yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Create your first workspace to start managing members.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {organizations.map((organization) => {
                const selected = organization.id === selectedOrganizationId;

                return (
                  <button
                    key={organization.id}
                    type="button"
                    onClick={() => {
                      setSelectedOrganizationId(organization.id);
                      setSuccess("");
                      setError("");
                    }}
                    className={`flex min-w-0 items-start gap-3 rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-200"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-2 ${
                        selected
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Building2 size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold">
                        {organization.name}
                      </p>
                      <p className="mt-1 text-xs capitalize text-slate-500">
                        Your role: {roleLabels[organization.role]}
                      </p>
                    </div>

                    {selected && (
                      <Check
                        size={18}
                        className="shrink-0 text-indigo-600"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {selectedOrganization && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Total members
                  </span>
                  <Users size={20} className="text-indigo-600" />
                </div>
                <p className="mt-3 text-3xl font-bold tabular-nums">
                  {members.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  In {selectedOrganization.name}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Administrators
                  </span>
                  <ShieldCheck size={20} className="text-emerald-600" />
                </div>
                <p className="mt-3 text-3xl font-bold tabular-nums">
                  {adminCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Members with admin access
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Managers
                  </span>
                  <Users size={20} className="text-amber-600" />
                </div>
                <p className="mt-3 text-3xl font-bold tabular-nums">
                  {managerCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Members with manager roles
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Manage members
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Workspace: {selectedOrganization.name}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      isAdmin
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Your role: {roleLabels[selectedOrganization.role]}
                  </span>
                </div>

                {isAdmin ? (
                  <form
                    onSubmit={handleAddMember}
                    className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]"
                  >
                    <div>
                      <label
                        htmlFor="member-email"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Registered user's email
                      </label>
                      <input
                        id="member-email"
                        type="email"
                        value={memberEmail}
                        onChange={(event) => setMemberEmail(event.target.value)}
                        placeholder="colleague@example.com"
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="member-role"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Initial role
                      </label>
                      <div className="relative">
                        <select
                          id="member-role"
                          value={memberRole}
                          onChange={(event) =>
                            setMemberRole(
                              event.target.value as ApiOrganizationRole
                            )
                          }
                          className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="member">Member</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                        <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3 top-3 text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={addingMember}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                      >
                        {addingMember ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <UserPlus size={16} />
                        )}
                        Add member
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Only organization admins can add members or change roles.
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by username or email..."
                      aria-label="Search members"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(event) =>
                      setRoleFilter(
                        event.target.value as "all" | OrganizationRole
                      )
                    }
                    aria-label="Filter by role"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="all">All roles</option>
                    <option value="Admin">Admins</option>
                    <option value="Manager">Managers</option>
                    <option value="Member">Members</option>
                  </select>
                </div>
              </div>

              {loadingMembers ? (
                <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
                  <LoaderCircle size={20} className="animate-spin" />
                  Loading members...
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Users size={32} className="mx-auto text-slate-300" />
                  <h3 className="mt-3 font-semibold">No members found</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {members.length === 0
                      ? "Add a registered user by email to get started."
                      : "Try changing your search or role filter."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Member</th>
                        <th className="px-5 py-3 font-semibold">Role</th>
                        <th className="px-5 py-3 font-semibold">Joined</th>
                        <th className="px-5 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.map((member) => (
                        <tr
                          key={member.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                {getInitials(member.name, member.email)}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800">
                                  {member.name || "Unnamed user"}
                                </p>
                                <p className="mt-0.5 break-all text-xs text-slate-500">
                                  {member.email || "No email available"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                member.role === "Admin"
                                  ? "bg-violet-50 text-violet-700"
                                  : member.role === "Manager"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {member.role}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {formatDate(member.joinedAt)}
                          </td>

                          <td className="px-5 py-4">
                            {isAdmin ? (
                              <div className="relative flex items-center gap-2">
                                <select
                                  aria-label={`Change role for ${member.name || member.email}`}
                                  value={member.role}
                                  disabled={
                                    updatingMemberId !== null ||
                                    (member.role === "Admin" &&
                                      adminCount <= 1)
                                  }
                                  onChange={(event) =>
                                    void handleRoleChange(
                                      member,
                                      event.target.value as OrganizationRole
                                    )
                                  }
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
                                >
                                  <option value="Admin">Admin</option>
                                  <option value="Manager">Manager</option>
                                  <option value="Member">Member</option>
                                </select>

                                {updatingMemberId === member.id && (
                                  <LoaderCircle
                                    size={16}
                                    className="animate-spin text-indigo-600"
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                View only
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <footer className="flex flex-col gap-1 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredMembers.length} of {members.length} members
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Roles are saved through the Django API
                </span>
              </footer>
            </section>
          </>
        )}

        {!loadingOrganizations && organizations.length > 0 && !selectedOrganization && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Select a workspace to view its members.
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          Organization management · Authenticated access · Django REST API
        </p>
      </div>
    </main>
  );
}
