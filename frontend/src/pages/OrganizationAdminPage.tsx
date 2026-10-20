
import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShieldCheck,
  Clock,
  Search,
  RefreshCw,
  UserRoundCog,
  AlertCircle,
} from "lucide-react";

import { Header } from "../components/common/Header";
import {
  getOrganizationMembers,
  updateOrganizationMemberRole,
  type OrganizationMember,
  type OrganizationRole,
} from "../lib/organizationApi";

const roleStyles: Record<OrganizationRole, string> = {
  Admin: "bg-violet-50 text-violet-700 border-violet-200",
  Manager: "bg-blue-50 text-blue-700 border-blue-200",
  Member: "bg-slate-100 text-slate-700 border-slate-200",
};

export const OrganizationAdminPage: React.FC = () => {
  const organizationId = Number(
    new URLSearchParams(window.location.search).get("organization_id")
  );
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const loadMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const organizationId = Number(
        new URLSearchParams(window.location.search).get("organization_id")
      );
      const response = await getOrganizationMembers(organizationId);
      setMembers(response.results);
    } catch (err) {
      console.error("Failed to load organization members:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load organization members."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    void loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "All" || member.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  const activeCount = members.filter(
    (member) => member.status === "Active"
  ).length;

  const adminCount = members.filter(
    (member) => member.role === "Admin"
  ).length;

  const pendingCount = 0;

  const handleRoleChange = async (
    memberId: number,
    role: OrganizationRole
  ) => {
    const currentMember = members.find(
      (member) => member.id === memberId
    );

    if (!currentMember || currentMember.role === role) return;

    setUpdatingId(memberId);
    setError("");
    setNotice("");

    try {
      const updatedMember = await updateOrganizationMemberRole(
        organizationId,
        currentMember.userId,
        { role }
      );

      setMembers((current) =>
        current.map((member) =>
          member.id === memberId ? updatedMember : member
        )
      );

      setNotice(`Role updated to ${role} for ${updatedMember.name}.`);
    } catch (err) {
        console.error("Failed to update member role:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to update this member's role."
        );
      } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Users size={16} />
              <span>Workspace</span>
              <span>/</span>
              <span className="text-slate-700">
                Team Administration
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Team Administration
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Manage organization members and control their access
              with role assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadMembers()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh members
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total members"
            value={members.length}
            icon={<Users size={20} />}
            description="Listed in this workspace"
          />
          <SummaryCard
            title="Active members"
            value={activeCount}
            icon={<ShieldCheck size={20} />}
            description="Currently active"
          />
          <SummaryCard
            title="Administrators"
            value={adminCount}
            icon={<UserRoundCog size={20} />}
            description="Members with admin roles"
          />
          <SummaryCard
            title="Pending invitations"
            value={pendingCount}
            icon={<Clock size={20} />}
            description="Awaiting activation"
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-semibold">Organization members</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search members and manage their assigned roles.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name or email"
                    aria-label="Search members"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  aria-label="Filter by role"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="All">All roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="m-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="mx-5 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
            >
              {notice} Role changes are saved to the backend.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Member</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No members match your search.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">
                            {member.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {member.name}
                            </p>
                            <p className="mt-1 text-slate-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                            member.status === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {member.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={member.role}
                          disabled={updatingId === member.id}
                          onChange={(event) =>
                            void handleRoleChange(
                              member.id,
                              event.target.value as OrganizationRole
                            )
                          }
                          aria-label={`Role for ${member.name}`}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60 ${roleStyles[member.role]}`}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                          <option value="Manager">Manager</option>
                        </select>
                        {updatingId === member.id && (
                          <span className="ml-2 text-xs text-slate-400">
                            Saving...
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {member.joinedAt && !Number.isNaN(Date.parse(member.joinedAt))
                          ? new Date(member.joinedAt).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-2 border-t border-slate-200 bg-slate-50/70 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center">
            <span>
              Showing {filteredMembers.length} of {members.length} members
            </span>
            <span>Role changes are saved to the backend.</span>
          </div>
        </section>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-blue-700" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Role-based access control
            </p>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              Role-based access control is handled by the backend.
    Organization members can manage roles according to their permissions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  description,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">{title}</span>
      <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
        {icon}
      </span>
    </div>
    <p className="text-3xl font-bold tracking-tight">{value}</p>
    <p className="mt-2 text-xs text-slate-500">{description}</p>
  </div>
);
