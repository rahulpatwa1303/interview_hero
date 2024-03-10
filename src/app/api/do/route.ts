import { NextResponse } from "next/server"
import prisma from "../../../../prisma"


export async function GET(req: Request){

    const k = await prisma.user.findMany()
    return NextResponse.json({p:'k'})
}