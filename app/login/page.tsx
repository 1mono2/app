"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { BsMicrosoft } from "react-icons/bs"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">ログイン</CardTitle>
          <CardDescription className="text-center">
            アカウントでログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => window.location.href = '/api/auth/google'}
          >
            <FcGoogle className="w-5 h-5" />
            Googleでログイン
          </Button>
          
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => window.location.href = '/api/auth/microsoft'}
          >
            <BsMicrosoft className="w-5 h-5 text-[#00a4ef]" />
            Microsoftでログイン
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
