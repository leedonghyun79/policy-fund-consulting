import { AdminRole, LeadStatus } from "@prisma/client";

export type LeadRow = {
  id: string;
  businessName: string;
  representativeName: string | null;
  phoneRaw: string;
  addressRoad: string;
  addressDetail: string | null;
  industry: string;
  desiredAmountText: string | null;
  status: LeadStatus;
  createdAt: string;
  deletedAt?: string | null;
};

export type AdminUserRow = {
  id: string;
  name: string;
  username: string;
  role: AdminRole;
  createdAt: string;
};
