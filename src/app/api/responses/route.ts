import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Proxy endpoint for the OpenAI Responses API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Try to get API key from header first, then fallback to environment variable
    const userApiKey = req.headers.get("X-API-Key");
    const apiKey = userApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not provided. Please add your OpenAI API key." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const openai = new OpenAI({ apiKey });

    if (body.text?.format?.type === 'json_schema') {
      return await structuredResponse(openai, body);
    } else {
      return await textResponse(openai, body);
    }
  } catch (error) {
    console.error("Error in /responses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

async function structuredResponse(openai: OpenAI, body: any) {
  try {
    const response = await openai.responses.parse({
      ...(body as any),
      stream: false,
    });

    return NextResponse.json(response, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500, headers: CORS_HEADERS }); 
  }
}

async function textResponse(openai: OpenAI, body: any) {
  try {
    const response = await openai.responses.create({
      ...(body as any),
      stream: false,
    });

    return NextResponse.json(response, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500, headers: CORS_HEADERS });
  }
}
  