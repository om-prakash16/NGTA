
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || "https://32d6fdfd-4c1c-4e85-8619-3b1f4973efba-00-30oumsi2d8eiw.sisko.replit.dev";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${BACKEND_URL}/api/v1/${path}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const finalUrl = searchParams ? `${url}?${searchParams}` : url;

    console.log(`[Proxy] GET Request to: ${finalUrl}`);

    try {
        const response = await fetch(finalUrl, {
            headers: {
                // Determine headers to forward. 
                // We Explicitly DO NOT forward Origin or Referer to avoid Replit blocking.
                // We forward Accept, Content-Type.
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Optional: masquerade as backend
                'User-Agent': 'NextJS-Proxy/1.0',
            },
            cache: 'no-store',
            // method: 'GET',
        });

        console.log(`[Proxy] Upstream Response: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            console.error(`[Proxy] Upstream Error: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { error: `Upstream error: ${response.status}`, details: await response.text() },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("[Proxy] Connection Failed:", error);
        return NextResponse.json(
            { error: "Proxy connection failed", details: error.message },
            { status: 500 }
        );
    }
}

// Add POST/PUT if needed later, currently we only need GET for dashboard
