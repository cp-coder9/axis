'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { RoleKey } from '@/lib/types';
import { ROLES } from '@/lib/data';
import { architexApiUsers, ApiUserRecord, demoIdentity } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Card, Surface } from '@/components/ui/Surface';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';

interface UserManagementSectionProps {
  currentRole: RoleKey;
}

const STATUS_TONES: Record<ApiUserRecord['status'], StatusTone> = {
  active: 'success',
  invited: 'warning',
  disabled: 'neutral',
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
      <Surface level="inset" className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--ax-radius-sm)] bg-[var(--ax-surface-2)] text-[var(--ax-action-primary)]">
            <OrigamiIcon name="team_workspace" size={22} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--ax-text)]">User Management</h2>
            <p className="text-[var(--ax-text-muted)]">
              {canManage
                ? 'Invite team members, assign professional roles, and control access.'
                : 'View-only directory — an admin or platform_admin can manage users.'}
            </p>
          </div>
        </div>
        {canManage && (
          <Button
            onClick={() => setInviteOpen((v) => !v)}
            size="sm"
            className="gap-2"
          >
            <OrigamiIcon name="meeting_invite" size={15} />
            {inviteOpen ? 'Close invite' : 'Invite user'}
          </Button>
        )}
      </Surface>

      {/* Invite form */}
      {canManage && inviteOpen && (
        <Card level="raised" className="space-y-3">
          <div className="font-bold uppercase tracking-wider text-[var(--ax-text-muted)]">
            Invite a new user
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Full name">
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Naledi Mokoena"
                className="w-full rounded-[var(--ax-radius-sm)] border border-[var(--ax-border-strong)] bg-[var(--ax-surface-1)] p-2.5 text-[var(--ax-text)]"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@practice.co.za"
                className="w-full rounded-[var(--ax-radius-sm)] border border-[var(--ax-border-strong)] bg-[var(--ax-surface-1)] p-2.5 text-[var(--ax-text)]"
              />
            </Field>
            <div className="md:col-span-2"><Field label="Professional role">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full rounded-[var(--ax-radius-sm)] border border-[var(--ax-border-strong)] bg-[var(--ax-surface-1)] p-2.5 font-semibold text-[var(--ax-text)]"
              >
                {ROLES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field></div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleInvite}
              disabled={inviting || !inviteName.trim() || !inviteEmail.trim()}
            >
              {inviting ? 'Sending...' : 'Send invite'}
            </Button>
          </div>
        </Card>
      )}

      {/* Directory table */}
      <Surface level="raised" className="overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-[var(--ax-text-muted)]">Loading user directory...</div>
        ) : loadError ? (
          <div className="p-8 text-center space-y-2">
            <div className="font-bold text-[var(--ax-status-danger-fg)]">Could not load users</div>
            <div className="text-[var(--ax-text-muted)]">{loadError}</div>
            <Button
              variant="quiet"
              size="sm"
              onClick={loadUsers}
            >
              Retry
            </Button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[var(--ax-surface-2)] uppercase tracking-wider text-[var(--ax-text-muted)]">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 hidden md:table-cell">Roles</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ax-border)]">
              {users.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-4 py-8 text-center text-[var(--ax-text-muted)]">
                    No users found in this organisation.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--ax-surface-2)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--ax-radius-sm)] bg-[var(--ax-surface-2)] font-bold text-[var(--ax-action-primary)]">
                        {initials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-bold text-[var(--ax-text)]">{user.name}</div>
                        <div className="truncate text-[var(--ax-text-muted)]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1 rounded-[var(--ax-radius-pill)] bg-[var(--ax-surface-2)] px-2 py-0.5 font-bold text-[var(--ax-ref-violet-600)]"
                        >
                          {role}
                          {canManage && user.roles.length > 1 && (
                            <button
                              onClick={() => handleRemoveRole(user, role)}
                              disabled={busyUserId === user.id}
                              className="hover:text-[var(--ax-status-danger-fg)] disabled:opacity-40"
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
                    <StatusBadge tone={STATUS_TONES[user.status]} label={user.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--ax-text-muted)] lg:table-cell">
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
                          className="rounded-[var(--ax-radius-sm)] border border-[var(--ax-border-strong)] bg-[var(--ax-surface-1)] px-2 py-1.5 font-semibold disabled:opacity-40"
                        >
                          <option value="">+ Add role</option>
                          {ROLES.filter((r) => !user.roles.includes(r.key)).map((r) => (
                            <option key={r.key} value={r.key}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        {user.status === 'active' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusChange(user, 'disabled')}
                            disabled={busyUserId === user.id}
                          >
                            Disable
                          </Button>
                        ) : (
                          <Button
                            variant="quiet"
                            size="sm"
                            onClick={() => handleStatusChange(user, 'active')}
                            disabled={busyUserId === user.id}
                          >
                            {user.status === 'invited' ? 'Activate' : 'Re-enable'}
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Surface>

      {/* Toast */}
      {toast && (
        <Surface level="overlay" className="fixed bottom-24 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 text-[var(--ax-text)]">
          {toast}
        </Surface>
      )}
    </section>
  );
};
