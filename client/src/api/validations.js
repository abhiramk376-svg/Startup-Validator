import axiosClient from './axiosClient.js'

// Kicks off the evaluation pipeline for a submitted business model. Returns { validationId, status }
export async function createValidation(ideaDescription) {
  const { data } = await axiosClient.post('/validations', { ideaDescription })
  return data
}

// Re-runs a failed evaluation in place (same validationId). Only valid when
// status === 'failed'. Returns { validationId, status: 'pending' } — resume
// polling getValidationStatus after calling this.
export async function retryValidation(validationId) {
  const { data } = await axiosClient.post(`/validations/${validationId}/retry`)
  return data
}

// Poll this while status is 'pending' | 'researching' | 'simulating'
export async function getValidationStatus(validationId) {
  const { data } = await axiosClient.get(`/validations/${validationId}/status`)
  return data // { status, errorMessage }
}

// Full result once status === 'complete' — { title, industry, scores: {sustainability, scalability, profitability, overall}, summary, ideaDescription }
export async function getValidation(validationId) {
  const { data } = await axiosClient.get(`/validations/${validationId}`)
  return data
}

export async function getValidationEvidence(validationId) {
  const { data } = await axiosClient.get(`/validations/${validationId}/evidence`)
  return data // [{ claim, source, agentStep: 'sustainability'|'scalability'|'profitability'|'general' }]
}

export async function getValidationCharts(validationId) {
  const { data } = await axiosClient.get(`/validations/${validationId}/charts`)
  return data // { profitabilityTimelineValues, profitabilityTimelineCaption, revenueStreams, costStructure, riskOpportunityPoints, scoresDesc }
}

// Continuous Q&A — unlimited follow-up questions, scoped to one model's evaluation
export async function getChatHistory(validationId) {
  const { data } = await axiosClient.get(`/validations/${validationId}/chat`)
  return data // [{ role, content, createdAt }]
}

export async function askQuestion(validationId, question) {
  const { data } = await axiosClient.post(`/validations/${validationId}/chat`, { question })
  return data // { role: 'assistant', content, createdAt }
}