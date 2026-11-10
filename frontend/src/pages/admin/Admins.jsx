import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';

const EMPTY = { name: '', email: '', phone: '', password: '', isActive: true };

export default function Admins() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.isSuperAdmin || currentUser?.role === 'superadmin' || currentUser?.email === 'np9373582301@gmail.com';
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admins', {
        params: { search, page, limit: 10 },
      });
      setAdmins(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const openAdd = () => {
    if (!isSuperAdmin) return;
    setEditItem(null);
    setForm(EMPTY);
    setShowPassword(false);
    setModal(true);
  };

  const openEdit = (a) => {
    if (!isSuperAdmin) return;
    setEditItem(a);
    setForm({
      name: a.name || '',
      email: a.email || '',
      phone: a.phone || '',
      password: '',
      isActive: a.isActive !== false,
    });
    setShowPassword(false);
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditItem(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      return toast.error('Name and email are required');
    }
    if (!editItem && (!form.password || form.password.length < 6)) {
      return toast.error('Password must be at least 6 characters');
    }

    setSaving(true);
    try {
      if (editItem) {
        const payload = {
          name: form.name,
          phone: form.phone,
          isActive: form.isActive,
        };
        if (form.password && form.password.trim()) {
          payload.password = form.password;
        }
        await api.put(`/admins/${editItem._id}`, payload);
        toast.success('Admin updated successfully');
      } else {
        await api.post('/admins', form);
        toast.success('New admin created successfully');
      }
      closeModal();
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save admin');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await api.delete(`/admins/${deleteDialog._id}`);
      toast.success('Admin deleted successfully');
      setDeleteDialog(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Administrators</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {total} Total
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage admin accounts with full permissions across DocHub
          </p>
        </div>

        {isSuperAdmin && (
          <button onClick={openAdd} className="btn-primary gap-2 self-start sm:self-auto">
            <PlusIcon className="w-5 h-5" />
            Add New Admin
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search admins by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner message="Loading administrators..." />
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={ShieldCheckIcon}
              title="No Administrators Found"
              description={search ? 'No admins matched your search query.' : isSuperAdmin ? 'Click "Add New Admin" to create one.' : 'No administrators in the system.'}
              action={isSuperAdmin ? openAdd : undefined}
              actionLabel={isSuperAdmin ? "Add Admin" : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">Admin Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  {isSuperAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((a) => {
                  const isCurrent = currentUser?.id === a._id || currentUser?._id === a._id || currentUser?.email === a.email;
                  const isSuper = a.isSuperAdmin || a.role === 'superadmin' || a.email === 'np9373582301@gmail.com';
                  return (
                    <tr key={a._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${isSuper ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300' : 'bg-primary-100 text-primary-700'} font-bold flex items-center justify-center text-sm flex-shrink-0`}>
                            {a.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <span>{a.name}</span>
                              {isSuper && (
                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                                  <span>👑</span> Super Admin
                                </span>
                              )}
                              {isCurrent && (
                                <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">
                              {isSuper ? 'Full System Control' : 'Administrator'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{a.email}</td>
                      <td className="py-3.5 px-4 text-slate-600">{a.phone || '—'}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={a.isActive !== false ? 'Active' : 'Cancelled'} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}
                      </td>
                      {isSuperAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(a)}
                              className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Admin"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteDialog(a)}
                              disabled={isCurrent || isSuper}
                              className={`p-2 rounded-lg transition-colors ${
                                isCurrent || isSuper
                                  ? 'text-slate-300 cursor-not-allowed opacity-40'
                                  : 'text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                              }`}
                              title={isSuper ? 'Super Admin cannot be deleted' : isCurrent ? 'You cannot delete your own account' : 'Delete Admin'}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Admin */}
      <Modal
        isOpen={modal}
        onClose={closeModal}
        title={editItem ? 'Edit Administrator' : 'Add New Administrator'}
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Dr. Rajesh Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Email Address *</label>
            <input
              type="email"
              required
              disabled={!!editItem}
              className={`input ${editItem ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
              placeholder="admin@dochub.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {editItem && (
              <p className="text-[11px] text-slate-400 mt-1">Email address cannot be changed.</p>
            )}
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              className="input"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="label">
              {editItem ? 'Reset Password (leave blank to keep current)' : 'Password *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required={!editItem}
                className="input pr-10"
                placeholder={editItem ? 'Enter new password' : 'At least 6 characters'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {editItem && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                Account Active
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : editItem ? 'Update Admin' : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDialog}
        title="Delete Administrator"
        message={`Are you sure you want to delete administrator "${deleteDialog?.name}" (${deleteDialog?.email})? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Admin'}
        onConfirm={handleDelete}
        onClose={() => setDeleteDialog(null)}
      />
    </div>
  );
}

