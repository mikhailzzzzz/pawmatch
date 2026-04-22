export interface AssistantResponse {
  reply: string;
  suggestions: string[];
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  text: string;
}