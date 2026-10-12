import { apiFetch } from './apiClient';

export interface AutomationTrigger {
  type: string;
  config?: Record<string, unknown>;
  last_polled_at?: string | null;
}

export interface AutomationCondition {
  id?: number;
  field: string;
  operator: string;
  value: string;
}

export interface AutomationAction {
  id?: number;
  type: string;
  config?: Record<string, unknown>;
  order: number;
}

export interface AutomationItem {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
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

export async function getAutomations(): Promise<AutomationItem[]> {
  const response = await apiFetch<any>('/api/automations/');
  return Array.isArray(response)
    ? response
    : Array.isArray(response?.results)
    ? response.results
    : [];
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

export async function runAutomation(
  id: number,
  triggerPayload?: Record<string, unknown>
): Promise<{ execution_id: number; status: string }> {
  return apiFetch<{ execution_id: number; status: string }>(
    `/api/automations/${id}/run/`,
    {
      method: 'POST',
      body: JSON.stringify({ trigger_payload: triggerPayload || {} }),
    }
  );
}

export async function toggleAutomation(
  id: number,
  isActive: boolean
): Promise<AutomationItem> {
  return apiFetch<AutomationItem>(
    `/api/automations/${id}/`,
    {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }
  );
}

export async function deleteAutomation(id: number): Promise<void> {
  await apiFetch<void>(
    `/api/automations/${id}/`,
    {
      method: 'DELETE',
    }
  );
}

export interface AutomationStepResult {
  id: number;
  action: string;
  status: string;
  error: string;
  executed_at: string;
}

export interface AutomationExecution {
  id: number;
  automation_id: number;
  automation_name: string;
  status:
    | 'queued'
    | 'running'
    | 'succeeded'
    | 'failed'
    | 'partially_succeeded'
    | string;
  started_at: string | null;
  finished_at: string | null;
  step_results: AutomationStepResult[];
}

export interface AutomationExecutionHistoryResponse {
  executions: AutomationExecution[];
}

export async function getAutomationExecutionHistory(): Promise<
  AutomationExecution[]
> {
  const response = await apiFetch<AutomationExecutionHistoryResponse>(
    '/api/automations/executions/'
  );

  return response.executions || [];
}