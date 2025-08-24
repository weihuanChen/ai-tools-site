"use client";
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Mail,
  CheckCircle,
} from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // 客户端验证
    if (!name.trim()) {
      setError("请输入姓名");
      setIsSubmitting(false);
      return;
    }

    if (!email.trim()) {
      setError("请输入邮箱地址");
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setError("请输入密码");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("密码长度至少6位");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      setIsSubmitting(false);
      return;
    }

    try {
      // 使用认证上下文的register方法
      const result = await register(email.trim(), password, name.trim());

      if (result.success) {
        setSuccess(
          result.error || "注册成功！请检查您的邮箱并点击确认链接完成账户激活。"
        );
        // 注册成功后清空表单字段
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
      } else {
        setError(result.error || "注册失败，请重试");
      }
    } catch (error) {
      console.error("注册错误:", error);
      setError("注册过程中发生错误，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 头部 */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI工具集</h1>
          <p className="text-gray-600">发现最新最好用的AI工具</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>用户注册</CardTitle>
            <CardDescription>填写以下信息来创建您的账户</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 姓名 */}
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="请输入您的姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* 邮箱 */}
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* 密码 */}
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入密码（至少6位）"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 确认密码 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* 错误信息 */}
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {/* 成功信息 */}
              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}

              {/* 提交按钮 */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    注册中...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    注册账户
                  </>
                )}
              </Button>
            </form>

            {/* 登录链接 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                已有账户？{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  立即登录
                </Link>
              </p>
            </div>

            {/* 说明文字 */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>注册后，您将收到一封确认邮件</p>
              <p>请点击邮件中的链接完成账户激活</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
