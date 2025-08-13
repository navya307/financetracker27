import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit2, Save, X, User, Mail, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    full_name: '',
    username: '',
    avatar_url: '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserProfile({
          full_name: data.full_name || '',
          username: data.username || '',
          avatar_url: data.avatar_url || '',
          email: user?.email || '',
        });
      } else {
        // Create profile if it doesn't exist
        await createProfile();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user?.id,
            full_name: user?.user_metadata?.full_name || '',
            username: user?.email?.split('@')[0] || '',
            avatar_url: '',
            email: user?.email || '',
          }
        ]);

      if (error) throw error;
      await fetchProfile();
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user?.id,
            ...userProfile,
          }
        ]);

      if (error) throw error;
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setUserProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      
      // Auto-save the new avatar
      await supabase
        .from('profiles')
        .upsert([
          {
            id: user?.id,
            ...userProfile,
            avatar_url: data.publicUrl,
          }
        ]);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserId = () => {
    return user?.id?.slice(0, 8).toUpperCase() || 'N/A';
  };

  const getMemberSince = () => {
    return user?.created_at 
      ? new Date(user.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })
      : 'Recently';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            {/* Profile Picture */}
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                  {userProfile.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              
              <label className="absolute bottom-0 right-1/2 transform translate-x-6 translate-y-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors shadow-lg">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>

            {/* Basic Info */}
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {userProfile.full_name || 'User Name'}
            </h2>
            <p className="text-sm text-blue-600 font-medium mb-1">
              @{userProfile.username || 'username'}
            </p>
            <p className="text-xs text-gray-500 mb-4">ID: {getUserId()}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <CreditCard className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Active since</p>
                <p className="text-sm font-semibold">{getMemberSince()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <Calendar className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Last login</p>
                <p className="text-sm font-semibold">Today</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
              {!editing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </motion.button>
              ) : (
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditing(false)}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={updateProfile}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </motion.button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={userProfile.full_name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile.full_name || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={userProfile.username}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    @{userProfile.username || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-600 flex items-center">
                  <Mail className="w-5 h-5 mr-3" />
                  {userProfile.email}
                  <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">Verified</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed from here. Contact support if needed.
                </p>
              </div>

              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-600 font-mono text-sm">
                  {getUserId()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This is your unique identifier in the system.
                </p>
              </div>
            </div>

            {/* Account Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-center px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Export Data
                </button>
                <button className="flex items-center justify-center px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <X className="w-5 h-5 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};