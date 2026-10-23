import { apiFetch } from "./apiClient";

export type OrganizationRole = "admin" | "manager" | "member";

export interface Organization {
  id: number;
  name: string;
  created_at: string;
  role: OrganizationRole;
}

export interface OrganizationMember {
  id: number;
  user_id: number;
  username: string;
  email: string;
  role: OrganizationRole;
  created_at: string;
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
  role: OrganizationRole;
}

export interface UpdateMemberRolePayload {
  role: OrganizationRole;
}

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
  return apiFetch<ApiListResponse<OrganizationMember>>(
    `/api/rbac/organizations/${organizationId}/members/`
  );
}

export async function addOrganizationMember(
  organizationId: number,
  payload: AddMemberPayload
): Promise<MemberResponse> {
  return apiFetch<MemberResponse>(
    `/api/rbac/organizations/${organizationId}/members/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function updateOrganizationMemberRole(
  organizationId: number,
  membershipId: number,
  payload: UpdateMemberRolePayload
): Promise<MemberResponse> {
  return apiFetch<MemberResponse>(
    `/api/rbac/organizations/${organizationId}/members/${membershipId}/role/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}
