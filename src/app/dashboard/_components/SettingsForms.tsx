"use client";

/**
 * SettingsForms — client component for profile and password forms.
 * Uses React 19 useActionState with Server Actions for form submission.
 */
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  updateProfileAction,
  changePasswordAction,
  type SettingsActionState,
} from "@/app/actions/settings";

interface SettingsFormsProps {
  initialName: string;
  initialEmail: string;
}

function StatusMessage({ state }: { state: SettingsActionState }) {
  if (!state) return null;
  return (
    <div
      role="alert"
      className={[
        "rounded-lg px-4 py-3 text-sm",
        state.type === "success"
          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border border-destructive/20 bg-destructive/10 text-destructive",
      ].join(" ")}
    >
      {state.message}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <Button type="submit" className="w-full">
      {label}
    </Button>
  );
}

export function SettingsForms({ initialName, initialEmail }: SettingsFormsProps) {
  const [profileState, profileAction, profilePending] = useActionState<
    SettingsActionState,
    FormData
  >(updateProfileAction, null);

  const [passwordState, passwordAction, passwordPending] = useActionState<
    SettingsActionState,
    FormData
  >(changePasswordAction, null);

  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>

      {/* ── Profile Tab ── */}
      <TabsContent value="profile" className="mt-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your display name and email address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={profileAction} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={initialName}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={initialEmail}
                  placeholder="jane@example.com"
                  required
                />
              </div>

              <StatusMessage state={profileState} />

              <SubmitButton label={profilePending ? "Saving…" : "Save changes"} />
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Password Tab ── */}
      <TabsContent value="password" className="mt-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Enter your current password and choose a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={passwordAction} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  Current password
                </Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New password
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm new password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>

              <StatusMessage state={passwordState} />

              <SubmitButton label={passwordPending ? "Changing…" : "Change password"} />
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
