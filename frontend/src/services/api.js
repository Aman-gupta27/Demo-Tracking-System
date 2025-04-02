import axios from 'axios';

// https://8hlfdrfd-8000.inc1.devtunnels.ms/api
// http://localhost:8000/api

const API_BASE_URL = 'http://localhost:8000/api';

// Batch Services
export const createBatch = async (batchData) => {
  return axios.post(`${API_BASE_URL}/batches`, batchData);
};

export const getBatches = async () => {
  return axios.get(`${API_BASE_URL}/batches`);
};

export const getBatchById = async (batchId) => {
  return axios.get(`${API_BASE_URL}/batches/${batchId}`);
};

export const getBatchByBatchId = async (batchId) => {
  return axios.get(`${API_BASE_URL}/batches/code/${batchId}`);
};

export const deleteBatch = async (batchId) => {
  return axios.delete(`${API_BASE_URL}/batches/${batchId}`);
};

export const updateBatch = async (batchId, batchData) => {
  return axios.put(`${API_BASE_URL}/batches/${batchId}`, batchData);
};

// Enrollment Services
export const enrollStudent = async (enrollmentData) => {
  try {
    console.log('Sending enrollment data:', enrollmentData);
    const response = await axios.post(`${API_BASE_URL}/enrollments`, enrollmentData);
    console.log('Enrollment response:', response);
    return response;
  } catch (error) {
    console.error('Enrollment error:', error.response?.data || error);
    throw error;  
  }
};

export const getEnrollmentById = async (enrollmentId) => {
  return axios.get(`${API_BASE_URL}/enrollments/${enrollmentId}`);
};

// Attendance Services
export const markAttendance = async (qrData) => {
  return axios.post(`${API_BASE_URL}/attendance/mark`, { qrCodeData: qrData });
};

export const getAttendanceByBatch = async (batchId) => {
  return axios.get(`${API_BASE_URL}/attendance/batch/${batchId}`);
};

// Report Services
export const getBatchAttendanceStats = async (batchId) => {
  return axios.get(`${API_BASE_URL}/reports/batch/${batchId}`);
};

export const getStudentAttendanceDetails = async (enrollmentId) => {
  return axios.get(`${API_BASE_URL}/reports/student/${enrollmentId}`);
};

export const getAllBatchesStats = async () => {
  return axios.get(`${API_BASE_URL}/reports/batches`);
};

export const generateQRValue = (batchId, isWalkIn = false) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/self-enroll?batchId=${batchId}&isWalkIn=${isWalkIn}`;
};
