import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      tool_name, 
      description, 
      category_id, 
      website_url, 
      features, 
      tags, 
      preview_images 
    } = body

    // 验证必填字段
    if (!tool_name || !description || !category_id || !website_url) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 验证功能特性
    if (!features || !Array.isArray(features) || features.length === 0) {
      return NextResponse.json(
        { error: '请至少添加一个功能特性' },
        { status: 400 }
      )
    }

    // 获取当前用户
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: '用户认证失败' },
        { status: 401 }
      )
    }

    // 插入提交记录
    const { data, error } = await supabase
      .from('tool_submissions')
      .insert({
        user_id: user.id,
        tool_name: tool_name.trim(),
        description: description.trim(),
        category_id: parseInt(category_id),
        website_url: website_url.trim(),
        features: features.filter((f: string) => f.trim()).slice(0, 6),
        tags: tags || [],
        preview_images: preview_images || [],
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('提交工具错误:', error)
      return NextResponse.json(
        { error: '提交失败，请重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '工具提交成功！我们会尽快审核您的提交。'
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { error: '服务器错误，请重试' },
      { status: 500 }
    )
  }
}
