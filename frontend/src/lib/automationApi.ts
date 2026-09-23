import { apiFetch } from './apiClient';

export interface AutomationTrigger {
  type: string;
  config?: Record<string, unknown>;
}

export interface AutomationCondition {
  field: string;
  operator: string;
  value: string;
}

export interface AutomationAction {
  type: string;
  config?: Record<string, unknown>;
  order: number;
}

export interface CreateAutomationPayload {
  name: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
}

export interface CreateAutomationResponse {
  message: string;
  automation_id: number;
}

export async function createAutomation(
  payload: CreateAutomationPayload
): Promise<CreateAutomationResponse> {
  return apiFetch<CreateAutomationResponse>(
    '/api/automations/',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}