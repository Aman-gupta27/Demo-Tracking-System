import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

const BatchForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  // Convert dates to YYYY-MM-DD format for the date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const [batchData, setBatchData] = useState({
    batchId: initialData.batchId || '',
    description: initialData.description || '',
    demoDates: initialData.demoDates 
      ? initialData.demoDates.map(date => formatDateForInput(date))
      : ['', '', ''],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBatchData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDateChange = (index, value) => {
    const newDates = [...batchData.demoDates];
    newDates[index] = value;
    setBatchData(prevData => ({
      ...prevData,
      demoDates: newDates
    }));
  };

  const addDemoDate = () => {
    if (batchData.demoDates.length < 6) {
      setBatchData(prevData => ({
        ...prevData,
        demoDates: [...prevData.demoDates, ''] 
      }));
    }
  };

  const removeDemoDate = (index) => {
    setBatchData(prevData => ({
      ...prevData,
      demoDates: prevData.demoDates.filter((_, i) => i !== index)
    }));
  };

  return (
    <Form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(batchData);
    }}>
      <Form.Group className="mb-3">
        <Form.Label>Batch ID</Form.Label>
        <Form.Control
          type="text"
          name="batchId"
          value={batchData.batchId}
          onChange={handleChange}
          placeholder="e.g., B30"
          required
          disabled={isEditing}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          type="text"
          name="description"
          value={batchData.description}
          onChange={handleChange}
          placeholder="e.g., Morning Batch - May 2023"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="d-flex justify-content-between align-items-center">
          Demo Dates
          {batchData.demoDates.length < 6 && (
            <Button 
              variant="outline-success" 
              size="sm" 
              onClick={addDemoDate}
            >
              + Add Date
            </Button>
          )}
        </Form.Label>
        {batchData.demoDates.map((date, index) => (
          <div key={index} className="d-flex mb-2">
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => handleDateChange(index, e.target.value)}
              required
            />
            {index > 2 && (
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="ms-2"
                onClick={() => removeDemoDate(index)}
              >
                ✕
              </Button>
            )}
          </div>
        ))}
      </Form.Group>

      <Button variant="primary" type="submit">
        {isEditing ? 'Update Batch' : 'Create Batch'}
      </Button>
    </Form>
  );
};

export default BatchForm;
