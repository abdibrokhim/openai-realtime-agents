import { NextRequest, NextResponse } from 'next/server';

// Englify API proxy route
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug.join('/');
    const baseUrl = process.env.ENGLIFY_API_URL || 'https://v2-api-erp.englifyschool.com';
    const apiToken = process.env.ENGLIFY_API_TOKEN;
    const bearerToken = process.env.ENGLIFY_BEARER_TOKEN;

    if (!apiToken) {
      return NextResponse.json({ error: 'API configuration missing' }, { status: 500 });
    }

    const url = `${baseUrl}/${slug}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'api-token': apiToken,
    };

    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const response = await fetch(url, {
      headers,
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Englify API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// Add CORS headers for client-side requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
