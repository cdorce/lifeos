import api from './api';

class LanguageService {
  async getAllLanguages() {
    const response = await api.get('/language/languages');
    return response.data.languages || [];
  }

  async getLanguageById(id) {
    const response = await api.get(`/language/languages/${id}`);
    return response.data.language;
  }

  async createLanguage(languageData) {
    const response = await api.post('/language/languages', languageData);
    return response.data.language;
  }

  async updateLanguage(id, languageData) {
    const response = await api.put(`/language/languages/${id}`, languageData);
    return response.data.language;
  }

  async deleteLanguage(id) {
    await api.delete(`/language/languages/${id}`);
  }

  async getLanguageProgress(id) {
    const response = await api.get(`/language/languages/${id}/progress`);
    return response.data.progress;
  }

  async updateProgress(id, progressData) {
    const response = await api.put(`/language/languages/${id}/progress`, progressData);
    return response.data.language;
  }

  async getCurriculum(languageId) {
    const response = await api.get(`/language/languages/${languageId}/curriculum`);
    return response.data.curriculum || [];
  }

  async createCurriculumItem(itemData) {
    const response = await api.post('/language/curriculum', itemData);
    return response.data.curriculum;
  }

  async updateCurriculumItem(id, itemData) {
    const response = await api.put(`/language/curriculum/${id}`, itemData);
    return response.data.curriculum;
  }

  async completeLesson(lessonId, data) {
    const response = await api.post(`/language/lessons/${lessonId}/complete`, data);
    return response.data;
  }
}

export default new LanguageService();