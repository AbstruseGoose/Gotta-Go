'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const { user, profile, isAdmin, isModerator } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (!isModerator) {
      alert('Access denied. Moderator or Admin access required.');
      router.push('/');
      return;
    }

    fetchUsers();
  }, [user, isModerator, router]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    if (!isAdmin) {
      alert('Only admins can change user roles');
      return;
    }

    if (userId === user?.id) {
      alert('You cannot change your own role');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('User role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating user role');
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || !isModerator) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              ← Back to Map
            </Link>
            <div className="h-6 w-px bg-white/20"></div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {isAdmin ? '👑' : '🛡️'}
              {isAdmin ? 'Admin Panel' : 'Moderator Panel'}
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            Logged in as {profile?.role}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-xl p-4">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-3xl mb-2">👑</div>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
            <div className="text-sm text-gray-400">Admins</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'moderator').length}</div>
            <div className="text-sm text-gray-400">Moderators</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-3xl mb-2">👤</div>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</div>
            <div className="text-sm text-gray-400">Regular Users</div>
          </div>
        </div>

        {/* User Management */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">User Management</h2>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 glass-card rounded-lg focus:ring-2 focus:ring-blue-500 bg-white/5 w-64"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-bounce">⏳</div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    {isAdmin && <th className="text-left py-3 px-4">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.full_name || 'User'}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                              👤
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">{u.full_name || 'Unnamed User'}</div>
                            {u.id === user?.id && (
                              <div className="text-xs text-blue-400">You</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            u.role === 'admin'
                              ? 'bg-red-500/20 text-red-300'
                              : u.role === 'moderator'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4">
                          {u.id !== user?.id && (
                            <select
                              value={u.role}
                              onChange={(e) =>
                                updateUserRole(u.id, e.target.value as 'user' | 'moderator' | 'admin')
                              }
                              className="px-3 py-1 glass-card rounded-lg text-sm bg-white/5"
                            >
                              <option value="user">User</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-400">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        {isAdmin && (
          <div className="mt-6 glass-card rounded-xl p-4 border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-sm">
                <p className="font-semibold mb-1">Admin Privileges</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• Promote users to moderator or admin status</li>
                  <li>• Demote moderators back to regular users</li>
                  <li>• View all user profiles and activity</li>
                  <li>• Cannot modify your own role</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
