import axiosClient from './axiosClient.js'

export async function listReports({ search = '', industry = '' } = {}) {
  const { data } = await axiosClient.get('/reports', { params: { search, industry } })
  return data // [{ id, title, industry, score, date }]
}
