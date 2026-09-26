"use client";

import { useFormState } from "react-dom";
import { adminLogin } from "@/app/admin/actions";
import { Field, Input, Button, Card, ErrorText } from "@/components/ui";

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(adminLogin, {});

  return (
    <div className="pt-10 px-5 pb-10 max-w-sm mx-auto">
      <div className="flex justify-center mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/phoenix-mark.webp" alt="Phoenix'26" className="h-14 w-auto" />
      </div>
      <h1 className="text-xl font-extrabold text-center mb-6">Admin Login</h1>
      <Card>
        <form action={formAction}>
          <Field label="Password" required>
            <Input type="password" name="password" autoComplete="current-password" required autoFocus />
          </Field>
          {state?.error && <ErrorText>{state.error}</ErrorText>}
          <div className="mt-4">
            <Button type="submit">Sign in</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
