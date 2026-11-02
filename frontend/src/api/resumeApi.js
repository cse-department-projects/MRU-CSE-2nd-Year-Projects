import { apiClient } from './client';

export const resumeApi = {
  async analyzeResume(resumeText, fileName) {
    return await apiClient('/api/resume/analyze', {
      body: { resumeText, fileName },
    });
  },

  async getLatestResume() {
    return await apiClient('/api/resume/latest', { method: 'GET' });
  },

  async getAllResumes() {
    return await apiClient('/api/resume/all', { method: 'GET' });
  },

  async matchJob(resumeText, jobDescription, targetJobTitle) {
    return await apiClient('/api/resume/match-job', {
      body: { resumeText, jobDescription, targetJobTitle },
    });
  },
};
