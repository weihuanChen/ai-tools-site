import { supabase } from './supabase'
import { ToolComment, ToolCommentWithUser, CommentInteraction, ToolRatingStats } from '@/types/database'

/**
 * 获取工具的评论列表
 */
export async function getToolComments(
  toolId: number,
  userId?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ comments: ToolCommentWithUser[], total: number }> {
  try {
    const offset = (page - 1) * limit

    // 获取主评论（非回复）
    const { data: comments, error, count } = await supabase
      .from('tool_comments')
      .select(`
        *,
        auth.users!inner(
          email,
          raw_user_meta_data
        )
      `)
      .eq('tool_id', toolId)
      .eq('status', 'active')
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
      .select('*', { count: 'exact' })

    if (error) throw error

    // 获取每个评论的回复
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('tool_comments')
          .select(`
            *,
            auth.users!inner(
              email,
              raw_user_meta_data
            )
          `)
          .eq('parent_id', comment.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true })

        // 获取用户互动状态
        let userHasVotedHelpful = false
        if (userId) {
          const { data: interaction } = await supabase
            .from('comment_interactions')
            .select('id')
            .eq('comment_id', comment.id)
            .eq('user_id', userId)
            .eq('interaction_type', 'helpful')
            .single()
          
          userHasVotedHelpful = !!interaction
        }

        return {
          ...comment,
          replies: replies || [],
          user_has_voted_helpful: userHasVotedHelpful
        }
      })
    )

    return {
      comments: commentsWithReplies,
      total: count || 0
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    throw error
  }
}

/**
 * 创建新评论
 */
export async function createComment(commentData: {
  tool_id: number
  user_id: string
  parent_id?: number
  rating: number
  title?: string
  content: string
  pros?: string[]
  cons?: string[]
  use_case?: string
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}): Promise<ToolComment | null> {
  try {
    const { data, error } = await supabase
      .from('tool_comments')
      .insert({
        ...commentData,
        pros: commentData.pros || [],
        cons: commentData.cons || [],
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('创建评论失败:', error)
    throw error
  }
}

/**
 * 添加评论互动（点赞、举报等）
 */
export async function addCommentInteraction(
  commentId: number,
  userId: string,
  interactionType: 'helpful' | 'not_helpful' | 'flag' | 'report',
  metadata?: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comment_interactions')
      .insert({
        comment_id: commentId,
        user_id: userId,
        interaction_type: interactionType,
        metadata: metadata || {}
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('添加评论互动失败:', error)
    throw error
  }
}

/**
 * 移除评论互动
 */
export async function removeCommentInteraction(
  commentId: number,
  userId: string,
  interactionType: 'helpful' | 'not_helpful' | 'flag' | 'report'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comment_interactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .eq('interaction_type', interactionType)

    if (error) throw error
    return true
  } catch (error) {
    console.error('移除评论互动失败:', error)
    throw error
  }
}

/**
 * 获取工具的评分统计
 */
export async function getToolRatingStats(toolId: number): Promise<ToolRatingStats | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_tool_rating_stats', { tool_id: toolId })

    if (error) throw error
    return data
  } catch (error) {
    console.error('获取评分统计失败:', error)
    // 如果RPC函数不存在，使用SQL查询
    try {
      const { data, error: sqlError } = await supabase
        .from('tool_comments')
        .select('rating')
        .eq('tool_id', toolId)
        .eq('status', 'active')

      if (sqlError) throw sqlError

      if (data && data.length > 0) {
        const ratings = data.map(item => item.rating)
        const total = ratings.length
        const average = ratings.reduce((sum, rating) => sum + rating, 0) / total
        
        return {
          tool_id: toolId,
          total_reviews: total,
          average_rating: Math.round(average * 10) / 10,
          five_star_count: ratings.filter(r => r === 5).length,
          four_star_count: ratings.filter(r => r === 4).length,
          three_star_count: ratings.filter(r => r === 3).length,
          two_star_count: ratings.filter(r => r === 2).length,
          one_star_count: ratings.filter(r => r === 1).length
        }
      }

      return {
        tool_id: toolId,
        total_reviews: 0,
        average_rating: 0,
        five_star_count: 0,
        four_star_count: 0,
        three_star_count: 0,
        two_star_count: 0,
        one_star_count: 0
      }
    } catch (fallbackError) {
      console.error('降级查询也失败:', fallbackError)
      return null
    }
  }
}

/**
 * 检查用户是否已经评论过该工具
 */
export async function checkUserHasCommented(
  toolId: number,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('tool_comments')
      .select('id')
      .eq('tool_id', toolId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .is('parent_id', null)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  } catch (error) {
    console.error('检查用户评论状态失败:', error)
    return false
  }
}

/**
 * 删除评论（仅限评论作者）
 */
export async function deleteComment(
  commentId: number,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tool_comments')
      .update({ status: 'deleted' })
      .eq('id', commentId)
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('删除评论失败:', error)
    throw error
  }
} 
