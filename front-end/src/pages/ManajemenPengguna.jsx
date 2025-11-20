import React, { useState } from 'react';
import '../styles/ManajemenPengguna.css';
import Sidebar from '../components/Sidebar';
import PenggunaForm from '../components/PenggunaForm';
import ConfirmModal from '../components/ConfirmModal';

const ManajemenPengguna = ({ onLogout }) => {
  // Sample data for users
  const [users, setUsers] = useState([
    {
      id: 'USR001',
      email: 'mthariq@gmail.com',
      username: 'mthariq',
      role: 'Admin',
      status: 'Aktif',
      lastLogin: '12/05/2025 07:00'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Semua Role');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
    userDetails: ''
  });
  const itemsPerPage = 10;

  // Function to handle edit user
  const handleEdit = (id) => {
    const userToEdit = users.find(user => user.id === id);
    setCurrentEditData(userToEdit);
    setIsModalOpen(true);
  };

  // Function to handle delete confirmation
  const handleDeleteClick = (id) => {
    const user = users.find(user => user.id === id);
    setConfirmModal({
      isOpen: true,
      userId: id,
      userDetails: `${user.username} (${user.email})`
    });
  };

  // Function to confirm delete
  const handleConfirmDelete = () => {
    setUsers(users.filter(user => user.id !== confirmModal.userId));
    setConfirmModal({ isOpen: false, userId: null, userDetails: '' });
  };

  // Function to cancel delete
  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, userId: null, userDetails: '' });
  };

  // Function to handle add or update user
  const handleSaveUser = (formData) => {
    if (currentEditData) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === formData.id ? formData : user
      ));
    } else {
      // Add new user
      const newId = `USR${String(users.length + 1).padStart(3, '0')}`;
      const newUser = {
        ...formData,
        id: newId,
        lastLogin: '-'
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
    setCurrentEditData(null);
  };

  // Function to open modal for adding new user
  const handleAddNew = () => {
    setCurrentEditData(null);
    setIsModalOpen(true);
  };

  // Filter users based on search term, role and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      Object.values(user).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesRole = selectedRole === 'Semua Role' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'Semua Status' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="main-content">
        <div className="header">
          <h1>Manajemen Pengguna</h1>
          <div className="user-info">
            <span className="date">12 May 2025, 07:41:55</span>
            <div className="admin-profile">
              <span>Admin</span>
              <div className="profile-image">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="content-header">
          <h2>Manajemen Pengguna</h2>
          <button className="add-button" onClick={handleAddNew}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Tambah Pengguna
          </button>
        </div>
        
        <div className="filters-container">
          <div className="search-container">
            <span className="search-icon">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Cari pengguna..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="dropdown-filters">
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="Semua Role">Semua Role</option>
              <option value="Admin">Admin</option>
              <option value="Kasir">Kasir</option>
              <option value="Staff">Staff</option>
            </select>
            
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
        
        <div className="table-container">
          <table className="data-table users-table">
            <thead>
              <tr>
                <th>ID User</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Terakhir Login</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.lastLogin}</td>
                  <td className="actions">
                    <button 
                      className="edit-button" 
                      onClick={() => handleEdit(user.id)}
                      title="Edit Pengguna"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDeleteClick(user.id)}
                      title="Hapus Pengguna"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length > 0 ? (
          <div className="pagination-info">
            <span>Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length} data</span>
            
            <div className="pagination-controls">
              <button 
                className="pagination-button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                </svg>
              </button>
              
              {[...Array(totalPages).keys()].map(number => (
                <button
                  key={number + 1}
                  className={`pagination-button ${currentPage === number + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(number + 1)}
                >
                  {number + 1}
                </button>
              ))}
              
              <button 
                className="pagination-button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>Tidak ada data pengguna yang ditemukan.</p>
          </div>
        )}
      </div>
      
      {/* User Form Modal */}
      <PenggunaForm 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentEditData(null);
        }}
        onSave={handleSaveUser}
        editData={currentEditData}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna "${confirmModal.userDetails}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default ManajemenPengguna;
