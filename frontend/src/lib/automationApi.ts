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