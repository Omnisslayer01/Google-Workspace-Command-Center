import { apiFetch } from "./apiClient";

export type OrganizationRole = "Admin" | "Manager" | "Member";
export type MembershipStatus = "Active";

export interface OrganizationMember {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: OrganizationRole;
  status: MembershipStatus;
  joinedAt: string;
}

export interface UpdateMemberRolePayload {
  role: OrganizationRole;
}

interface ApiMember {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
  created_at: string;
}

const toUiRole = (role: ApiMember["role"]): OrganizationRole => {
  const roles: Record<ApiMember["role"], OrganizationRole> = {
    admin: "Admin",
    manager: "Manager",
    member: "Member",
  };
  return roles[role];
};

const toApiRole = (role: OrganizationRole): ApiMember["role"] => {
  const roles: Record<OrganizationRole, ApiMember["role"]> = {
    Admin: "admin",
    Manager: "manager",
    Member: "member",
  };
  return roles[role];
};

const toOrganizationMember = (member: ApiMember): OrganizationMember => ({
  id: member.id,
  userId: member.user_id,
  name: member.name,
  email: member.email,
  role: toUiRole(member.role),
  status: "Active",
  joinedAt: member.created_at,
});

export async function getOrganizationMembers(
  organizationId: number
): Promise<{ success: boolean; count: number; results: OrganizationMember[] }> {
  if (!Number.isInteger(organizationId) || organizationId <= 0) {
    throw new Error(
      "A valid organization ID is required. Add ?organization_id=YOUR_ID to the page URL."
    );
  }

  const data = await apiFetch<ApiMember[]>(
    `/api/rbac/orgs/${organizationId}/members/`
  );

  return {
    success: true,
    count: data.length,
    results: data.map(toOrganizationMember),
  };
}

export async function updateOrganizationMemberRole(
  organizationId: number,
  userId: number,
  payload: UpdateMemberRolePayload
): Promise<OrganizationMember> {
  const data = await apiFetch<ApiMember>(
    `/api/rbac/orgs/${organizationId}/members/${userId}/role/`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: toApiRole(payload.role) }),
    }
  );

  return toOrganizationMember(data);
}
