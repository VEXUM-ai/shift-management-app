/**
 * Netlify Functions 移行サンプル
 *
 * このファイルは、Vercel ServerlessからNetlify Functionsへの
 * 移行方法を示すサンプルです。
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// ストレージのインポート（パスを調整）
// import { getMembers, setMembers } from './_storage'

/**
 * Netlify Functionsのハンドラー
 *
 * 主な変更点:
 * 1. 型定義: Handler, HandlerEvent, HandlerContext を使用
 * 2. async関数として定義
 * 3. レスポンスはオブジェクト形式で返す
 */
export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // CORSヘッダー（OPTIONSリクエスト対応）
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    }
  }

  // GETリクエスト
  if (event.httpMethod === 'GET') {
    // クエリパラメータの取得
    const params = event.queryStringParameters || {}

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        status: 'ok',
        message: 'Netlify Functions is working!',
        params: params,
      }),
    }
  }

  // POSTリクエスト
  if (event.httpMethod === 'POST') {
    // リクエストボディの取得
    const body = event.body ? JSON.parse(event.body) : {}

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        status: 'ok',
        message: 'Data received',
        data: body,
      }),
    }
  }

  // PUTリクエスト
  if (event.httpMethod === 'PUT') {
    const body = event.body ? JSON.parse(event.body) : {}

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        status: 'ok',
        message: 'Data updated',
        data: body,
      }),
    }
  }

  // DELETEリクエスト
  if (event.httpMethod === 'DELETE') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        status: 'ok',
        message: 'Data deleted',
      }),
    }
  }

  // サポートされていないメソッド
  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      error: 'Method not allowed',
      method: event.httpMethod,
    }),
  }
}

/**
 * Vercel vs Netlify 対応表
 *
 * Vercel                          | Netlify
 * --------------------------------|--------------------------------
 * req.method                      | event.httpMethod
 * req.query                       | event.queryStringParameters
 * req.body                        | JSON.parse(event.body || '{}')
 * req.headers                     | event.headers
 * res.json(data)                  | return { statusCode: 200, body: JSON.stringify(data) }
 * res.status(404).json(error)     | return { statusCode: 404, body: JSON.stringify(error) }
 * res.setHeader(key, value)       | return { headers: { key: value } }
 */
