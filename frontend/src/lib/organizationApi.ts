
import { apiFetch } from "./apiClient";

export type OrganizationRole = "Admin" | "Manager" | "Member";
export type ApiOrganizationRole = "admin" | "manager" | "member";
export type MembershipStatus = "Active";

export interface Organization {
  id: number;
  name: string;
  created_at: string;
  role: ApiOrganizationRole;
}

export interface OrganizationMember {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: OrganizationRole;
  status: MembershipStatus;
  joinedAt: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  results: T[];
}

export interface OrganizationResponse {
  success: boolean;
  organization: Organization;
}

export interface MemberResponse {
  success: boolean;
  member: OrganizationMember;
}

export interface AddMemberPayload {
  email: string;
  role: ApiOrganizationRole;
}

export interface UpdateMemberRolePayload {
  role: OrganizationRole;
}

interface ApiMember {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: ApiOrganizationRole;
  created_at: string;
}

const toUiRole = (role: ApiOrganizationRole): OrganizationRole => {
  const roles: Record<ApiOrganizationRole, OrganizationRole> = {
    admin: "Admin",
    manager: "Manager",
    member: "Member",
  };
  return roles[role];
};

const toApiRole = (role: OrganizationRole): ApiOrganizationRole => {
  const roles: Record<OrganizationRole, ApiOrganizationRole> = {
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

export async function getOrganizations(): Promise<
  ApiListResponse<Organization>
> {
  return apiFetch<ApiListResponse<Organization>>(
    "/api/rbac/organizations/"
  );
}

export async function createOrganization(
  name: string
): Promise<OrganizationResponse> {
  return apiFetch<OrganizationResponse>("/api/rbac/organizations/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getOrganizationMembers(
  organizationId: number
): Promise<ApiListResponse<OrganizationMember>> {
  if (!Number.isInteger(organizationId) || organizationId <= 0) {
    throw new Error("A valid organization ID is required.");
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

export async function addOrganizationMember(
  organizationId: number,
  payload: AddMemberPayload
): Promise<MemberResponse> {
  const data = await apiFetch<ApiMember>(
    `/api/rbac/organizations/${organizationId}/members/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return {
    success: true,
    member: toOrganizationMember(data),
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
