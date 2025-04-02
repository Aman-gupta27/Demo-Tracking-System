import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Badge, Spinner, Alert } from 'react-bootstrap';
import { getBatches, createBatch, deleteBatch, updateBatch } from '../services/api';
import BatchForm from '../components/BatchForm';
import { Link } from 'react-router-dom';
import QRCodeGenerator from '../components/QRCodeGenerator';
import { Modal as ConfirmModal } from 'react-bootstrap';
import { toast } from 'react-toastify';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [registrationType, setRegistrationType] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await getBatches();

      setBatches(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch batches. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (batchData) => {
    try {
      await createBatch(batchData);
      setShowModal(false);
      fetchBatches();
    } catch (err) {
      setError('Failed to create batch. Please try again.');
      console.error(err);
    }
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setShowModal(true);
  };

  const handleUpdateBatch = async (updatedData) => {
    try {
      await updateBatch(editingBatch._id, updatedData);
      toast.success("Batch Updated successfully", {
        autoClose: 3000, 
      });
      setShowModal(false);
      setEditingBatch(null);
      fetchBatches();
    } catch (err) {
      setError('Failed to update batch. Please try again.');
      console.error(err);
    }
  };

  const handleDeleteClick = (batch) => {   
    setBatchToDelete(batch);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Deleting batch:', batchToDelete);
      const response = await deleteBatch(batchToDelete._id);
      if (response.status === 200) {
        toast.success('Batch deleted successfully');
        setShowDeleteModal(false);
        setBatchToDelete(null);
        await fetchBatches(); // Refresh the list
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete batch');
      setError('Failed to delete batch. Please try again.');
    }
  };

  const handleShowQRCode = (batch) => {
    setSelectedBatch(batch);
    setShowTypeModal(true);
  };

  const handleTypeSelection = (type) => {
    setRegistrationType(type);
    setShowTypeModal(false);
    if (type === 'walkin') {
      setShowQRModal(true);
    } else {
      // toast.info('Please collect enquiry details manually');
      setShowQRModal(true)
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date"; // Handle invalid input
    }
    
    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  };

  const generateQRValue = (batchId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/self-enroll?batchId=${batchId}&isWalkIn=${registrationType === 'walkin'}`;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Batch Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)} className="shadow">
          + Create Batch
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        batches.length === 0 ? (
          <Card className="text-center p-4 shadow-sm">
            <Card.Body>
              <Card.Title className="fw-semibold">No Batches Found</Card.Title>
              <Card.Text>Create your first batch to start tracking demo class attendance.</Card.Text>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Create Batch
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th>Batch ID</th>
                <th>Description</th>
                <th>Demo Dates</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch._id}>
                  <td className="fw-semibold " >{batch.batchId}</td>
                  <td>{batch.description}</td>
                  <td>
                    {batch.demoDates.map((date, idx) => (
                      <Badge bg="info" className="me-1 " key={idx}>
                        {formatDate(date)}
                      </Badge>
                    ))}
                  </td>
                  <td className="text-center ">
                    <Button 
                      variant="outline-warning" 
                      size="sm" 
                      className="me-2 "
                      onClick={() => handleEditBatch(batch)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleDeleteClick(batch)}
                    >
                      Delete
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleShowQRCode(batch)}
                    >
                      QR Code
                    </Button>
                    <Link to={`/enroll?batchId=${batch.batchId}`}>
                      <Button variant="outline-primary" size="sm" className="me-2">
                        Enroll
                      </Button>
                    </Link>
                    <Link to={`/reports?batchId=${batch._id}`}>
                      <Button variant="outline-info" size="sm">
                        Report
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}

      {/* Create/Edit Batch Modal */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setEditingBatch(null);
      }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingBatch ? 'Edit Batch' : 'Create New Batch'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BatchForm 
            onSubmit={editingBatch ? handleUpdateBatch : handleCreateBatch}
            initialData={editingBatch || {}}
            isEditing={!!editingBatch}
          />
        </Modal.Body>
      </Modal>

      {/* Type Selection Modal */}
      <Modal show={showTypeModal} onHide={() => setShowTypeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Registration Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-3">
            <Button 
              variant="success" 
              size="lg"
              onClick={() => handleTypeSelection('walkin')}
            >
              Walk-In Registration
            </Button>
            <Button 
              variant="info" 
              size="lg"
              onClick={() => handleTypeSelection('enquiry')}
            >
              Enquiry Registration
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* QR Code Modal */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Walk-In Registration QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedBatch && (
            <div>
              <p>Scan this QR code to register as a <strong>Walk-In</strong> student for batch <strong>{selectedBatch.batchId}</strong></p>
              <QRCodeGenerator 
                value={generateQRValue(selectedBatch.batchId)} 
                size={250} 
              />
              <p className="mt-3 small text-muted">URL: {generateQRValue(selectedBatch.batchId)}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="primary" onClick={() => window.print()}>
            Print QR Code
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <ConfirmModal.Header closeButton>
          <ConfirmModal.Title>Confirm Delete</ConfirmModal.Title>
        </ConfirmModal.Header>
        <ConfirmModal.Body>
          Are you sure you want to delete batch {batchToDelete?.batchId}? This action cannot be undone.
        </ConfirmModal.Body>
        <ConfirmModal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </ConfirmModal.Footer>
      </ConfirmModal>
    </div>
  );
};

export default BatchManagement;
