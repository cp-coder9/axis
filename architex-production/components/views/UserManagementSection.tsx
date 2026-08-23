'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { RoleKey } from '@/lib/types';
import { ROLES } from '@/lib/data';
import { architexApiUsers, ApiUserRecord, demoIdentity } from '@/lib/api';

interface UserManagementSectionProps {
  currentRole: RoleKey;
}

const STATUS_STYLES: Record<ApiUserRecord['status'], string> = {
  active: 'bg-green-50 text-[#218956]',
  invited: 'bg-amber-50 text-amber-700',
  disabled: 'bg-gray-100 text-[#96a0ad]',
};

export const UserManagementSection: React.FC<UserManagementSectionProps> = ({ currentRole }) => {
  const canManage = currentRole === 'admin' || currentRole === 'platform_admin';
  const identity = demoIdentity(currentRole);

  const [users, setUsers] = useState<ApiUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Invite form
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('client');
  const [inviting, setInviting] = useState(false);

  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await architexApiUsers.list(identity);
      setUsers(list);
    } catch (err: any) {
      setLoadError(err?.message || 'Could not load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [identity]);

  useEffect(() => {
    // Initial user-register load. setState here is the async fetch payload
    // (legitimate external-system sync), not a derived-state cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers();
  }, [loadUsers]);

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim() || !canManage) return;
    setInviting(true);
    try {
      const user = await architexApiUsers.invite(
        { name: inviteName.trim(), email: inviteEmail.trim(), role_key: inviteRole },
        identity,
      );
      setUsers((prev) => [user, ...prev]);
      setInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('client');
      showToast(`User "${user.name}" invited with ${inviteRole} role.`);
    } catch (err: any) {
      showToast(err?.message || 'Invite failed.');
    } finally {
      setInviting(false);
    }
  };

  const handleStatusChange = async (user: ApiUserRecord, status: ApiUserRecord['status']) => {
    if (!canManage) return;
    setBusyUserId(user.id);
    try {
      const updated = await architexApiUsers.update(user.id, { status }, identity);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u)));
      showToast(`${user.name} set to ${status}.`);
    } catch (err: any) {
      showToast(err?.message || 'Status update failed.');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleAssignRole = async (user: ApiUserRecord, roleKey: string) => {
    if (!canManage || user.roles.includes(roleKey)) return;
    setBusyUserId(user.id);
    try {
      const updated = await architexApiUsers.assignRole(user.id, roleKey, identity);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, roles: updated.roles } : u)));
      showToast(`Role ${roleKey} assigned to ${user.name}.`);
    } catch (err: any) {
      showToast(err?.message || 'Role assignment failed.');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemoveRole = async (user: ApiUserRecord, roleKey: string) => {
    if (!canManage || user.roles.length <= 1) return;
    setBusyUserId(user.id);
    try {
      const updated = await architexApiUsers.removeRole(user.id, roleKey, identity);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, roles: updated.roles } : u)));
      showToast(`Role ${roleKey} removed from ${user.name}.`);
    } catch (err: any) {
      showToast(err?.message || 'Role removal failed.');
    } finally {
      setBusyUserId(null);
    }
  };

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .map((x) => x[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <section className="space-y-4" aria-label="User management">
      {/* Header + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#DFF5F2] flex items-center justify-center text-[#167E79]">
            <OrigamiIcon name="team_workspace" size={22} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#102033]">User Management</h2>
            <p className="text-[11px] text-[#657287]">
              {canManage
                ? 'Invite team members, assign professional roles, and control access.'
                : 'View-only directory — an admin or platform_admin can manage users.'}
            </p>
          </div>
        </div>
        {canManage && (
          <button
            onClick={() => setInviteOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-[#167E79] text-white text-[11px] font-bold rounded-xl hover:bg-[#116d68] transition-colors"
          >
            <OrigamiIcon name="meeting_invite" size={15} />
            {inviteOpen ? 'Close invite' : 'Invite user'}
          </button>
        )}
      </div>

      {/* Invite form */}
      {canManage && inviteOpen && (
        <div className="bg-white border border-[#19B7B0]/25 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#657287]">
            Invite a new user
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold text-[#657287]">Full name</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Naledi Mokoena"
                className="w-full mt-1 p-2.5 bg-[#f7fbfa] border border-[#102033]/15 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold text-[#657287]">Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@practice.co.za"
                className="w-full mt-1 p-2.5 bg-[#f7fbfa] border border-[#102033]/15 rounded-xl text-xs"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10.5px] font-bold text-[#657287]">Professional role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full mt-1 p-2.5 bg-[#f7fbfa] border border-[#102033]/15 rounded-xl text-xs font-semibold text-[#102033]"
              >
                {ROLES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setInviteOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#102033] rounded-xl text-[11px] font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteName.trim() || !inviteEmail.trim()}
              className="px-4 py-2 bg-[#167E79] text-white rounded-xl text-[11px] font-bold disabled:opacity-40 hover:bg-[#116d68] transition-colors"
            >
              {inviting ? 'Sending...' : 'Send invite'}
            </button>
          </div>
        </div>
      )}

      {/* Directory table */}
      <div className="bg-white border border-[#102033]/10 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#657287]">Loading user directory...</div>
        ) : loadError ? (
          <div className="p-8 text-center space-y-2">
            <div className="text-xs font-bold text-[#b34b3e]">Could not load users</div>
            <div className="text-[11px] text-[#657287]">{loadError}</div>
            <button
              onClick={loadUsers}
              className="px-3 py-1.5 bg-[#DFF5F2] text-[#167E79] rounded-lg text-[11px] font-bold"
            >
              Retry
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5faf9] text-[10px] uppercase tracking-wider text-[#657287]">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 hidden md:table-cell">Roles</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102033]/5">
              {users.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-4 py-8 text-center text-[#96a0ad]">
                    No users found in this organisation.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#f8fbfb]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#DFF5F2] text-[#167E79] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                        {initials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#102033] truncate">{user.name}</div>
                        <div className="text-[10.5px] text-[#657287] truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] font-bold"
                        >
                          {role}
                          {canManage && user.roles.length > 1 && (
                            <button
                              onClick={() => handleRemoveRole(user, role)}
                              disabled={busyUserId === user.id}
                              className="hover:text-[#b34b3e] disabled:opacity-40"
                              title={`Remove ${role}`}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[#657287]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) handleAssignRole(user, e.target.value);
                          }}
                          disabled={busyUserId === user.id}
                          className="px-2 py-1.5 bg-[#f7fbfa] border border-[#102033]/15 rounded-lg text-[10.5px] font-semibold disabled:opacity-40"
                        >
                          <option value="">+ Add role</option>
                          {ROLES.filter((r) => !user.roles.includes(r.key)).map((r) => (
                            <option key={r.key} value={r.key}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(user, 'disabled')}
                            disabled={busyUserId === user.id}
                            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#657287] rounded-lg text-[10.5px] font-bold disabled:opacity-40"
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(user, 'active')}
                            disabled={busyUserId === user.id}
                            className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-[#218956] rounded-lg text-[10.5px] font-bold disabled:opacity-40"
                          >
                            {user.status === 'invited' ? 'Activate' : 'Re-enable'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 bottom-24 bg-[#102033] text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </section>
  );
};