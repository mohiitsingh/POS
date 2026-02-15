import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Armchair } from 'lucide-react';
import { useTables, type Table } from '../../Contexts/TableContext';
import './TableManagement.css';

const TableManagement = () => {
    const { tables, addTable, updateTable, deleteTable } = useTables();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);

    // Form State
    const [tableNo, setTableNo] = useState('');
    const [isActive, setIsActive] = useState(true);

    const handleOpenModal = (table?: Table) => {
        if (table) {
            setEditingTable(table);
            setTableNo(table.tableNo);
            setIsActive(table.status === 'active');
        } else {
            setEditingTable(null);
            setTableNo('');
            setIsActive(true);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTable(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tableNo.trim()) return;

        if (editingTable) {
            updateTable(editingTable.id, {
                tableNo,
                status: isActive ? 'active' : 'inactive'
            });
        } else {
            addTable(tableNo, isActive ? 'active' : 'inactive');
        }
        handleCloseModal();
    };

    return (
        <div className="table-management-container">
            <div className="tm-header">
                <div className="tm-title">
                    <h1>Table Management</h1>
                    <p>Manage your restaurant's dining tables</p>
                </div>
                <button className="add-table-btn" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    Add Table
                </button>
            </div>

            <div className="tables-grid">
                {tables.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <Armchair size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <p>No tables added yet. Click "Add Table" to get started.</p>
                    </div>
                ) : (
                    tables.map((table) => (
                        <div key={table.id} className={`table-card ${table.status}`}>
                            <div className="table-info">
                                <h3>{table.tableNo}</h3>
                                <span className={`status-badge ${table.status}`}>
                                    {table.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="table-actions">
                                <button className="action-icon-btn" onClick={() => handleOpenModal(table)} title="Edit">
                                    <Edit2 size={18} />
                                </button>
                                <button className="action-icon-btn delete" onClick={() => deleteTable(table.id)} title="Delete">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>{editingTable ? 'Edit Table' : 'Add New Table'}</h2>
                            <button className="action-icon-btn" onClick={handleCloseModal}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Table Number / Name</label>
                                <input
                                    type="text"
                                    value={tableNo}
                                    onChange={(e) => setTableNo(e.target.value)}
                                    placeholder="e.g. T1, T2, Outdoor-1"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <div className="status-selection" style={{ display: 'flex', gap: '1rem' }}>
                                    <label className="status-toggle">
                                        <input
                                            type="radio"
                                            checked={isActive}
                                            onChange={() => setIsActive(true)}
                                        />
                                        Active
                                    </label>
                                    <label className="status-toggle">
                                        <input
                                            type="radio"
                                            checked={!isActive}
                                            onChange={() => setIsActive(false)}
                                        />
                                        Inactive
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="save-btn">{editingTable ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableManagement;
