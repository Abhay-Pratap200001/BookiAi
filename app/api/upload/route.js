import { NextResponse } from "next/server";
import {handleUpload, HandleUploadBody} from '@vercel/blob/client'
import { auth } from "@clerk/nextjs/server";
import {MAX_FILE_SIZE} from '@/lib/constant'
import { blob } from "stream/consumers";

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            token: process.env.bookai_READ_WRITE_TOKEN,
            body, 
            request, 
            onBeforeGenerateToken: async()=>{
            const {userId} = await auth()
            if (!userId) {
                throw new Error("Unauthorized: User not authentication");   
            }     

            return{
                allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/webp'],
                addRandomSuffix: true,
                maximumSizeInBytes: MAX_FILE_SIZE
            }},

            onUploadCompleted: async({blob, tokenPayload}) => {
                console.log('File uploaded to blob', blob.url);
                const payload = tokenPayload ? JSON.parse(tokenPayload): null
                const userId =  payload?.userId;
            }
    })
    return NextResponse.json(jsonResponse)
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        const status =  message.includes("Unauthorized") ? 401 : 500
        return NextResponse.json({error: message}, {status})
    }
}