import React, { useState, useEffect, useCallback } from 'react';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  TrashIcon,
  EyeIcon,
  PhoneIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modal & Actions State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Resolve Dialog State
  const [resolveDialog, setResolveDialog] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolving, setResolving] = useState(false);

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contact', {
        params: { status: statusFilter, page, limit: 10 },
      });
      setInquiries(data.data || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleUpdateStatus = async (id, status, note = '') => {
    try {
      const { data } = await api.patch(`/contact/${id}`, { status, resolutionNote: note });
      toast.success(data.message || `Marked as ${status}`);
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(data.data);
      }
      fetchInquiries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleView = (item) => {
    setSelectedInquiry(item);
    setIsReplying(false);
    setReplyText('');
    if (item.status === 'Unread') {
      handleUpdateStatus(item._id, 'Read');
    }
  };

  // Submit direct email reply to patient
  const handleSendReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim()) {
      toast.error('Please enter your reply message');
      return;
    }
    if (!selectedInquiry) return;

    setSendingReply(true);
    try {
      const { data } = await api.post(`/contact/${selectedInquiry._id}/reply`, {
        replyMessage: replyText.trim(),
      });

      toast.success(`Email successfully sent to ${selectedInquiry.email}!`, {
        duration: 5000,
      });

      setSelectedInquiry(data.data);
      setIsReplying(false);
      setReplyText('');
      fetchInquiries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply email');
    } finally {
      setSendingReply(false);
    }
  };

  // Confirm and resolve inquiry with automatic email to patient
  const handleConfirmResolve = async () => {
    if (!resolveDialog) return;
    setResolving(true);
    try {
      const { data } = await api.patch(`/contact/${resolveDialog._id}`, {
        status: 'Resolved',
        resolutionNote: resolutionNote.trim(),
      });

      toast.success(`Inquiry resolved! Confirmation email sent to ${resolveDialog.email}`, {
        duration: 5000,
      });

      if (selectedInquiry && selectedInquiry._id === resolveDialog._id) {
        setSelectedInquiry(data.data);
      }
      setResolveDialog(null);
      setResolutionNote('');
      fetchInquiries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve inquiry');
    } finally {
      setResolving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await api.delete(`/contact/${deleteDialog._id}`);
      toast.success('Inquiry deleted');
      setDeleteDialog(null);
      if (selectedInquiry?._id === deleteDialog._id) {
        setSelectedInquiry(null);
      }
      fetchInquiries();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Unread') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          Unread
        </span>
      );
    }
    if (status === 'Replied') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          Replied ✉️
        </span>
      );
    }
    if (status === 'Resolved') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          Resolved ✓
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
        Read
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>Clinic Inquiries</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Messages and patient inquiries received from the Landing Page Contact Form
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="btn-secondary self-start sm:self-auto text-xs px-3 py-2"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['All', 'Unread', 'Read', 'Replied', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatusFilter(tab);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === tab
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading inquiries..." />
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={EnvelopeIcon}
            title="No inquiries found"
            subtitle="Any messages sent by visitors from the landing page contact form will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-header">Ref ID</th>
                  <th className="table-header">Sender</th>
                  <th className="table-header">Inquiry Reason</th>
                  <th className="table-header">Message Snippet</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {inquiries.map((item) => (
                  <tr
                    key={item._id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.status === 'Unread' ? 'bg-amber-50/30 font-medium' : ''
                    }`}
                  >
                    <td className="table-cell font-mono text-xs text-primary-700 font-bold">
                      {item.referenceId || 'INQ'}
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.email}</p>
                        {item.phone && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <PhoneIcon className="w-3 h-3" />
                            <span>{item.phone}</span>
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                        {item.subject}
                      </span>
                    </td>
                    <td className="table-cell max-w-xs truncate text-xs text-slate-600">
                      {item.message}
                    </td>
                    <td className="table-cell text-xs text-slate-500 whitespace-nowrap">
                      {item.createdAt ? format(new Date(item.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="table-cell text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="View & Reply"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {item.status !== 'Resolved' && (
                          <button
                            onClick={() => {
                              setResolveDialog(item);
                              setResolutionNote('');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Resolve & Email Patient"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteDialog(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />}

      {/* View & Reply Message Modal */}
      {selectedInquiry && (
        <Modal
          title={`Inquiry ${selectedInquiry.referenceId || ''}`}
          isOpen={!!selectedInquiry}
          onClose={() => {
            setSelectedInquiry(null);
            setIsReplying(false);
          }}
        >
          <div className="space-y-4">
            {/* Sender Summary Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedInquiry.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{selectedInquiry.email}</p>
                {selectedInquiry.phone && (
                  <p className="text-xs text-slate-500 mt-0.5">Phone: {selectedInquiry.phone}</p>
                )}
              </div>
              <div>{getStatusBadge(selectedInquiry.status)}</div>
            </div>

            {/* Inquiry Topic */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Inquiry Topic</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedInquiry.subject}</p>
            </div>

            {/* Patient Message */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Patient Message</p>
              <div className="mt-1 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedInquiry.message}
              </div>
            </div>

            {/* If Already Replied: Show Previous Sent Reply */}
            {selectedInquiry.replyMessage && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    <span>Clinic Reply Sent to Patient's Email ({selectedInquiry.email})</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 font-normal">
                    {selectedInquiry.repliedAt ? format(new Date(selectedInquiry.repliedAt), 'dd MMM yyyy, p') : ''}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 whitespace-pre-wrap leading-relaxed pl-5">
                  "{selectedInquiry.replyMessage}"
                </p>
                {selectedInquiry.repliedBy && (
                  <p className="text-[10px] text-emerald-700 pl-5">Sent by: {selectedInquiry.repliedBy}</p>
                )}
              </div>
            )}

            {/* If Resolved with Note: Show Resolution Note */}
            {selectedInquiry.resolutionNote && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
                <p className="font-semibold text-blue-800">Resolution Note Sent to Patient:</p>
                <p className="mt-0.5">{selectedInquiry.resolutionNote}</p>
              </div>
            )}

            <div className="text-xs text-slate-400">
              Received: {selectedInquiry.createdAt ? format(new Date(selectedInquiry.createdAt), 'PPPP, p') : '—'}
            </div>

            {/* INLINE EMAIL REPLY COMPOSER */}
            {isReplying ? (
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary-700">
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>Compose Official Email to {selectedInquiry.name} ({selectedInquiry.email})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  required
                  placeholder={`Write your detailed clinic reply to ${selectedInquiry.name}. This will be sent directly to their email inbox...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="input resize-none text-xs"
                  autoFocus
                />

                {/* Quick Snippets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">Quick text:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setReplyText(
                        `Dear ${selectedInquiry.name},\n\nThank you for reaching out to DocHub Clinic. We have availability for ${selectedInquiry.subject} this week. Please let us know your preferred date and time, or feel free to call our reception at +91 98765 43210.`
                      )
                    }
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px]"
                  >
                    + Appointment Availability
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setReplyText(
                        `Dear ${selectedInquiry.name},\n\nRegarding your inquiry about ${selectedInquiry.subject}, our consultation and procedure packages start with an initial clinical examination and diagnosis. Please visit our clinic at 102 Healthcare Plaza or call +91 98765 43210 to discuss pricing.`
                      )
                    }
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px]"
                  >
                    + Pricing & Consultation
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="btn-primary text-xs py-2 px-4 shadow-sm"
                  >
                    <PaperAirplaneIcon className="w-3.5 h-3.5" />
                    <span>{sendingReply ? 'Sending Email to Patient...' : 'Send Email to Patient'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* MODAL BOTTOM ACTION BAR */
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Reply via Email Button (Opens Composer) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplying(true);
                      if (!replyText) {
                        setReplyText(
                          `Dear ${selectedInquiry.name},\n\nThank you for contacting DocHub Clinic regarding ${selectedInquiry.subject}.\n\n`
                        );
                      }
                    }}
                    className="btn-primary text-xs py-2 px-3.5 shadow-sm"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{selectedInquiry.replyMessage ? 'Send Another Email' : 'Reply via Email'}</span>
                  </button>

                  {/* Call Patient Link */}
                  {selectedInquiry.phone && (
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      <span>Call Patient</span>
                    </a>
                  )}
                </div>

                {/* Mark as Resolved Button */}
                {selectedInquiry.status !== 'Resolved' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResolveDialog(selectedInquiry);
                      setResolutionNote('Inquiry answered and resolved by clinic staff.');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm"
                  >
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    <span>Mark as Resolved & Email Patient</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* RESOLVE CONFIRMATION DIALOG WITH AUTOMATIC PATIENT EMAIL */}
      {resolveDialog && (
        <Modal
          title={`Resolve Inquiry ${resolveDialog.referenceId}`}
          isOpen={!!resolveDialog}
          onClose={() => setResolveDialog(null)}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Resolve and Send Email to {resolveDialog.name}
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  An official resolution email will automatically be dispatched to{' '}
                  <strong className="underline">{resolveDialog.email}</strong> informing them that their inquiry has been
                  resolved.
                </p>
              </div>
            </div>

            <div>
              <label className="label text-xs">
                Resolution Note <span className="text-slate-400 font-normal">(Included in the patient's email)</span>
              </label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Discussed treatment options over call and booked an appointment for Friday."
                className="input resize-none text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolveDialog(null)}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resolving}
                onClick={handleConfirmResolve}
                className="btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>{resolving ? 'Sending Email & Resolving...' : 'Confirm & Email Patient'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteDialog && (
        <ConfirmDialog
          isOpen={!!deleteDialog}
          title="Delete Inquiry"
          message={`Are you sure you want to delete inquiry ${deleteDialog.referenceId} from ${deleteDialog.name}?`}
          confirmLabel="Delete"
          isDanger
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteDialog(null)}
        />
      )}
    </div>
  );
}
