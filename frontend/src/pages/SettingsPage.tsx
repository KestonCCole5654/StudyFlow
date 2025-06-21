"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from '../hooks/useAuth';
import { format, parseISO } from "date-fns"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Separator } from "../components/ui/Separator"
import { Alert, AlertDescription } from "../components/ui/Alert"
import { Badge } from "../components/ui/Badge"
import {
  User,
  Mail,
  Lock,
  LogOut,
  Trash2,
  Calendar,
  Shield,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react"

export function SettingsPage() {
  const { user, updateEmail, updatePassword, error, setError, loading, setLoading, signOut } = useAuth()
  const [newEmail, setNewEmail] = useState(user?.email || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setLoading(true)

    if (!user) {
      setError("User not authenticated.")
      setLoading(false)
      return
    }

    if (newEmail === user.email) {
      setMessage("Email is already the same.")
      setLoading(false)
      return
    }

    try {
      await updateEmail(newEmail)
      setMessage("Email updated successfully!")
    } catch (err) {
      console.error("Error updating email:", err)
      setError(err instanceof Error ? err.message : "Failed to update email.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setLoading(true)

    if (!user) {
      setError("User not authenticated.")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      await updatePassword(newPassword)
      setMessage("Password updated successfully!")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error("Error updating password:", err)
      setError(err instanceof Error ? err.message : "Failed to update password.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action is irreversible and will permanently delete all your data.",
      )
    ) {
      console.log("Attempting to delete account...")
      alert("Account deletion initiated. (Note: Actual deletion logic needs secure server-side implementation)")
      signOut()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Account Settings</h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">Manage your account preferences and security settings</p>
        </div>

        {/* Alerts */}
        {message && (
          <Alert className="border-green-700/50 bg-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-700/50 bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:gap-6">
          {/* Profile Information */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Your account details and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg mx-auto sm:mx-0">
                    {user.email ? user.email[0].toUpperCase() : "U"}
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <div>
                      <Label className="text-xs sm:text-sm font-medium text-gray-400">Email Address</Label>
                      <p className="text-base sm:text-lg font-semibold text-white break-all">{user.email}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-400">Account Created</Label>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          <span className="text-xs sm:text-sm text-gray-300">
                            {user.created_at ? format(parseISO(user.created_at), "MMM d, yyyy") : "N/A"}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-900/50 text-green-300 border-green-700/50 text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                Email Settings
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Update your email address for account notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter your new email address"
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm sm:text-base">
                  {loading ? "Updating..." : "Update Email"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                Password & Security
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Change your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm sm:text-base">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      required
                      className="text-sm sm:text-base pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:bg-transparent hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3 h-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm sm:text-base">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                      className="text-sm sm:text-base pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:bg-transparent hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm sm:text-base">
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                Account Actions
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Manage your account access and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Logout Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-700 rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-900/50 rounded-full flex items-center justify-center">
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm sm:text-base">Sign Out</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Sign out from your account on this device</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => signOut()} disabled={loading} className="text-sm sm:text-base">
                  Sign Out
                </Button>
              </div>

              <Separator />

              {/* Delete Account Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-red-700/50 rounded-lg bg-red-900/20 space-y-3 sm:space-y-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-900/50 rounded-full flex items-center justify-center">
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm sm:text-base">Delete Account</h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading} className="text-sm sm:text-base">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}