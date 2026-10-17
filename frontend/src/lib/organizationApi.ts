
export type OrganizationRole = "Admin" | "Member" | "Viewer";
export type MembershipStatus = "Active" | "Pending";

export interface OrganizationMember {
  id: number;
  name: string;
  email: string;
  role: OrganizationRole;
  status: MembershipStatus;
  joinedAt: string;
}

export interface UpdateMemberRolePayload {
  role: OrganizationRole;
}

// Mock response format for the future BE1 RBAC API.
export interface OrganizationMembersResponse {
  success: boolean;
  count: number;
  results: OrganizationMember[];
}

const mockMembers: OrganizationMember[] = [
  {
    id: 1,
    name: "Bhavani Marbe",
    email: "bhavani@example.com",
    role: "Admin",
    status: "Active",
    joinedAt: "2026-09-01",
  },
  {
    id: 2,
    name: "Aarav Sharma",
    email: "aarav@example.com",
    role: "Member",
    status: "Active",
    joinedAt: "2026-09-05",
  },
  {
    id: 3,
    name: "Priya Patel",
    email: "priya@example.com",
    role: "Viewer",
    status: "Active",
    joinedAt: "2026-09-10",
  },
  {
    id: 4,
    name: "Rohan Kumar",
    email: "rohan@example.com",
    role: "Member",
    status: "Pending",
    joinedAt: "2026-09-15",
  },
];

const delay = (ms = 250) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function getOrganizationMembers(): Promise<OrganizationMembersResponse> {
  await delay();

  return {
    success: true,
    count: mockMembers.length,
    results: mockMembers.map((member) => ({ ...member })),
  };
}

export async function updateOrganizationMemberRole(
  memberId: number,
  payload: UpdateMemberRolePayload
): Promise<OrganizationMember> {
  await delay();

  const member = mockMembers.find((item) => item.id === memberId);

  if (!member) {
    throw new Error("Member not found.");
  }

  member.role = payload.role;

  return { ...member };
}
